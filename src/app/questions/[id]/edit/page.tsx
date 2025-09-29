import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditQuestionForm from './_components/EditQuestionForm'

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  // ログイン中のユーザー情報を取得
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // 質問の詳細情報を取得
  const { data: question, error: questionError } = await supabase
    .from('Question')
    .select(`
      id,
      title,
      description,
      user_id,
      category_id,
      is_draft,
      Category(id, name),
      Tag(name)
    `)
    .eq('id', id)
    .single()

  if (questionError || !question) {
    notFound()
  }

  // 質問の所有者かどうかを確認
  if (question.user_id !== session.user.id) {
    redirect('/')
  }

  // カテゴリの一覧を取得
  const { data: categories } = await supabase
    .from('Category')
    .select('id, name')
    .order('name', { ascending: true })

  // タグを文字列に変換
  const tagsString = question.Tag?.map(tag => tag.name).join(', ') || ''

  // 型を変換してEditQuestionFormに渡す
  const formattedQuestion = {
    id: question.id,
    title: question.title,
    description: question.description,
    user_id: question.user_id,
    category_id: question.category_id,
    is_draft: question.is_draft,
    Category: question.Category?.[0] || null,
    Tag: question.Tag || []
  }

  return (
    <EditQuestionForm
      question={formattedQuestion}
      categories={categories || []}
      tagsString={tagsString}
      user={session.user}
    />
  )
}
