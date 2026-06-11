import Activity from "../models/Activity.js";

export const logActivity = async (
    message,
    type = "system"
) => {
    try {

        await Activity.create({
            message,
            type,
        });

    } catch (error) {

        console.error(
            "Activity Logger Error:",
            error.message
        );
    }
};
