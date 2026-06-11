import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      type = "love",
      tone = "friendly",
      recipientName,
      senderName,
      relationship,
      quality = "premium",
    } = await req.json();

    if (!prompt || prompt.trim().length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: "متن کافی برای تولید نامه ارسال نشده است.",
        },
        { status: 400 }
      );
    }

    const typeInstructions: Record<string, string> = {
      love: `
موضوع نامه عاشقانه است.
روی عشق، علاقه، دلتنگی، ارزش حضور فرد،
زیبایی رابطه و احساسات عمیق تمرکز کن.
از کلیشه‌های تکراری استفاده نکن.
`,
      birthday: `
موضوع نامه تبریک تولد است.
گرم، صمیمی، مثبت و امیدبخش بنویس.
روی ارزش وجود فرد و آرزوهای خوب تمرکز کن.
`,
      farewell: `
موضوع نامه خداحافظی است.
محترمانه، تاثیرگذار و احساسی بنویس.
روی قدردانی، آرزوی موفقیت و ارزش لحظات مشترک تمرکز کن.
`,
      gratitude: `
موضوع نامه قدردانی و تشکر است.
صادقانه و انسانی بنویس.
دلیل تشکر را برجسته کن و تاثیر فرد را نشان بده.
`,
    };

    const toneInstructions: Record<string, string> = {
      casual: `
خودمانی و راحت.
مثل نامه واقعی بین دو نفر نزدیک.
`,
      friendly: `
صمیمی، گرم و طبیعی.
`,
      formal: `
رسمی، محترمانه و حرفه‌ای.
`,
      emotional: `
احساسی، عمیق و تاثیرگذار.
بدون اغراق غیرواقعی.
`,
    };

    const qualityInstructions: Record<string, string> = {
      basic: `
نامه کوتاه و ساده باشد.
حدود 150 تا 250 کلمه.
`,
      premium: `
نامه کامل، روان و تاثیرگذار باشد.
حدود 250 تا 450 کلمه.
`,
      royal: `
نامه بسیار حرفه‌ای و ماندگار باشد.
از جملات زیبا،
ادبیات قوی،
تصویرسازی احساسی،
و ساختار حرفه‌ای استفاده کن.
نامه باید در حد نگهداری برای سال‌ها ارزش داشته باشد.
حدود 400 تا 700 کلمه.
`,
    };

    const systemPrompt = `
تو «بلو» هستی.
نامه‌نویس اختصاصی BluZiperld.
BluZiperld یک سرویس لوکس نامه‌نگاری است که
نامه‌ها را به صورت دست‌نویس روی کاغذ واقعی
برای افراد ارسال می‌کند.

وظیفه تو نوشتن نامه‌هایی است که:
* انسانی باشند
* طبیعی باشند
* احساسی باشند
* شبیه متن هوش مصنوعی نباشند
* هنگام خواندن حس واقعی منتقل کنند

قوانین مهم:
1- همیشه بر اساس حرف کاربر بنویس.
2- احساسات کاربر را گسترش بده.
3- متن را زیباتر و حرفه‌ای‌تر کن.
4- اگر کاربر اطلاعات کمی داده باشد،
می‌توانی احساسات مرتبط را گسترش دهی.
5- هرگز خاطره مشخص، مکان مشخص،
اتفاق مشخص یا رویدادی که کاربر نگفته نساز.
6- هرگز دروغ نساز.
7- از جملات کلیشه‌ای تکراری پرهیز کن.
8- نامه باید طبیعی به نظر برسد.
9- نامه را مستقیماً شروع کن.
10- هیچ توضیحی قبل یا بعد از نامه ننویس.
11- هرگز نگو:
"در ادامه نامه آمده است"
یا
"البته"
یا
"به عنوان یک هوش مصنوعی"
12- فقط متن نهایی نامه را برگردان.
`;

    const userPrompt = `
نوع نامه:
${type}

${typeInstructions[type] || typeInstructions.love}

سطح کیفیت:
${qualityInstructions[quality] || qualityInstructions.premium}

لحن:
${toneInstructions[tone] || toneInstructions.friendly}

گیرنده:
${recipientName || "نامشخص"}

فرستنده:
${senderName || "نامشخص"}

رابطه:
${relationship || "نامشخص"}

خواسته کاربر:

${prompt}

فقط متن نهایی نامه را بنویس.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://bluziperld.ir",
          "X-Title": "BluZiperld",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.9,
          top_p: 0.95,
          frequency_penalty: 0.2,
          presence_penalty: 0.2,
          max_tokens: 900,
        }),
      }
    );

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      console.error("OpenRouter Error:", data);
      return NextResponse.json(
        {
          success: false,
          error: "خطا در تولید نامه",
        },
        { status: 500 }
      );
    }

    const generatedText = data.choices[0].message.content.trim();

    return NextResponse.json({
      success: true,
      text: generatedText,
    });
  } catch (error) {
    console.error("AI Writer Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در ارتباط با سرور",
      },
      { status: 500 }
    );
  }
}