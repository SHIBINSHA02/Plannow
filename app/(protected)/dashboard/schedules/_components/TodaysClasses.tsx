"use client";

import { useMemo } from "react";

type ScheduleSlot = {
    _id: string;
    day: number;
    period: number;
    subject: string;
    className: string;
    organisationId: string;
};

export default function TodaysClasses({ schedule }: { schedule: ScheduleSlot[] }) {
    const { displayDay, isWeekend, todaysClasses, currentPeriod } = useMemo(() => {
        const now = new Date();
        const today = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const isWeekendMode = today === 0 || today === 6;

        // Show Monday's schedule if it's the weekend
        const targetDay = isWeekendMode ? 1 : today;

        const filtered = schedule
            .filter(s => s.day === targetDay)
            .sort((a, b) => a.period - b.period);

        // Very basic period estimation based on time (assuming classes start at 8 AM, 45 min each)
        // Adjust logic as suitable for context - here we just highlight it contextually if it's the current time
        const hour = now.getHours();
        let estimatedPeriod = -1;
        if (!isWeekendMode && hour >= 8 && hour <= 14) {
            estimatedPeriod = hour - 7; // simplified: 8 AM = period 1
        }

        return {
            displayDay: targetDay,
            isWeekend: isWeekendMode,
            todaysClasses: filtered,
            currentPeriod: estimatedPeriod
        };
    }, [schedule]);

    const dayLabels: Record<number, string> = {
        1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday"
    };

    if (!schedule || schedule.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">
                        {isWeekend ? `Next Monday` : `Today's Classes`}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{dayLabels[displayDay]}</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                        {todaysClasses.length} Classes
                    </span>
                </div>
            </div>

            {todaysClasses.length > 0 ? (
                <div className="space-y-4">
                    {todaysClasses.map((cls, idx) => {
                        const isCurrent = cls.period === currentPeriod;
                        return (
                            <div
                                key={cls._id || idx}
                                className={`flex items-center p-4 rounded-xl border transition-all ${isCurrent
                                        ? "bg-blue-50 border-blue-300 shadow-md transform scale-[1.02]"
                                        : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm"
                                    }`}
                            >
                                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl font-bold mr-5 shrink-0 shadow-sm ${isCurrent ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                                    }`}>
                                    <span className="text-[10px] uppercase font-semibold opacity-80 tracking-wider">Per</span>
                                    <span className="text-xl leading-none mt-0.5">{cls.period}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={`font-bold text-lg ${isCurrent ? "text-blue-900" : "text-gray-900"}`}>
                                            {cls.subject}
                                        </h4>
                                        {isCurrent && (
                                            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                                                Now
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-50 w-fit px-2 py-1 rounded">
                                        <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                        </svg>
                                        Class: <span className="text-gray-900 ml-1">{cls.className}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 h-64">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <p className="text-gray-600 font-medium text-lg">No classes scheduled</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-[200px]">You have a free day. Take some time to prepare or relax!</p>
                </div>
            )}
        </div>
    );
}
