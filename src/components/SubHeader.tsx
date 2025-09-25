// /Users/KN/code/tmbbs/src/components/SubHeader.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SubHeader() {
  const pathname = usePathname()

  // TOPページではこのサブヘッダーを表示しない
  if (pathname === '/') {
    return null
  }

  return (
    <div className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-sm font-semibold text-teal-600 hover:underline">
          &larr; 質問リストへ
        </Link>
        {/* 質問投稿ボタンは各ページで管理するため削除 */}
      </div>
    </div>
  )
}
