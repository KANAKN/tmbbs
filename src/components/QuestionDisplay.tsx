// /Users/KN/code/tmbbs_deploy/src/components/QuestionDisplay.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import QuestionActions from '@/components/QuestionActions'
import BestAnswerButton from '@/components/BestAnswerButton'
import VoteButton from '@/components/VoteButton'
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
}

// 回答を表示するためのカードコンポーネント
function AnswerCard({
  answer,
  isBestAnswer,
  session,
  isQuestionOwner,
  question,
}: {
  answer: AnswerWithRelations
  isBestAnswer: boolean
  session: { user: User } | null
  isQuestionOwner: boolean
  question: QuestionWithRelations
}) {
  const cardClasses =
    isBestAnswer
      ? 'bg-green-50 border-2 border-green-500 shadow-lg rounded-lg p-6'
      : 'bg-white shadow-md rounded-lg p-6 border border-gray-200';

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
          targetId={answer.id}
          targetType="answer"
          initialVotes={answer.Vote[0]?.count || 0}
          initialUserVote={answer.user_votes.length > 0}
          userId={session?.user?.id}
        />
        {isQuestionOwner && !question.best_answer_id && (
          <BestAnswerButton
            questionId={question.id}
            answerId={answer.id}
          />
        )}
      </div>
    </div>
  );
}

// 質問全体を表示するメインコンポーネント
export default function QuestionDisplay({
  initialQuestion,
  initialAnswers,
  session,
  isQuestionOwner,
}: QuestionDisplayProps) {
  if (!initialQuestion) {
    return <div className="text-center p-8">質問が見つかりませんでした。</div>;
  }

  const bestAnswer = initialQuestion.bestAnswer;
  const otherAnswers = initialAnswers.filter(a => a.id !== bestAnswer?.id);

  return (
    <div className="space-y-8 mb-8">
      {/* 質問セクション */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            {initialQuestion.Category?.name &&
              <span className="inline-block bg-gray-200 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                {initialQuestion.Category.name}
              </span>
            }
            <h1 className="text-3xl font-bold text-gray-900 mt-2">{initialQuestion.title}</h1>
          </div>
          {session?.user?.id === initialQuestion.user_id && (
            <QuestionActions questionId={initialQuestion.id} />
          )}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <span>
            投稿者: {initialQuestion.User?.username || 'Anonymous'}
          </span>
          <span className="mx-2">|</span>
          <span>
            投稿日: {format(new Date(initialQuestion.created_at), 'yyyy年MM月dd日 HH:mm')}
          </span>
        </div>

        <div
          className="prose max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: initialQuestion.description?.replace(/\n/g, '<br />') || '' }}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {initialQuestion.Tag.map(tag => (
            <Link href={`/tags/${tag.name}`} key={tag.name} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200">
                {tag.name}
            </Link>
          ))}
        </div>
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
            question={initialQuestion}
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
                question={initialQuestion}
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