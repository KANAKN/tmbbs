'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type PaginationProps = {
  currentPage: number
  totalPages: number
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams()

  // ページ番号以外のクエリパラメータを維持するための関数
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `/?${params.toString()}`
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav className="flex justify-center items-center space-x-2 mt-8">
      {/* Previous Button */}
      <Link
        href={createPageURL(currentPage - 1)}
        className={`px-4 py-2 border rounded-md text-sm font-medium ${
          currentPage === 1 ? 'bg-gray-100 text-gray-400 pointer-events-none' : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        aria-disabled={currentPage === 1}
      >
        前へ
      </Link>

      {/* Page Numbers */}
      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next Button */}
      <Link
        href={createPageURL(currentPage + 1)}
        className={`px-4 py-2 border rounded-md text-sm font-medium ${
          currentPage === totalPages ? 'bg-gray-100 text-gray-400 pointer-events-none' : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        aria-disabled={currentPage === totalPages}
      >
        次へ
      </Link>
    </nav>
  )
}
