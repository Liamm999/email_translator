"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ThemeToggle from "@/components/ThemeToggle";
import { EmailRecord, getEmail } from "@/lib/db";
import { exportEmailToExcel } from "@/utils/exportToExcel";

export default function EmailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [email, setEmail] = useState<EmailRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmail();
  }, [slug]);

  const loadEmail = async () => {
    try {
      const emailData = await getEmail(slug);
      if (!emailData) {
        toast.error("Email không tồn tại");
        router.push("/");
        return;
      }
      setEmail(emailData);
    } catch (error) {
      console.error("Error loading email:", error);
      toast.error("Lỗi khi tải email");
    } finally {
      setLoading(false);
    }
  };

  const translateEmail = async () => {
    if (!email) return;

    // Kiểm tra xem đã có bản dịch chưa
    if (email.translatedText) {
      return;
    }

    try {
      const response = await fetch("/api/emails/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: email.text || email.html }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedEmail = {
          ...email,
          translatedText: data.translatedText,
        };

        // Cập nhật trong IndexedDB
        await import("@/lib/db").then(({ saveEmail }) =>
          saveEmail(updatedEmail)
        );
        setEmail(updatedEmail);
        toast.success("Đã dịch email thành công");
      } else {
        toast.error("Lỗi khi dịch email");
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Lỗi khi dịch email");
    }
  };

  const handleExportExcel = () => {
    if (!email) return;

    try {
      exportEmailToExcel(email);
      toast.success("Đã xuất file Excel thành công!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Lỗi khi xuất file Excel");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <p className="text-gray-600 dark:text-gray-400">Email không tồn tại</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen py-8 transition-colors duration-200 opacity-95">
      <div className="fixed inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-[4px] z-0"></div>
      <div className="relative z-10">
        <ThemeToggle />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hover-container mb-8">
            <button
              onClick={() => router.push("/")}
              className="flex items-center transition-colors"
            >
              <h1 className="text-xl text-neutral-800 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold explosive-text">
                ← Quay lại danh sách
              </h1>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white neon-text">
                  {email.subject}
                </h1>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-semibold">Từ:</span> {email.from}
                  </p>
                  <p>
                    <span className="font-semibold">Ngày:</span>{" "}
                    {formatDate(email.date)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportExcel}
                className="ml-4 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 text-sm transition-colors flex items-center gap-2"
                title="Xuất email và bản dịch ra file Excel"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="spin-text">Xuất Excel</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Bản gốc */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Bản gốc
                </h2>
              </div>
              <div className="prose max-w-none dark:prose-invert">
                {email.html ? (
                  <div
                    className="email-content text-gray-900 dark:text-gray-100"
                    dangerouslySetInnerHTML={{ __html: email.html }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm font-sans text-gray-900 dark:text-gray-100">
                    {email.text || "(Không có nội dung)"}
                  </pre>
                )}
              </div>
            </div>

            {/* Bản dịch */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Bản dịch (Tiếng Việt)
                </h2>
                {!email.translatedText && (
                  <button
                    onClick={translateEmail}
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 text-sm transition-colors"
                  >
                    Dịch ngay
                  </button>
                )}
              </div>
              <div className="prose max-w-none dark:prose-invert">
                {email.translatedText ? (
                  <div className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                    {email.translatedText}
                  </div>
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 italic">
                    Chưa có bản dịch. Nhấn "Dịch ngay" để dịch email này.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
