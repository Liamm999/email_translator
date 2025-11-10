"use client";

import { EmailRecord } from "@/lib/db";

interface StatisticsProps {
  emails: EmailRecord[];
}

export default function Statistics({ emails }: StatisticsProps) {
  const totalEmails = emails.length;

  // Thống kê theo người gửi
  const senderStats = emails.reduce((acc, email) => {
    const sender = email.from;
    acc[sender] = (acc[sender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSenders = Object.entries(senderStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Thống kê theo ngày
  const dateStats = emails.reduce((acc, email) => {
    const date = new Date(email.date).toLocaleDateString("vi-VN");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentDates = Object.entries(dateStats)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 7);

  const translatedCount = emails.filter((e) => e.translatedText).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Tổng số email */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Tổng số email
        </h3>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {totalEmails}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {translatedCount} đã dịch (
          {totalEmails > 0
            ? Math.round((translatedCount / totalEmails) * 100)
            : 0}
          %)
        </p>
      </div>

      {/* Top người gửi */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
          Top người gửi
        </h3>
        <div className="space-y-2">
          {topSenders.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Chưa có dữ liệu
            </p>
          ) : (
            topSenders.map(([sender, count]) => (
              <div key={sender} className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                  {sender}
                </span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Thống kê theo ngày */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
          Email theo ngày (7 ngày gần nhất)
        </h3>
        <div className="space-y-2">
          {recentDates.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Chưa có dữ liệu
            </p>
          ) : (
            recentDates.map(([date, count]) => (
              <div key={date} className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {date}
                </span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
