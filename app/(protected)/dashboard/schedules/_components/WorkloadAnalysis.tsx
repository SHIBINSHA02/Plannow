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
    // const today = 1; // Monday (testing only)
    // const todayLoad = workloadByDay[today] ?? 0;



    const jsDay = new Date().getDay(); // Sun=0, Mon=1
    const today = jsDay >= 1 && jsDay <= 5 ? jsDay : null;
    const todayLoad = today ? workloadByDay[today] : 0;


    return (
        <div className="space-y-6">
            {/* ---------- Overall Workload ---------- */}
            <div className="bg-transparent">
                <div className="space-y-5">
                    {Object.entries(workloadByDay).map(([day, count]) => (
                        <div key={day} className="group cursor-default">
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
                                    {dayLabels[Number(day)]}
                                </span>
                                <span className="font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded text-xs group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors border border-gray-100 group-hover:border-blue-100">
                                    {count} classes
                                </span>
                            </div>

                            <div className="w-full bg-gray-100/80 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-blue-500 hover:bg-blue-600 h-2.5 rounded-full transition-all duration-500"
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 shadow-sm mt-6">
                <h3 className="text-xs font-bold text-blue-900 mb-4 uppercase tracking-wider">
                    Today's Capacity
                </h3>

                {today ? (
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center border-2 border-blue-200 shrink-0">
                            <div className="text-2xl font-black text-blue-700">
                                {todayLoad}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-end mb-1">
                                <div className="font-bold text-gray-800">
                                    {dayLabels[today]}
                                </div>
                                <div className="text-xs font-bold text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-md">
                                    {Math.round((todayLoad / 6) * 100)}% Booked
                                </div>
                            </div>
                            <div className="w-full bg-white/60 rounded-full h-3 border border-blue-100/50 overflow-hidden shadow-inner">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-700"
                                    style={{
                                        width: `${(todayLoad / 6) * 100}%`,
                                    }}
                                />
                            </div>
                            <div className="text-xs text-blue-800/60 mt-2 font-medium">
                                Based on a maximum of 6 periods per day
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-blue-800/80 bg-white/60 p-3 rounded-lg border border-blue-100/50">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span className="font-medium text-sm">No scheduled classes today. Enjoy your weekend!</span>
                    </div>
                )}
            </div>
        </div>
    );
}
