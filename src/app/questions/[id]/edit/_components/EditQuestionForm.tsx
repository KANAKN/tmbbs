'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

type Category = { id: string; name: string }

type Question = {
  id: string
  title: string
  description: string
  user_id: string
  category_id: string | null
  is_draft: boolean
  Category: { id: string; name: string } | null
  Tag: { name: string }[]
}

type EditQuestionFormProps = {
  question: Question
  categories: Category[]
  tagsString: string
  user: User
}

export default function EditQuestionForm({ question, categories, tagsString, user }: EditQuestionFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [title, setTitle] = useState(question.title)
  const [description, setDescription] = useState(question.description)
  const [categoryId, setCategoryId] = useState(question.category_id || '')
  const [tags, setTags] = useState(tagsString)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!categoryId) {
      setError('カテゴリを選択してください。')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('Question')
      .update({ 
        title, 
        description, 
        category_id: categoryId,
        is_draft: false // 公開投稿
      })
      .eq('id', question.id)

    if (updateError) {
      setError(`エラーが発生しました: ${updateError.message}`)
      setLoading(false)
      return
    }

    // タグを更新
    if (tags.trim()) {
      const { error: tagsError } = await supabase.rpc('handle_question_tags', {
        p_question_id: question.id,
        p_tag_names: tags,
      })
      if (tagsError) {
        console.error('タグの処理中にエラーが発生しました:', tagsError)
      }
    }
    
    setLoading(false)
    router.push(`/questions/${question.id}`)
  }

  const handleSaveDraft = async () => {
    setError('')
    setSavingDraft(true)

    const { error: updateError } = await supabase
      .from('Question')
      .update({ 
        title, 
        description, 
        category_id: categoryId || null,
        is_draft: true // 下書きとして保存
      })
      .eq('id', question.id)

    if (updateError) {
      setError(`エラーが発生しました: ${updateError.message}`)
      setSavingDraft(false)
      return
    }

    // タグを更新
    if (tags.trim()) {
      const { error: tagsError } = await supabase.rpc('handle_question_tags', {
        p_question_id: question.id,
        p_tag_names: tags,
      })
      if (tagsError) {
        console.error('タグの処理中にエラーが発生しました:', tagsError)
      }
    }
    
    setSavingDraft(false)
    alert('下書きを保存しました。')
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">
          {question.is_draft ? '下書きを編集する' : '質問を編集する'}
        </h1>
        <form onSubmit={handleUpdateQuestion} className="space-y-6">
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
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || savingDraft}
              className="flex-1 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? '更新中...' : question.is_draft ? '投稿する' : '更新する'}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading || savingDraft}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-100"
            >
              {savingDraft ? '保存中...' : '下書き保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
