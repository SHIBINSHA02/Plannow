// app/(protected)/dashboard/organisations/[organisationId]/manage/_components/QuickLinks.tsx
"use client";

import {
    FolderKanban,
    ShieldCheck,
    Users,
} from "lucide-react";

interface Props {
    orgId: string;
    router: any;
    cardBase: string;
    textColor: string;
    subTextColor: string;
}

export default function QuickLinks({
    orgId,
    router,
    cardBase,
    textColor,
    subTextColor,
}: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <button
                onClick={() =>
                    router.push(`/dashboard/organisations/${orgId}`)
                }
                className={`${cardBase} text-left hover:shadow-md transition`}
            >
                <div className="flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-blue-500" />

                    <div>
                        <div className={`font-semibold ${textColor}`}>
                            Organisation Dashboard
                        </div>

                        <div className={`text-sm ${subTextColor}`}>
                            Teachers, classrooms, submissions
                        </div>
                    </div>
                </div>
            </button>

            <button
                onClick={() =>
                    router.push(
                        `/dashboard/organisations/${orgId}/verify`
                    )
                }
                className={`${cardBase} text-left hover:shadow-md transition`}
            >
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-500" />

                    <div>
                        <div className={`font-semibold ${textColor}`}>
                            Verification & Onboarding
                        </div>

                        <div className={`text-sm ${subTextColor}`}>
                            Approve submissions, manage links
                        </div>
                    </div>
                </div>
            </button>

            <div className={cardBase}>
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />

                    <div>
                        <div className={`font-semibold ${textColor}`}>
                            Access
                        </div>

                        <div className={`text-sm ${subTextColor}`}>
                            Manage editor emails below
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}