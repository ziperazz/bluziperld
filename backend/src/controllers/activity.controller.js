import Activity from "../models/Activity.js";


// دریافت فعالیت‌ها
export const getActivities = async (req, res) => {
    try {

        const activities = await Activity
            .find()
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json(activities);

    } catch (error) {

        console.error("Get Activities Error:", error);

        res.status(500).json({
            message: "خطا در دریافت فعالیت‌ها",
        });
    }
};


// ثبت فعالیت جدید
export const createActivity = async (req, res) => {
    try {

        const { message, type } = req.body;

        if (!message) {
            return res.status(400).json({
                message: "متن فعالیت الزامی است",
            });
        }

        const newActivity = await Activity.create({
            message,
            type,
        });

        res.status(201).json(newActivity);

    } catch (error) {

        console.error("Create Activity Error:", error);

        res.status(500).json({
            message: "خطا در ثبت فعالیت",
        });
    }
};
