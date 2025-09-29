import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { cookies } from 'next/headers'

type SearchResult = {
  id: string
  title: string
  description: string | null
  created_at: string
  User: {
    id: string
    username: string | null
  } | null
  Category: {
    id: string
    name: string
  } | null
  Tag: {
    name: string
  }[]
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string; category?: string; tag?: string }>
}) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams
  const { keyword, category, tag } = resolvedSearchParams

  let query = supabase
    .from('Question')
    .select('*, User(id, username), Category(id, name), Tag(name)')
    .is('deleted_at', null)
    .or('is_draft.is.null,is_draft.eq.false')

  // キーワードでの検索（タイトルと説明文から検索）
  if (keyword) {
    query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
  }

  // カテゴリでの絞り込み
  if (category) {
    query = query.eq('category_id', category)
  }

  // タグでの絞り込み（サブクエリを使用）
  if (tag) {
    // タグ名からタグIDを取得
    const { data: tagData } = await supabase
      .from('Tag')
      .select('id')
      .eq('name', tag)
      .single()
    
    if (tagData) {
      // そのタグIDを持つ質問IDを取得
      const { data: questionTags } = await supabase
        .from('QuestionTag')
        .select('question_id')
        .eq('tag_id', tagData.id)
      
      if (questionTags && questionTags.length > 0) {
        const questionIds = questionTags.map(qt => qt.question_id)
        query = query.in('id', questionIds)
      } else {
        // タグが見つからない場合は空の結果を返す
        query = query.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    }
  }

  const { data: questions, error } = await query
    .order('created_at', { ascending: false })
    .returns<SearchResult[]>()

  const searchTitle = [keyword, tag].filter(Boolean).join(' and ') || 'すべての質問'
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          検索結果: <span className="text-cyan-600">{searchTitle}</span>
        </h1>
        {category && questions && questions[0]?.Category?.name && (
          <p className="text-lg text-gray-600 mt-1">
            カテゴリ: {questions[0].Category.name}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {questions && questions.length > 0 ? (
          questions.map(question => (
            <div key={question.id} className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
              <Link href={`/questions/${question.id}`}>
                <h2 className="text-xl font-semibold text-slate-800 hover:text-teal-600">{question.title}</h2>
              </Link>
              <div className="flex items-center flex-wrap text-sm text-slate-500 mt-2 gap-x-3 gap-y-2">
                <span>投稿者:</span>
                <Link href={`/users/${question.User?.id}`} className="text-teal-600 hover:underline">
                  {question.User?.username || '匿名'}
                </Link>
                <span>|</span>
                <span>投稿日時: {format(new Date(question.created_at), 'yyyy年MM月dd日')}</span>
                <span>|</span>
                <span>カテゴリ:</span>
                {question.Category ? (
                  <span className="font-semibold text-teal-800 bg-teal-100 px-2 py-1 rounded-md text-xs">
                    {question.Category.name}
                  </span>
                ) : (
                  <span className="text-xs">未分類</span>
                )}
                
                {question.Tag && question.Tag.length > 0 && (
                  <>
                    <span>|</span>
                    <div className="flex items-center gap-2">
                      <span>タグ:</span>
                      {question.Tag.map(t => (
                        <Link href={`/search?tag=${encodeURIComponent(t.name)}`} key={t.name} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-300">
                          {t.name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-500">検索条件に一致する質問は見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
  )
}