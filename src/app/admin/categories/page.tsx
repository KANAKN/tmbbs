// /Users/KN/code/tmbbs/src/app/admin/categories/page.tsx
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import CategoryManager from './_components/CategoryManager'
import { createClient as createServerSupabaseClient } from '@/utils/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

// ユーザーのロールを取得するヘルパー関数
async function getUserRole(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('User').select('role').eq('id', user.id).single()
  return profile?.role
}

export default async function AdminCategoriesPage() {
  const supabase = createServerSupabaseClient(cookies)
  
  // ユーザーロールを確認し、Adminでなければ404を表示
  const role = await getUserRole(supabase)
  if (role !== 'Admin') {
    return notFound()
  }

  // 既存のカテゴリ一覧を取得
  const { data: categories } = await supabase
    .from('Category')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <CategoryManager initialCategories={categories || []} />
    </div>
  )
}
