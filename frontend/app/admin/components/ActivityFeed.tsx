"use client";

import { useEffect, useState } from "react";

// تبدیل تاریخ به "X دقیقه پیش"
function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60) return "لحظاتی پیش";
  if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
  return `${Math.floor(diff / 86400)} روز پیش`;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);

useEffect(() => {
  async function load() {
    try {

      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(`${API}/api/activities`);
      const data = await res.json();

      setActivities(data || []);

    } catch (err) {
      console.error(err);
    }
  }

  load();
}, []);


  return (
    <div
      className="
        bg-[#0f1523]
        border border-[#1c2536]
        rounded-xl p-5
        w-full h-full
        shadow-lg
      "
    >
      <h2 className="text-gray-200 text-lg mb-4 font-semibold">
        فعالیت‌های اخیر
      </h2>

      <div className="flex flex-col gap-4">

        {activities.length === 0 && (
          <p className="text-gray-500 text-sm text-center">
            فعلاً فعالیتی ثبت نشده...
          </p>
        )}

        {activities.map((act, i) => (
          <div key={i} className="flex items-start justify-between">
            
            {/* سمت چپ: نقطه + پیام */}
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 mt-2"></span>
              <div className="flex flex-col">
                <span className="text-gray-300 text-sm">{act.message}</span>
                {act.user && (
                  <span className="text-gray-500 text-xs mt-1">
                    {act.user}
                  </span>
                )}
              </div>
            </div>

            {/* سمت راست: زمان */}
            <span className="text-gray-500 text-xs">
              {timeAgo(act.createdAt)}
            </span>

          </div>
        ))}
      </div>
    </div>
  );
}
