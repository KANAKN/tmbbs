// /Users/KN/code/tmbbs/src/app/questions/new/page.tsx
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import NewQuestionForm from './_components/NewQuestionForm'

export default async function NewQuestionPage() {
  const supabase = createClient(cookies)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // カテゴリの一覧をデータベースから取得
  const { data: categories } = await supabase
    .from('Category')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <NewQuestionForm
      user={session.user}
      categories={categories || []}
    />
  )
}
