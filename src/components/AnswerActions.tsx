// /Users/KN/code/tmbbs/src/components/AnswerActions.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type AnswerActionsProps = {
  answerId: string
  currentContent: string
  onAnswerUpdate: (newContent: string) => void
}

export default function AnswerActions({ answerId, currentContent, onAnswerUpdate }: AnswerActionsProps) {
  const supabase = createClient()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(currentContent)

  // 回答を削除する処理
  const handleDelete = async () => {
    if (!confirm('本当にこの回答を削除しますか？')) {
      return
    }
    setIsDeleting(true)

    // Supabaseから回答を削除
    const { error } = await supabase.from('Answer').delete().eq('id', answerId)

    if (error) {
      console.error('Answer deletion error:', error) // 詳細なエラーをコンソールに出力
      alert(`削除中にエラーが発生しました: ${error.message}`)
      setIsDeleting(false)
    } else {
      // 成功したらページをリフレッシュして表示を更新
      router.refresh()
    }
  }

  // 回答を更新する処理
  const handleUpdate = async () => {
    const { data, error } = await supabase
      .from('Answer')
      .update({ content })
      .eq('id', answerId)
      .select()
      .single()

    if (error) {
      alert(`更新中にエラーが発生しました: ${error.message}`)
    } else {
      onAnswerUpdate(data.content)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="w-full mt-2">
        <textarea
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg"
        />
        <div className="flex justify-end space-x-2 mt-2">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md">キャンセル</button>
          <button onClick={handleUpdate} className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md">保存する</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setIsEditing(true)}
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
