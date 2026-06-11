import AiChat from "../models/aiChat.js";

const DAILY_LIMIT = 5;

// دریافت یا ساخت چت
export const getOrCreateChat = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let chat = await AiChat.findOne({
            user: req.user._id,
            lastRequestDate: { $gte: today },
        });

        if (!chat) {
            chat = await AiChat.create({
                user: req.user._id,
                messages: [],
                dailyRequestCount: 0,
                lastRequestDate: new Date(),
            });
        }

        res.json({
            success: true,
            chat: {
                _id: chat._id,
                messages: chat.messages,
                remainingRequests: DAILY_LIMIT - chat.dailyRequestCount,
                totalLimit: DAILY_LIMIT,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "خطا در دریافت چت" });
    }
};

// ارسال پیام و دریافت پاسخ
export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "پیام نمی‌تواند خالی باشد" });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let chat = await AiChat.findOne({
            user: req.user._id,
            lastRequestDate: { $gte: today },
        });

        if (!chat) {
            chat = await AiChat.create({
                user: req.user._id,
                messages: [],
                dailyRequestCount: 0,
                lastRequestDate: new Date(),
            });
        }

        // چک محدودیت روزانه
        if (chat.dailyRequestCount >= DAILY_LIMIT) {
            return res.status(429).json({
                success: false,
                message: `سقف ${DAILY_LIMIT} نامه در روز تمام شده. فردا دوباره بیا!`,
                remainingRequests: 0,
            });
        }

        // اضافه کردن پیام کاربر
        chat.messages.push({ role: "user", content: message });

        // درخواست به OpenRouter
        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://bluziperld.ir",
                "X-Title": "BluZiperld",
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: `تو "بلو" هستی، دستیار نامه‌نگاری BluZiperld. فقط بر اساس چیزی که کاربر میگه بنویس. از خودت چیزی اضافه نکن. صادق و مستقیم باش.`,
                    },
                    ...chat.messages.map(m => ({ role: m.role, content: m.content })),
                ],
                temperature: 0.75,
                max_tokens: 600,
            }),
        });

        const aiData = await aiResponse.json();
        const aiMessage = aiData.choices?.[0]?.message?.content || "ببخشید، نتونستم بنویسم. دوباره امتحان کن.";

        // اضافه کردن پاسخ
        chat.messages.push({ role: "assistant", content: aiMessage });
        chat.dailyRequestCount += 1;
        chat.lastRequestDate = new Date();
        await chat.save();

        res.json({
            success: true,
            message: aiMessage,
            remainingRequests: DAILY_LIMIT - chat.dailyRequestCount,
            totalLimit: DAILY_LIMIT,
        });
    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ success: false, message: "خطا در ارتباط با هوش مصنوعی" });
    }
};

// حذف تاریخچه چت
export const clearChat = async (req, res) => {
    try {
        await AiChat.findOneAndDelete({ user: req.user._id });
        res.json({ success: true, message: "تاریخچه پاک شد" });
    } catch (error) {
        res.status(500).json({ success: false, message: "خطا در پاکسازی" });
    }
};