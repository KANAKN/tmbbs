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

  // 質問を論理削除する処理
  const handleDelete = async () => {
    if (window.confirm('この質問を削除してもよろしいですか？この操作は元に戻せません。')) {
      const { error } = await supabase
        .from('Question')
        .update({ deleted_at: new Date().toISOString() }) // 論理削除
        .eq('id', questionId)

      if (error) {
        alert('削除中にエラーが発生しました: ' + error.message)
      } else {
        alert('質問を削除しました。')
        // トップページに遷移
        router.push('/')
        router.refresh() // ページを再読み込みして変更を反映
      }
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