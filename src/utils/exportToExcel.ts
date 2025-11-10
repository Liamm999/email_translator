import * as XLSX from "xlsx";
import { EmailRecord } from "@/lib/db";

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  if (!html) return "";
  try {
    // For browser environment
    if (typeof document !== "undefined") {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }
    // For server environment (fallback)
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
  } catch (error) {
    // Fallback: simple regex replacement
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
  }
}

/**
 * Export email to Excel file
 */
export function exportEmailToExcel(email: EmailRecord) {
  try {
    // Prepare data
    const originalText = email.html
      ? stripHtml(email.html)
      : email.text || "(Không có nội dung)";
    const translatedText = email.translatedText || "(Chưa có bản dịch)";

    // Create worksheet data
    const worksheetData = [
      ["THÔNG TIN EMAIL", ""],
      ["Tiêu đề", email.subject],
      ["Người gửi", email.from],
      ["Ngày gửi", new Date(email.date).toLocaleString("vi-VN")],
      ["", ""],
      ["NỘI DUNG GỐC", ""],
      [originalText],
      ["", ""],
      ["BẢN DỊCH (TIẾNG VIỆT)", ""],
      [translatedText],
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths for better readability
    ws["!cols"] = [
      { wch: 25 }, // Column A: Labels
      { wch: 100 }, // Column B: Content
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Email");

    // Generate filename
    const dateStr = new Date(email.date).toISOString().split("T")[0];
    const subjectStr = email.subject
      .replace(/[^a-z0-9]/gi, "_")
      .substring(0, 50);
    const filename = `Email_${dateStr}_${subjectStr}.xlsx`;

    // Write file
    XLSX.writeFile(wb, filename);

    return true;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
}
