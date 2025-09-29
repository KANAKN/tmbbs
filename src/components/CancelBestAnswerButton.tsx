'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type CancelBestAnswerButtonProps = {
  questionId: string
}

/**
 * ベストアンサー取り消しボタンのコンポーネント
 */
export default function CancelBestAnswerButton({ questionId }: CancelBestAnswerButtonProps) {
  const supabase = createClient()
  const router = useRouter()

  // ベストアンサーを取り消す処理
  const handleCancelBestAnswer = async () => {
    if (!confirm('この回答のベストアンサー設定を取り消しますか？')) {
      return
    }

    // Questionテーブルのbest_answer_idをnullに更新
    const { error } = await supabase
      .from('Question')
      .update({ best_answer_id: null })
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
      onClick={handleCancelBestAnswer}
      className="px-3 py-1 text-xs font-semibold text-white bg-gray-500 rounded-full hover:bg-gray-600"
    >
      ベストアンサーを取り消す
    </button>
  )
}
