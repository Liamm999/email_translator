"use client";

import Link from "next/link";
import { EmailRecord } from "@/lib/db";

interface EmailListProps {
  emails: EmailRecord[];
}

export default function EmailList({ emails }: EmailListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-2">
      {emails.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Chưa có email nào
        </div>
      ) : (
        emails.map((email) => (
          <Link
            key={email.id}
            href={`/emails/${email.id}`}
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white animated-text">
                  {email.subject}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {email.from}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatDate(email.date)}
                </p>
              </div>
              {email.translatedText && (
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                  Đã dịch
                </span>
              )}
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
