import { NextRequest, NextResponse } from "next/server";
import Imap from "imap";
import { simpleParser } from "mailparser";

interface EmailData {
  uid: number;
  subject: string;
  from: string;
  date: Date;
  text: string;
  html: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email") || process.env.EMAIL_ADDRESS;
  const password = searchParams.get("password") || process.env.EMAIL_PASSWORD;
  const targetEmail =
    searchParams.get("targetEmail") || process.env.TARGET_EMAIL || email;
  const sinceParam = searchParams.get("since"); // Timestamp từ client

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email và password là bắt buộc" },
      { status: 400 }
    );
  }

  // Sử dụng timestamp từ client hoặc mặc định là 1 giờ trước
  const since = sinceParam
    ? new Date(sinceParam)
    : new Date(Date.now() - 60 * 60 * 1000); // 1 giờ trước

  // TypeScript: email và password đã được check ở trên
  const emailStr = email as string;
  const passwordStr = password as string;
  const targetEmailStr = (targetEmail || emailStr) as string;

  try {
    const emails = await fetchEmails(
      emailStr,
      passwordStr,
      targetEmailStr,
      since
    );
    const currentTime = new Date();
    return NextResponse.json({
      emails,
      lastFetchTime: currentTime.toISOString(),
      fetchedAt: currentTime.toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi lấy email" },
      { status: 500 }
    );
  }
}

async function fetchEmails(
  email: string,
  password: string,
  targetEmail: string,
  since: Date
): Promise<EmailData[]> {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: email,
      password: password,
      host: process.env.IMAP_HOST || "imap.bizflycloud.vn",
      port: parseInt(process.env.IMAP_PORT || "993", 10),
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    const emails: EmailData[] = [];

    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err, box) => {
        if (err) {
          imap.end();
          return reject(err);
        }

        // Tìm emails từ thời điểm since trở đi (chỉ lấy emails mới)
        imap.search([["SINCE", since]], (err, results) => {
          if (err) {
            imap.end();
            return reject(err);
          }

          if (!results || results.length === 0) {
            imap.end();
            return resolve([]);
          }

          const fetch = imap.fetch(results, {
            bodies: "",
            struct: true,
          });

          let processedCount = 0;

          fetch.on("message", (msg, seqno) => {
            let buffer = "";

            msg.on("body", (stream) => {
              stream.on("data", (chunk) => {
                buffer += chunk.toString("utf8");
              });
            });

            msg.once("end", async () => {
              try {
                const parsed = await simpleParser(buffer);

                // Lọc email gửi đến địa chỉ cụ thể
                const getAddresses = (addr: any) => {
                  if (!addr) return [];
                  if (Array.isArray(addr)) {
                    return addr.flatMap((a: any) =>
                      Array.isArray(a.value)
                        ? a.value
                        : a.value
                        ? [a.value]
                        : []
                    );
                  }
                  return Array.isArray(addr.value)
                    ? addr.value
                    : addr.value
                    ? [addr.value]
                    : [];
                };

                const toAddresses = getAddresses(parsed.to);
                const ccAddresses = getAddresses(parsed.cc);
                const bccAddresses = getAddresses(parsed.bcc);

                const allRecipients = [
                  ...toAddresses.map((a: any) =>
                    (typeof a === "string" ? a : a.address)?.toLowerCase()
                  ),
                  ...ccAddresses.map((a: any) =>
                    (typeof a === "string" ? a : a.address)?.toLowerCase()
                  ),
                  ...bccAddresses.map((a: any) =>
                    (typeof a === "string" ? a : a.address)?.toLowerCase()
                  ),
                ].filter(Boolean) as string[];

                const isTargetEmail = allRecipients.some(
                  (addr: string) => addr === targetEmail.toLowerCase()
                );

                if (isTargetEmail) {
                  // Extract sender email
                  let fromEmail = "Unknown";
                  if (parsed.from) {
                    if (Array.isArray(parsed.from)) {
                      fromEmail =
                        parsed.from[0]?.value?.[0]?.address ||
                        parsed.from[0]?.text ||
                        "Unknown";
                    } else {
                      fromEmail =
                        parsed.from.value?.[0]?.address ||
                        parsed.from.text ||
                        "Unknown";
                    }
                  }

                  emails.push({
                    uid: seqno,
                    subject: parsed.subject || "(Không có tiêu đề)",
                    from: fromEmail,
                    date: parsed.date || new Date(),
                    text: parsed.text || "",
                    html: parsed.html || parsed.textAsHtml || "",
                  });
                }

                processedCount++;
                if (processedCount === results.length) {
                  imap.end();
                  resolve(emails);
                }
              } catch (parseError) {
                console.error("Error parsing email:", parseError);
                processedCount++;
                if (processedCount === results.length) {
                  imap.end();
                  resolve(emails);
                }
              }
            });
          });

          fetch.once("error", (err) => {
            imap.end();
            reject(err);
          });
        });
      });
    });

    imap.once("error", (err: Error) => {
      reject(err);
    });

    imap.connect();
  });
}
