import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { EmailRecord, getAllEmails, saveEmail } from "@/lib/db";

interface EmailConfig {
  email: string;
  password: string;
  targetEmail: string;
}

interface UseEmailFetchProps {
  emailConfig: EmailConfig;
  emails: EmailRecord[];
  setEmails: (emails: EmailRecord[]) => void;
  onFetchSuccess?: () => void;
}

export function useEmailFetch({
  emailConfig,
  emails,
  setEmails,
  onFetchSuccess,
}: UseEmailFetchProps) {
  const [fetching, setFetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const loadEmails = async () => {
    try {
      const allEmails = await getAllEmails();
      allEmails.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setEmails(allEmails);
    } catch (error) {
      console.error("Error loading emails:", error);
    }
  };

  const translateEmail = async (text: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/emails/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.translatedText;
      }
      return null;
    } catch (error) {
      console.error("Translation error:", error);
      return null;
    }
  };

  const fetchEmails = async () => {
    if (!emailConfig.email || !emailConfig.password) {
      toast.error("Vui lòng nhập email và password");
      return;
    }

    setFetching(true);
    try {
      const params = new URLSearchParams({
        email: emailConfig.email,
        password: emailConfig.password,
        ...(emailConfig.targetEmail && {
          targetEmail: emailConfig.targetEmail,
        }),
        ...(lastFetchTime && { since: lastFetchTime.toISOString() }),
      });

      const response = await fetch(`/api/emails/fetch?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Lỗi khi lấy email");
      }

      // Lưu emails vào IndexedDB và dịch
      for (const email of data.emails) {
        const emailId = `${email.uid}-${new Date(email.date).getTime()}`;

        // Kiểm tra trong IndexedDB xem email đã tồn tại chưa
        const { getEmail: getEmailFromDB } = await import("@/lib/db");
        const existingEmailInDB = await getEmailFromDB(emailId);

        // Nếu email chưa tồn tại trong IndexedDB, tạo mới và dịch
        if (!existingEmailInDB) {
          const emailRecord: EmailRecord = {
            id: emailId,
            uid: email.uid,
            subject: email.subject,
            from: email.from,
            date: new Date(email.date).toISOString(),
            text: email.text,
            html: email.html,
          };

          // Dịch email (email mới nên chưa có bản dịch)
          const translatedText = await translateEmail(email.text || email.html);
          if (translatedText) {
            emailRecord.translatedText = translatedText;
          }

          // Dịch HTML nếu có
          if (email.html) {
            const translatedHtml = await translateEmail(email.html);
            if (translatedHtml) {
              emailRecord.translatedHtml = translatedHtml;
            }
          }

          // Lưu vào IndexedDB
          await saveEmail(emailRecord);
        } else {
          // Email đã tồn tại trong IndexedDB
          // Chỉ dịch nếu chưa có bản dịch
          if (!existingEmailInDB.translatedText) {
            const translatedText = await translateEmail(
              email.text || email.html
            );
            if (translatedText) {
              existingEmailInDB.translatedText = translatedText;
              await saveEmail(existingEmailInDB);
            }
          }

          // Dịch HTML nếu có và chưa có bản dịch HTML
          if (email.html && !existingEmailInDB.translatedHtml) {
            const translatedHtml = await translateEmail(email.html);
            if (translatedHtml) {
              existingEmailInDB.translatedHtml = translatedHtml;
              await saveEmail(existingEmailInDB);
            }
          }
        }
      }

      // Cập nhật thời gian fetch cuối cùng
      if (data.fetchedAt) {
        setLastFetchTime(new Date(data.fetchedAt));
      }

      // Reload emails
      await loadEmails();

      if (onFetchSuccess) {
        onFetchSuccess();
      }

      if (data.emails.length > 0) {
        toast.success(`Đã lấy ${data.emails.length} email mới`);
      } else {
        toast.info("Không có email mới");
      }
    } catch (error: any) {
      console.error("Error fetching emails:", error);
      toast.error(error.message || "Lỗi khi lấy email");
    } finally {
      setFetching(false);
    }
  };

  // Auto-polling mỗi 30 giây (chỉ khi đã đăng nhập thành công)
  // Không tự động fetch khi thay đổi email/password
  // Chỉ fetch khi người dùng nhấn nút "Đăng nhập"

  return {
    fetching,
    fetchEmails,
  };
}
