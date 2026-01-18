"use client";

/* ---------- Types ---------- */

type ScheduleSlot = {
    _id: string;
    day: number;        // 1–5
    period: number;     // 1–6
    subject: string;
    classroomId: string;
    organisationId: string;
};

type Props = {
    schedule: ScheduleSlot[];
};

/* ---------- Helpers ---------- */

const dayLabels: Record<number, string> = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
};

/* ---------- Component ---------- */

export default function WorkloadAnalysis({ schedule }: Props) {
    /* ---------- Count workload per day ---------- */
    const workloadByDay: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
    };

    schedule.forEach(slot => {
        if (workloadByDay[slot.day] !== undefined) {
            workloadByDay[slot.day]++;
        }
    });

    const maxLoad = Math.max(...Object.values(workloadByDay), 1);

    /* ---------- Today workload (FOR TESTING: FORCE MONDAY) ---------- */
    const today = 1; // Monday (testing only)
    const todayLoad = workloadByDay[today] ?? 0;

    
    
    //    const jsDay = new Date().getDay(); // Sun=0, Mon=1
    //    const today = jsDay >= 1 && jsDay <= 5 ? jsDay : null;
    //    const todayLoad = today ? workloadByDay[today] : 0;
  

    return (
        <div className="mt-8 space-y-6">
            {/* ---------- Overall Workload ---------- */}
            <div className="bg-white rounded-xl shadow-md p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Weekly Workload Overview
                </h3>

                <div className="space-y-3">
                    {Object.entries(workloadByDay).map(([day, count]) => (
                        <div key={day}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">
                                    {dayLabels[Number(day)]}
                                </span>
                                <span className="text-gray-500">
                                    {count} periods
                                </span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-blue-600 h-3 rounded-full transition-all"
                                    style={{
                                        width: `${(count / maxLoad) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ---------- Today's Workload ---------- */}
            <div className="bg-white rounded-xl shadow-md p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Today’s Workload
                </h3>

                {today ? (
                    <div className="flex items-center gap-6">
                        <div className="text-3xl font-bold text-blue-700">
                            {todayLoad}
                        </div>

                        <div className="flex-1">
                            <div className="text-sm text-gray-600 mb-1">
                                {dayLabels[today]}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-blue-700 h-4 rounded-full"
                                    style={{
                                        width: `${(todayLoad / 6) * 100}%`,
                                    }}
                                />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Out of 6 periods
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">
                        No workload today (Weekend)
                    </p>
                )}
            </div>
        </div>
    );
}
