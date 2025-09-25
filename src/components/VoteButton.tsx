'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type VoteButtonProps = {
  answerId: string
  userId?: string
  initialVotes: number
  initialIsVoted: boolean // 新しいプロパティ
}

// いいねボタンのコンポーネント
export default function VoteButton({ answerId, userId, initialVotes, initialIsVoted }: VoteButtonProps) {
  const supabase = createClient()
  const router = useRouter()
  const [votes, setVotes] = useState(initialVotes)
  // useEffectを削除し、サーバーから渡された初期値でstateを初期化
  const [isVoted, setIsVoted] = useState(initialIsVoted)

  // いいね処理
  const handleVote = async () => {
    if (!userId) {
      alert('いいねするにはログインが必要です。')
      return
    }

    if (isVoted) {
      // いいねを取り消す
      const { error } = await supabase
        .from('Vote')
        .delete()
        .eq('answer_id', answerId)
        .eq('user_id', userId)
      
      if (error) {
        alert(`エラーが発生しました: ${error.message}`)
      } else {
        setVotes(votes - 1)
        setIsVoted(false)
      }
    } else {
      // いいねする
      const { error } = await supabase
        .from('Vote')
        .insert({ answer_id: answerId, user_id: userId, type: 'Upvote' })
      
      if (error) {
        alert(`エラーが発生しました: ${error.message}`)
      } else {
        setVotes(votes + 1)
        setIsVoted(true)
      }
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={!userId} // loading stateを削除
      className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-full transition-colors
        ${
          isVoted
            ? 'bg-teal-600 text-white'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }
        ${!userId ? 'cursor-not-allowed' : ''}
      `}
    >
      <span>👍</span>
      <span>{votes}</span>
    </button>
  )
}
