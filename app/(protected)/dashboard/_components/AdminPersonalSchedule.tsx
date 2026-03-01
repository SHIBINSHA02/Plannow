"use client";

import { useState, useEffect } from "react";

type Props = {
    organisationId: string;
};

export default function AdminPersonalSchedule({ organisationId }: Props) {
    // For MVP we will just render a simple view. In a full app, this would
    // fetch the admin's personal user ID and get their schedule exactly like
    // TeacherSchedulePage does.

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">My Today's Schedule</h3>
            <p className="text-sm text-gray-500 mb-6">Your personal schedule and substitutions</p>

            <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                </div>
                <h4 className="text-base font-semibold text-gray-900">No classes assigned today</h4>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                    You don't have any classes or substitution duties scheduled for today in this organisation.
                </p>
            </div>
        </div>
    );
}
