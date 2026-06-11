import Ticket from "../models/Ticket.js";

/**
 * تبدیل ساختار تیکت برای فرانت
 */
const normalizeTicket = (ticket) => {
    const t = ticket.toObject ? ticket.toObject() : ticket;

    return {
        ...t,
        messages: (t.messages || []).map((msg) => ({
            _id: msg._id,
            sender: msg.sender,
            senderRole: msg.sender === "admin" ? "ADMIN" : "USER",
            text: msg.message,
            message: msg.message,
            attachments: msg.attachments || [],
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
        })),
    };
};

/**
 * @desc   ایجاد تیکت توسط کاربر
 * @route  POST /api/tickets
 * @access User
 */
export const createTicket = async (req, res) => {
    try {
        const userId = req.user?.id;
        const {
            subject,
            message,
            text,
            priority,
            attachments
        } = req.body;

        const content = (text || message || "").trim();

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "کاربر شناسایی نشد",
            });
        }

        if (!subject?.trim() || !content) {
            return res.status(400).json({
                success: false,
                message: "موضوع و متن پیام الزامی است",
            });
        }

        const ticket = await Ticket.create({
            user: userId,
            subject: subject.trim(),
            priority: priority || "MEDIUM",
            status: "OPEN",
            messages: [
                {
                    sender: "user",
                    message: content,
                    attachments: attachments || [],
                },
            ],
        });

        const populatedTicket = await Ticket.findById(ticket._id).populate(
            "user",
            "name email"
        );

        return res.status(201).json({
            success: true,
            message: "تیکت با موفقیت ایجاد شد",
            ticket: normalizeTicket(populatedTicket),
        });
    } catch (error) {
        console.error("createTicket error:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در ایجاد تیکت",
        });
    }
};

/**
 * @desc   دریافت تیکت‌های کاربر جاری
 * @route  GET /api/tickets/me
 * @access User
 */
export const getMyTickets = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "کاربر شناسایی نشد",
            });
        }

        const tickets = await Ticket.find({ user: userId })
            .sort({ updatedAt: -1 });

        return res.json({
            success: true,
            tickets: tickets.map(normalizeTicket),
        });
    } catch (error) {
        console.error("getMyTickets error:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در دریافت تیکت‌ها",
        });
    }
};

/**
 * @desc   دریافت تیکت‌های همه کاربران (ادمین)
 * @route  GET /api/tickets/admin/all
 * @access Admin
 */
export const getAllTicketsAdmin = async (req, res) => {
    try {
        const { status, priority, search } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        if (search) {
            filter.$or = [
                { subject: { $regex: search, $options: "i" } },
                { "messages.message": { $regex: search, $options: "i" } },
            ];
        }

        const tickets = await Ticket.find(filter)
            .populate("user", "name email")
            .sort({ updatedAt: -1 });

        return res.json({
            success: true,
            tickets: tickets.map(normalizeTicket),
        });
    } catch (error) {
        console.error("getAllTicketsAdmin error:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در دریافت تیکت‌ها",
        });
    }
};

/**
 * @desc   دریافت جزئیات یک تیکت
 * @route  GET /api/tickets/:id
 * @access User(owner) or Admin
 */
export const getTicketById = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userId = req.user?.id;
        const isAdmin =
            req.user?.role === "admin" || req.user?.role === "ADMIN";

        const ticket = await Ticket.findById(ticketId).populate(
            "user",
            "name email"
        );

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "تیکت پیدا نشد",
            });
        }

        if (!isAdmin && ticket.user._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "دسترسی غیرمجاز",
            });
        }

        return res.json({
            success: true,
            ticket: normalizeTicket(ticket),
        });
    } catch (error) {
        console.error("getTicketById error:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در دریافت تیکت",
        });
    }
};

/**
 * تابع داخلی برای افزودن پیام
 */
const appendMessage = async ({
    ticketId,
    user,
    body,
    forceAdmin = false,
}) => {
    const userId = user?.id || user?._id;

    const isAdmin =
        forceAdmin || user?.role === "admin" || user?.role === "ADMIN";

    const rawText = body?.text ?? body?.message ?? "";
    const content = String(rawText).trim();
    const attachments = Array.isArray(body?.attachments) ? body.attachments : [];

    if (!content) {
        return {
            status: 400,
            payload: {
                success: false,
                message: "متن پیام الزامی است",
            },
        };
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        return {
            status: 404,
            payload: {
                success: false,
                message: "تیکت پیدا نشد",
            },
        };
    }

    if (!isAdmin && ticket.user.toString() !== userId.toString()) {
        return {
            status: 403,
            payload: {
                success: false,
                message: "دسترسی غیرمجاز",
            },
        };
    }

    if (ticket.status === "CLOSED") {
        return {
            status: 400,
            payload: {
                success: false,
                message: "این تیکت بسته شده است",
            },
        };
    }

    ticket.messages.push({
        sender: isAdmin ? "admin" : "user",
        message: content,
        attachments,
    });

    ticket.status = isAdmin ? "WAITING_USER" : "WAITING_ADMIN";

    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id).populate(
        "user",
        "name email"
    );

    return {
        status: 200,
        payload: {
            success: true,
            message: "پیام با موفقیت ارسال شد",
            ticket: normalizeTicket(populatedTicket),
        },
    };
};

/**
 * @desc   ارسال پیام توسط کاربر یا ادمین
 * @route  POST /api/tickets/:id/message
 * @access User/Admin
 */
export const addMessageToTicket = async (req, res) => {
    try {
        const result = await appendMessage({
            ticketId: req.params.id,
            user: req.user,
            body: req.body,
            forceAdmin: false,
        });

        return res.status(result.status).json(result.payload);
    } catch (error) {
        console.error("addMessageToTicket error:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در ارسال پیام",
        });
    }
};

/**
 * @desc   ارسال پیام از سمت ادمین
 * @route  POST /api/tickets/:id/admin-message
 * @access Admin
 */
export const addAdminMessageToTicket = async (req, res) => {
    try {
        const isAdmin =
            req.user?.role === "admin" || req.user?.role === "ADMIN";

        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: "فقط ادمین مجاز است",
            });
        }

        const result = await appendMessage({
            ticketId: req.params.id,
            user: req.user,
            body: req.body,
            forceAdmin: true,
        });

        return res.status(result.status).json(result.payload);
    } catch (error) {
        console.error("addAdminMessageToTicket error:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در ارسال پیام ادمین",
        });
    }
};

/**
 * @desc   تغییر وضعیت تیکت
 * @route  PATCH /api/tickets/admin/:id/status
 * @access Admin
 */
export const updateTicketStatus = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { status } = req.body;

        const allowedStatuses = [
            "OPEN",
            "WAITING_ADMIN",
            "WAITING_USER",
            "CLOSED",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "وضعیت نامعتبر است",
            });
        }

        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { status },
            { new: true }
        ).populate("user", "name email");

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "تیکت پیدا نشد",
            });
        }

        return res.json({
            success: true,
            message: "وضعیت تیکت با موفقیت به‌روزرسانی شد",
            ticket: normalizeTicket(ticket),
        });
    } catch (error) {
        console.error("updateTicketStatus error:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در به‌روزرسانی وضعیت تیکت",
        });
    }
};
