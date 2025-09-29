'use client'

import { format } from 'date-fns'

type Category = { id: string; name: string }

type QuestionPreviewProps = {
  title: string
  description: string
  categoryId: string
  tags: string
  categories: Category[]
  onEdit: () => void
  onConfirm: () => void
  loading: boolean
}

export default function QuestionPreview({
  title,
  description,
  categoryId,
  tags,
  categories,
  onEdit,
  onConfirm,
  loading
}: QuestionPreviewProps) {
  const selectedCategory = categories.find(cat => cat.id === categoryId)
  const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">質問のプレビュー</h1>
          <p className="text-gray-600">以下の内容で投稿されます。確認して問題なければ「投稿する」ボタンを押してください。</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          {/* 質問タイトル */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
          
          {/* メタ情報 */}
          <div className="flex items-center flex-wrap text-sm text-gray-500 mb-4 gap-x-4 gap-y-2">
            <span>投稿日時: {format(new Date(), 'yyyy年MM月dd日 HH:mm')}</span>
            <span>|</span>
            <span>カテゴリ:</span>
            {selectedCategory ? (
              <span className="font-semibold text-teal-800 bg-teal-100 px-2 py-1 rounded-md text-xs">
                {selectedCategory.name}
              </span>
            ) : (
              <span className="text-xs">未選択</span>
            )}
            
            {tagList.length > 0 && (
              <>
                <span>|</span>
                <div className="flex items-center gap-2">
                  <span>タグ:</span>
                  {tagList.map(tag => (
                    <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 質問内容 */}
          <div className="prose max-w-none">
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onEdit}
            disabled={loading}
            className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-100"
          >
            編集に戻る
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </div>
    </div>
  )
}
