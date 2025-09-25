// /Users/KN/code/tmbbs/src/app/questions/new/_components/NewQuestionForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

type Category = { id: string; name: string }
type NewQuestionFormProps = {
  user: User
  categories: Category[]
}

export default function NewQuestionForm({ user, categories }: NewQuestionFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!categoryId) {
      setError('カテゴリを選択してください。')
      setLoading(false)
      return
    }

    const { data: newQuestion, error: insertError } = await supabase
      .from('Question')
      .insert({ title, description, user_id: user.id, category_id: categoryId })
      .select()
      .single()

    if (insertError) {
      setError(`エラーが発生しました: ${insertError.message}`)
      setLoading(false)
      return
    }

    if (newQuestion && tags.trim()) {
      const { error: tagsError } = await supabase.rpc('handle_question_tags', {
        p_question_id: newQuestion.id,
        p_tag_names: tags,
      })
      if (tagsError) {
        console.error('タグの処理中にエラーが発生しました:', tagsError)
      }
    }
    
    setLoading(false)
    router.push(`/questions/${newQuestion.id}`)
    router.refresh()
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">新しい質問を投稿する</h1>
        <form onSubmit={handlePostQuestion} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-gray-700 border rounded-lg"
              placeholder="質問のタイトルを簡潔に入力してください"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              内容
            </label>
            <textarea
              id="description"
              rows={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 text-gray-700 border rounded-lg"
              placeholder="質問の背景、試したこと、エラーメッセージなどを具体的に記述してください"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-3 py-2 text-gray-700 border rounded-lg"
            >
              <option value="" disabled>カテゴリを選択してください</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              技術タグ (カンマ区切りで5つまで)
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg"
              placeholder="例: React, Next.js, TypeScript"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? '投稿中...' : '投稿する'}
          </button>
        </form>
      </div>
    </div>
  )
}
