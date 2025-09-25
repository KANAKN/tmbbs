// /Users/KN/code/tmbbs/src/components/QuestionActions.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type QuestionActionsProps = {
  questionId: string
  onEditClick: () => void // 編集ボタンがクリックされたことを親に通知
}

export default function QuestionActions({ questionId, onEditClick }: QuestionActionsProps) {
  const supabase = createClient()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('本当にこの質問を削除しますか？関連する回答もすべて削除されます。')) {
      return
    }
    setIsDeleting(true)
    const { error } = await supabase.from('Question').delete().eq('id', questionId)
    if (error) {
      alert(`削除中にエラーが発生しました: ${error.message}`)
      setIsDeleting(false)
    } else {
      alert('質問を削除しました。')
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onEditClick} // 親の関数を呼び出す
        className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
      >
        編集
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-red-300"
      >
        {isDeleting ? '削除中...' : '削除'}
      </button>
    </div>
  )
}