import { EmailRecord } from "@/lib/db";

export function filterEmails(
  emails: EmailRecord[],
  keyword: string
): EmailRecord[] {
  if (!keyword.trim()) return emails;

  const searchKeyword = keyword.trim().toLowerCase();

  // Nếu có dấu ngoặc kép, tìm chính xác cụm từ
  if (searchKeyword.startsWith('"') && searchKeyword.endsWith('"')) {
    const exactPhrase = searchKeyword.slice(1, -1);
    return emails.filter((email) => {
      const subject = email.subject?.toLowerCase() || "";
      const from = email.from?.toLowerCase() || "";
      const text = email.text?.toLowerCase() || "";
      const translatedText = email.translatedText?.toLowerCase() || "";

      return (
        subject.includes(exactPhrase) ||
        from.includes(exactPhrase) ||
        text.includes(exactPhrase) ||
        translatedText.includes(exactPhrase)
      );
    });
  }

  // Tìm tất cả các từ trong cụm (AND logic)
  const words = searchKeyword.split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) return emails;

  return emails.filter((email) => {
    const subject = email.subject?.toLowerCase() || "";
    const from = email.from?.toLowerCase() || "";
    const text = email.text?.toLowerCase() || "";
    const translatedText = email.translatedText?.toLowerCase() || "";
    const allText = `${subject} ${from} ${text} ${translatedText}`;

    return words.every((word) => allText.includes(word));
  });
}
