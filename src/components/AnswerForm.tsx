'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

import Link from 'next/link' // Linkをインポート

type AnswerFormProps = {
  questionId: string
  userId?: string | null // nullも許容するように変更
  isQuestionOwner?: boolean
}

export default function AnswerForm({ questionId, userId, isQuestionOwner }: AnswerFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ★★★★★ 安全装置を追加 ★★★★★
    // userIdが存在しない場合は、処理を中断してエラーを表示
    if (!userId) {
      alert('ユーザー情報が取得できませんでした。再度ログインしてください。')
      return
    }
    // ★★★★★ ここまで ★★★★★

    if (!content.trim()) {
      alert('内容を入力してください。')
      return
    }
    setLoading(true)

    const { error } = await supabase
      .from('Answer')
      .insert({
        content,
        question_id: questionId,
        user_id: userId,
      })

    setLoading(false)
    if (error) {
      alert(`エラーが発生しました: ${error.message}`)
    } else {
      setContent('') // フォームをクリア
      router.refresh() // ページを再読み込みして新しい回答を表示
    }
  }

  // ログインしていないユーザー向けの表示
  if (!userId) {
    return (
      <div className="mt-8 p-4 border-t border-slate-200">
        <p className="text-center text-slate-600">
          {isQuestionOwner ? 'コメントを追記するには' : '回答を投稿するには'}
          <Link href="/login" className="text-teal-600 hover:underline font-semibold ml-1">
            ログイン
          </Link>
          が必要です。
        </p>
      </div>
    )
  }

  // ログイン済みユーザー向けのフォーム表示
  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <h3 className="text-lg font-semibold mb-2 text-slate-800">
        {isQuestionOwner ? 'コメントを追記' : '回答を投稿'}
      </h3>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={5}
          className="w-full px-3 py-2 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder={isQuestionOwner ? '補足説明やコメントを追記...' : '回答を入力してください...'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
          >
            {loading ? '投稿中...' : (isQuestionOwner ? 'コメントする' : '回答を投稿する')}
          </button>
        </div>
      </form>
    </div>
  )
}
