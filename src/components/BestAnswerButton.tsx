'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type BestAnswerButtonProps = {
  questionId: string
  answerId: string
}

// ベストアンサー設定ボタンのコンポーネント
export default function BestAnswerButton({ questionId, answerId }: BestAnswerButtonProps) {
  const supabase = createClient()
  const router = useRouter()

  // ベストアンサーに設定する処理
  const handleSetBestAnswer = async () => {
    if (!confirm('この回答をベストアンサーに設定しますか？')) {
      return
    }

    // Questionテーブルのbest_answer_idを更新
    const { error } = await supabase
      .from('Question')
      .update({ best_answer_id: answerId })
      .eq('id', questionId)

    if (error) {
      alert(`エラー: ${error.message}`)
    } else {
      // ページをリフレッシュして表示を更新
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleSetBestAnswer}
      className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full hover:bg-green-600"
    >
      ベストアンサーに選ぶ
    </button>
  )
}
