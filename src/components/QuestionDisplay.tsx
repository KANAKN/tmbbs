'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import QuestionActions from '@/components/QuestionActions'
import BestAnswerButton from '@/components/BestAnswerButton'
import CancelBestAnswerButton from '@/components/CancelBestAnswerButton'
import VoteButton from '@/components/VoteButton'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

// --- 型定義 ---
type Tag = { name: string }
type Category = { id: string; name: string }
type Profile = { id: string; username: string | null }
type Vote = { count: number }
type UserVote = { user_id: string }

type AnswerWithRelations = {
  id: string
  content: string
  created_at: string
  user_id: string
  User: Profile | null
  Vote: Vote[]
  user_votes: UserVote[]
  Question: { id: string; title: string | null } | null
}

type QuestionWithRelations = {
  id: string
  title: string
  description: string | null
  created_at: string
  user_id: string
  category_id: string | null
  best_answer_id: string | null
  User: Profile | null
  Category: Category | null
  Tag: Tag[]
  bestAnswer: AnswerWithRelations | null
}

type QuestionDisplayProps = {
  initialQuestion: QuestionWithRelations
  initialAnswers: AnswerWithRelations[]
  session: { user: User } | null
  isQuestionOwner: boolean
  categories: Category[] // カテゴリ一覧を受け取る
}

// 回答を表示するためのカードコンポーネント
function AnswerCard({ answer, isBestAnswer, session, isQuestionOwner, question }: {
  answer: AnswerWithRelations,
  isBestAnswer: boolean,
  session: { user: User } | null,
  isQuestionOwner: boolean,
  question: QuestionWithRelations,
}) {
  const cardClasses = isBestAnswer
    ? "bg-green-50 border-2 border-green-500 shadow-lg rounded-lg p-6"
    : "bg-white shadow-md rounded-lg p-6 border border-gray-200";

  const isAnswerOwner = session?.user?.id === answer.user_id

  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-start">
        <div className="text-sm text-gray-500">
          <span>回答者: {answer.User?.username || 'Anonymous'}</span>
          <span className="mx-2">|</span>
          <span>回答日: {format(new Date(answer.created_at), 'yyyy年MM月dd日 HH:mm')}</span>
        </div>
      </div>

      <div
        className="prose max-w-none mt-4 text-gray-800"
        dangerouslySetInnerHTML={{ __html: answer.content?.replace(/\n/g, '<br />') || '' }}
      />

      <div className="mt-4 flex justify-between items-center">
        <VoteButton
          answerId={answer.id}
          initialVotes={answer.Vote[0]?.count || 0}
          initialIsVoted={answer.user_votes.length > 0}
          userId={session?.user?.id}
        />
        <div className="flex items-center gap-2">
          {isBestAnswer && (isQuestionOwner || isAnswerOwner) && (
            <CancelBestAnswerButton questionId={question.id} />
          )}
          {isQuestionOwner && !question.best_answer_id && (
            <BestAnswerButton
              questionId={question.id}
              answerId={answer.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// 質問全体を表示するメインコンポーネント
export default function QuestionDisplay({ initialQuestion, initialAnswers, session, isQuestionOwner, categories }: QuestionDisplayProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [answers, setAnswers] = useState(initialAnswers)
  const [isEditing, setIsEditing] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // 編集用の状態
  const [editedTitle, setEditedTitle] = useState(question.title)
  const [editedDescription, setEditedDescription] = useState(question.description || '')
  const [editedCategoryId, setEditedCategoryId] = useState(question.category_id || '')
  const [editedTagsString, setEditedTagsString] = useState(question.Tag.map(t => t.name).join(', '))

  useEffect(() => {
    setQuestion(initialQuestion)
    setAnswers(initialAnswers)
  }, [initialQuestion, initialAnswers])

  if (!question) {
    return <div className="text-center p-8">質問が見つかりませんでした。</div>;
  }

  const handleEditClick = () => {
    // 編集開始時に現在の質問内容をフォームの初期値に設定
    setEditedTitle(question.title)
    setEditedDescription(question.description || '')
    setEditedCategoryId(question.category_id || '')
    setEditedTagsString(question.Tag.map(t => t.name).join(', '))
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // キャンセル時は元の内容に戻す（状態をリセットする必要はない）
  }

  const handleSaveEdit = async () => {
    // タグ文字列を配列に変換（空の要素はフィルタリング）
    const tagNames = editedTagsString.split(',').map(t => t.trim()).filter(t => t)

    // SupabaseのRPC（データベース関数）を呼び出す
    const { error } = await supabase.rpc('update_question_with_tags', {
      p_question_id: question.id,
      p_title: editedTitle,
      p_description: editedDescription,
      p_category_id: editedCategoryId,
      p_tag_names: tagNames,
    })

    if (error) {
      alert('質問の更新に失敗しました: ' + error.message)
    } else {
      setIsEditing(false)
      // ページをリフレッシュしてサーバーから最新のデータを取得
      router.refresh()
    }
  }

  const bestAnswer = question.bestAnswer;
  const otherAnswers = answers.filter(a => a.id !== bestAnswer?.id);

  return (
    <div className="space-y-8 mb-8">
      {/* 質問セクション */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        {isEditing ? (
          // --- 編集モード ---
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">タイトル</label>
              <input
                type="text"
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">カテゴリ</label>
              <select
                id="category"
                value={editedCategoryId}
                onChange={(e) => setEditedCategoryId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">カテゴリなし</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">内容</label>
              <textarea
                id="description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="mt-1 block w-full h-40 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">タグ</label>
              <input
                type="text"
                id="tags"
                value={editedTagsString}
                onChange={(e) => setEditedTagsString(e.target.value)}
                placeholder="カンマ区切りで入力 (例: Next.js, Supabase)"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={handleCancelEdit} className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300">キャンセル</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-sm text-white bg-teal-600 rounded hover:bg-teal-700">保存</button>
            </div>
          </div>
        ) : (
          // --- 表示モード ---
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                {question.Category?.name &&
                  <span className="inline-block bg-gray-200 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                    {question.Category.name}
                  </span>
                }
                <h1 className="text-3xl font-bold text-gray-900 mt-2">{question.title}</h1>
              </div>
              {isQuestionOwner && (
                <QuestionActions questionId={question.id} onEditClick={handleEditClick} />
              )}
            </div>

            <div className="text-sm text-gray-500 mb-4">
              <span>投稿者: {question.User?.username || 'Anonymous'}</span>
              <span className="mx-2">|</span>
              <span>投稿日: {format(new Date(question.created_at), 'yyyy年MM月dd日 HH:mm')}</span>
            </div>

            <div
              className="prose max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: question.description?.replace(/\n/g, '<br />') || '' }}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {question.Tag.map(tag => (
                <Link href={`/tags/${tag.name}`} key={tag.name} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200">
                    {tag.name}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ベストアンサーセクション */}
      {bestAnswer && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-green-600">ベストアンサー</h2>
          <AnswerCard
            answer={bestAnswer}
            isBestAnswer={true}
            session={session}
            isQuestionOwner={isQuestionOwner}
            question={question}
          />
        </div>
      )}

      {/* その他の回答セクション */}
      <div>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">
          {otherAnswers.length}件の回答
        </h2>
        <div className="space-y-6">
          {otherAnswers.length > 0 ? (
            otherAnswers.map(answer => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                isBestAnswer={false}
                session={session}
                isQuestionOwner={isQuestionOwner}
                question={question}
              />
            ))
          ) : (
            <p className="text-gray-500">まだ回答はありません。</p>
          )}
        </div>
      </div>
    </div>
  );
}
