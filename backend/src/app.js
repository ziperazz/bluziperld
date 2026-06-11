import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";


import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import shippingRoutes from "./routes/shipping.routes.js";
import letterRoutes from "./routes/letter.routes.js";
import orderRoutes from "./routes/order.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminUsersRoutes from "./routes/adminUsers.routes.js"
import searchRoutes from "./routes/search.routes.js"
import paymentRoutes from "./routes/payment.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import discountRoutes from "./routes/discount.routes.js";
import aiChatRoutes from "./routes/aiChat.routes.js";

const app = express();

/* ---------------- Middlewares ---------------- */

app.use(helmet());

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://bluziperld.ir",
            "https://www.bluziperld.ir"
        ],
        credentials: true,
    })
);


app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

/* ---------------- Static Files ---------------- */


app.use(
    "/uploads",
    (req, res, next) => {
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        next();
    },
    express.static(path.join(process.cwd(), "uploads"))
);

/* ---------------- Health Check ---------------- */

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Backend is working!" });
});

/* ---------------- API Routes ---------------- */

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", shippingRoutes);
app.use("/api/letters", letterRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin/users", adminUsersRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/payment", paymentRoutes);
// مسیر صحیح کامنت‌ها
app.use("/api/comments", commentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/ai-chat", aiChatRoutes);

/* ---------------- 404 Handler ---------------- */

app.use((req, res) => {
    res.status(404).json({ message: "Not Found" });
});

export default app;
