"use client";

interface EmailSearchProps {
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  resultCount: number;
  totalCount: number;
}

export default function EmailSearch({
  searchKeyword,
  onSearchChange,
  resultCount,
  totalCount,
}: EmailSearchProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-6 transition-colors duration-200">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tìm kiếm email
          </label>
          <div className="flex sm:flex-row flex-col items-center gap-4">
            <div className="w-full relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-[42px] px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder='Tìm theo tiêu đề, người gửi, nội dung... (dùng "cụm từ" để tìm chính xác)'
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchKeyword && (
              <button
                onClick={() => onSearchChange("")}
                className="w-max min-w-[120px] h-[42px] px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>
      {searchKeyword && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Tìm thấy <span className="font-semibold">{resultCount}</span> email
          {resultCount !== totalCount && (
            <span> trong tổng số {totalCount} email</span>
          )}
        </p>
      )}
    </div>
  );
}
