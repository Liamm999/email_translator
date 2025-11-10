import { NextRequest, NextResponse } from "next/server";

// DeepL API Free endpoint
const DEEPL_API_FREE = "https://api-free.deepl.com/v2/translate";

export async function POST(request: NextRequest) {
  let text: string | undefined;

  try {
    const body = await request.json();
    text = body.text;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.DEEPL_API_KEY;

    if (!apiKey) {
      // Fallback to MyMemory if no API key is configured
      return await translateWithMyMemory(text);
    }

    // Sử dụng DeepL API Free
    const formData = new URLSearchParams();
    formData.append("text", text);
    formData.append("target_lang", "VI"); // Vietnamese
    // Let DeepL auto-detect source language by not specifying source_lang

    const response = await fetch(DEEPL_API_FREE, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("DeepL API error:", errorData);
      // Fallback to MyMemory
      return await translateWithMyMemory(text);
    }

    const data = await response.json();

    if (data.translations && data.translations.length > 0) {
      return NextResponse.json({
        translatedText: data.translations[0].text,
      });
    }

    throw new Error("No translation returned from DeepL");
  } catch (error: any) {
    console.error("Translation error:", error);

    // Fallback to MyMemory if we have the text
    if (text) {
      try {
        return await translateWithMyMemory(text);
      } catch (fallbackError) {
        console.error("Fallback translation error:", fallbackError);
      }
    }

    return NextResponse.json({ error: "Lỗi khi dịch email" }, { status: 500 });
  }
}

// Fallback translation service (MyMemory)
async function translateWithMyMemory(text: string) {
  const MYMEMORY_API = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=en|vi`;

  const response = await fetch(MYMEMORY_API);
  const data = await response.json();

  if (data.responseStatus === 200 && data.responseData) {
    return NextResponse.json({
      translatedText: data.responseData.translatedText,
    });
  }

  throw new Error("Translation failed");
}
