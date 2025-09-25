// /Users/KN/code/tmbbs/src/app/admin/categories/_components/CategoryManager.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Category = {
  id: string
  name: string
}

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(false)

  // 新規カテゴリ作成
  const handleCreate = async () => {
    if (!newName.trim()) return
    setLoading(true)
    const { data, error } = await supabase.from('Category').insert({ name: newName }).select().single()
    if (error) {
      alert(error.message)
    } else {
      setCategories([...categories, data])
      setNewName('')
    }
    setLoading(false)
  }

  // カテゴリ削除
  const handleDelete = async (id: string) => {
    if (!confirm('本当にこのカテゴリを削除しますか？')) return
    const { error } = await supabase.from('Category').delete().eq('id', id)
    if (error) {
      alert(error.message)
    } else {
      setCategories(categories.filter(c => c.id !== id))
    }
  }

  // カテゴリ更新
  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return
    const { data, error } = await supabase.from('Category').update({ name: editingName }).eq('id', id).select().single()
    if (error) {
      alert(error.message)
    } else {
      setCategories(categories.map(c => c.id === id ? data : c))
      setEditingId(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">カテゴリ管理</h1>
      
      {/* 新規作成フォーム */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="新しいカテゴリ名"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-grow px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500"
        />
        <button onClick={handleCreate} disabled={loading} className="px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-teal-400">
          作成
        </button>
      </div>

      {/* カテゴリ一覧 */}
      <div className="space-y-2">
        {categories.map(category => (
          <div key={category.id} className="flex items-center justify-between p-2 border border-slate-200 rounded-md">
            {editingId === category.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="flex-grow px-2 py-1 border rounded-md"
              />
            ) : (
              <span className="text-slate-800">{category.name}</span>
            )}
            <div className="flex gap-2">
              {editingId === category.id ? (
                <>
                  <button onClick={() => handleUpdate(category.id)} className="text-sm text-teal-600 hover:text-teal-800">保存</button>
                  <button onClick={() => setEditingId(null)} className="text-sm text-slate-600 hover:text-slate-800">キャンセル</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditingId(category.id); setEditingName(category.name); }} className="text-sm text-teal-600 hover:text-teal-800">編集</button>
                  <button onClick={() => handleDelete(category.id)} className="text-sm text-red-600 hover:text-red-800">削除</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
