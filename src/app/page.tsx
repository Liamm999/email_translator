"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import EmailList from "@/components/EmailList";
import Statistics from "@/components/Statistics";
import LoginForm from "@/components/LoginForm";
import EmailSearch from "@/components/EmailSearch";
import LoadingSpinner from "@/components/LoadingSpinner";
import ThemeToggle from "@/components/ThemeToggle";
import { useEmailConfig } from "@/hooks/useEmailConfig";
import { useEmailFetch } from "@/hooks/useEmailFetch";
import { filterEmails } from "@/utils/emailFilter";
import { EmailRecord, getAllEmails } from "@/lib/db";

export default function Home() {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {
    emailConfig,
    setEmailConfig,
    hasSavedConfig,
    clearSavedConfig,
    autoSaveConfig,
  } = useEmailConfig();

  // Load emails khi component mount
  const loadEmails = async () => {
    try {
      const allEmails = await getAllEmails();
      allEmails.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setEmails(allEmails);
    } catch (error) {
      console.error("Error loading emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const { fetching, fetchEmails } = useEmailFetch({
    emailConfig,
    emails,
    setEmails,
    onFetchSuccess: () => {
      autoSaveConfig();
      loadEmails();
      // Đánh dấu đã đăng nhập thành công
      setIsLoggedIn(true);
    },
  });

  useEffect(() => {
    loadEmails();
  }, []);

  const handleLogin = async () => {
    // Kiểm tra đã nhập đầy đủ thông tin
    if (!emailConfig.email || !emailConfig.password) {
      toast.error("Vui lòng nhập đầy đủ email và password");
      return;
    }

    // Fetch emails khi đăng nhập
    // isLoggedIn sẽ được set trong onFetchSuccess khi fetch thành công
    await fetchEmails();
  };

  // Auto-polling mỗi 30 giây sau khi đăng nhập thành công
  useEffect(() => {
    // Chỉ auto-polling nếu đã đăng nhập trong session này
    if (!isLoggedIn || !emailConfig.email || !emailConfig.password) {
      return;
    }

    // Auto-polling định kỳ mỗi 30 giây
    const interval = setInterval(() => {
      if (emailConfig.email && emailConfig.password) {
        fetchEmails();
      }
    }, 30 * 1000); // 30 giây

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, emailConfig.email, emailConfig.password]);

  const handleLogout = () => {
    clearSavedConfig();
    setIsLoggedIn(false);
    toast.success("Đã đăng xuất!");
  };

  const filteredEmails = filterEmails(emails, searchKeyword);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen py-8 overflow-x-hidden transition-colors duration-200">
      <div className="fixed inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-[4px] z-0"></div>
      <div className="relative z-10 opacity-90">
        <ThemeToggle />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="shadow-dance-text text-5xl font-bold text-gray-900 dark:text-white mb-8">
            Email Translator
          </h1>

          <LoginForm
            emailConfig={emailConfig}
            setEmailConfig={setEmailConfig}
            hasSavedConfig={hasSavedConfig}
            fetching={fetching}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />

          <Statistics emails={emails} />

          <EmailSearch
            searchKeyword={searchKeyword}
            onSearchChange={setSearchKeyword}
            resultCount={filteredEmails.length}
            totalCount={emails.length}
          />

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors duration-200 ">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Danh sách Email
            </h2>
            <EmailList emails={filteredEmails} />
          </div>
        </div>
      </div>
    </div>
  );
}
