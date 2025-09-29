'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Category = {
  id: string
  name: string
}

type Tag = {
  id: number
  name: string
}

type SearchFormProps = {
  categories: Category[]
  topTags: Tag[]
}

export default function SearchForm({ categories, topTags }: SearchFormProps) {
  const [keyword, setKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const router = useRouter()

  // キーワードとカテゴリでの検索処理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword) {
      params.set('keyword', keyword)
    }
    if (selectedCategory) {
      params.set('category', selectedCategory)
    }
    
    // 検索パラメータがある場合のみページ遷移
    if (params.toString()) {
      router.push(`/search?${params.toString()}`)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="search-keyword" className="sr-only">キーワード検索</label>
          <input
            id="search-keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="キーワードで検索..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label htmlFor="search-category" className="sr-only">カテゴリ</label>
          <select
            id="search-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">すべてのカテゴリ</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 font-bold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 shadow-md transition-colors"
        >
          検索する
        </button>
      </form>

      {/* 人気のタグを表示するセクション */}
      {topTags && topTags.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-slate-600 mb-3 text-center">人気のタグから探す</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {topTags.map(tag => (
              <Link
                href={`/search?tag=${encodeURIComponent(tag.name)}`}
                key={tag.id}
                className="px-3 py-1 text-sm font-medium text-teal-800 bg-teal-100 rounded-full hover:bg-teal-200 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
