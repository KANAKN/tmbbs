'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

// --- Type Definitions ---
type Question = {
  id: string
  title: string
  created_at: string
}
type Answer = {
  id: string
  content: string
  created_at: string
  Question: {
    id: string
    title: string | null
  } | null
}

type UserProfileTabsProps = {
  questions: Question[]
  answers: Answer[]
  votedAnswers: Answer[]
  drafts: Question[]
  isOwner: boolean
}

type Tab = 'questions' | 'answers' | 'votes' | 'drafts'

export default function UserProfileTabs({ questions, answers, votedAnswers, drafts, isOwner }: UserProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('questions')

  const renderContent = () => {
    switch (activeTab) {
      case 'questions':
        return (
          <div className="space-y-4">
            {questions.length > 0 ? (
              questions.map(q => (
                <div key={q.id} className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                  <Link href={`/questions/${q.id}`} className="text-lg font-semibold text-cyan-700 hover:underline">
                    {q.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    投稿日: {format(new Date(q.created_at), 'yyyy年MM月dd日')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">投稿した質問はありません。</p>
            )}
          </div>
        )
      case 'answers':
        return (
          <div className="space-y-4">
            {answers.length > 0 ? (
              answers.map(a => (
                <div key={a.id} className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                  <p className="text-gray-700">{a.content.substring(0, 150)}{a.content.length > 150 ? '...' : ''}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    <span>回答日: {format(new Date(a.created_at), 'yyyy年MM月dd日')} | </span>
                    <Link href={`/questions/${a.Question?.id}`} className="text-cyan-700 hover:underline">
                      「{a.Question?.title || '無題の質問'}」への回答
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">回答した投稿はありません。</p>
            )}
          </div>
        )
      case 'votes':
        return (
          <div className="space-y-4">
            {votedAnswers.length > 0 ? (
              votedAnswers.map(a => (
                <div key={a.id} className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                  <p className="text-gray-700">{a.content.substring(0, 150)}{a.content.length > 150 ? '...' : ''}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    <span>回答日: {format(new Date(a.created_at), 'yyyy年MM月dd日')} | </span>
                    <Link href={`/questions/${a.Question?.id}`} className="text-cyan-700 hover:underline">
                      「{a.Question?.title || '無題の質問'}」への回答
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">いいね👍した回答はありません。</p>
            )}
          </div>
        )
      case 'drafts':
        return (
          <div className="space-y-4">
            {drafts.length > 0 ? (
              drafts.map(d => (
                <div key={d.id} className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <Link href={`/questions/${d.id}/edit`} className="text-lg font-semibold text-cyan-700 hover:underline">
                      {d.title}
                    </Link>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      下書き
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    作成日: {format(new Date(d.created_at), 'yyyy年MM月dd日')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">下書きはありません。</p>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const getTabClass = (tabName: Tab) => {
    return activeTab === tabName
      ? 'px-4 py-2 font-semibold text-white bg-teal-600 rounded-md'
      : 'px-4 py-2 font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md'
  }

  return (
    <div>
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-2" aria-label="Tabs">
          <button onClick={() => setActiveTab('questions')} className={getTabClass('questions')}>
            投稿した質問 ({questions.length})
          </button>
          <button onClick={() => setActiveTab('answers')} className={getTabClass('answers')}>
            回答した投稿 ({answers.length})
          </button>
          <button onClick={() => setActiveTab('votes')} className={getTabClass('votes')}>
            いいね👍した回答 ({votedAnswers.length})
          </button>
          {isOwner && (
            <button onClick={() => setActiveTab('drafts')} className={getTabClass('drafts')}>
              質問下書き ({drafts.length})
            </button>
          )}
        </nav>
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  )
}