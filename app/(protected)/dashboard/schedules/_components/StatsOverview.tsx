"use client";

type ScheduleSlot = {
    _id: string;
    day: number;
    period: number;
    subject: string;
    className: string;
    organisationId: string;
};

export default function StatsOverview({ schedule }: { schedule: ScheduleSlot[] }) {
    if (!schedule || schedule.length === 0) return null;

    const totalClasses = schedule.length;
    const uniqueSubjects = new Set(schedule.map(s => s.subject)).size;
    const uniqueClasses = new Set(schedule.map(s => s.className)).size;

    // Find busiest day
    const dayCounts: Record<number, number> = {};
    schedule.forEach(s => {
        if (!dayCounts[s.day]) dayCounts[s.day] = 0;
        dayCounts[s.day]++;
    });

    let busiestDay = 1;
    let maxClasses = 0;
    Object.entries(dayCounts).forEach(([dayStr, count]) => {
        const day = Number(dayStr);
        if (count > maxClasses) {
            maxClasses = count;
            busiestDay = day;
        }
    });

    const dayLabels: Record<number, string> = {
        1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday"
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:border-blue-200">
                <span className="text-gray-500 text-sm font-medium mb-1">Total Weekly Classes</span>
                <span className="text-3xl font-bold text-blue-700">{totalClasses}</span>
                <div className="mt-2 h-1 w-full bg-blue-50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-full"></div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:indigo-200">
                <span className="text-gray-500 text-sm font-medium mb-1">Subjects Taught</span>
                <span className="text-3xl font-bold text-blue-700">{uniqueSubjects}</span>
                <div className="mt-2 h-1 w-full bg-blue-50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '70%' }}></div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:teal-200">
                <span className="text-gray-500 text-sm font-medium mb-1">Distinct Classes</span>
                <span className="text-3xl font-bold text-blue-700">{uniqueClasses}</span>
                <div className="mt-2 h-1 w-full bg-blue-50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '85%' }}></div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:purple-200">
                <span className="text-gray-500 text-sm font-medium mb-1">Busiest Day</span>
                <span className="text-3xl font-bold text-blue-700 truncate">{dayLabels[busiestDay] || "N/A"}</span>
                <span className="text-xs font-medium text-blue-600 mt-2 bg-blue-50 self-start px-2 py-1 rounded-md">{maxClasses} classes</span>
            </div>
        </div>
    );
}
