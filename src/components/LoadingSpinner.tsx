export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-200">
      <div className="fixed inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-[4px] z-0"></div>
      <div className="relative z-10 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
      </div>
    </div>
  );
}
