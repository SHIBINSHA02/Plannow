"use client";

import { useTheme } from "@/app/theme-provider";

type ScheduleSlot = {
    _id: string;
    day: number; // 1–5
    period: number;
    subject: string;
    classroomId: string;
    organisationId: string;
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const pieColors = ["#4338ca", "#3b82f6", "#06b6d4", "#10b981", "#8b5cf6"];

export default function WeeklyWorkloadChart({ schedule }: { schedule: ScheduleSlot[] }) {
    const { theme } = useTheme();

    // Theme-based style variables
    const axisColor = theme === "light" ? "#CBD5E1" : "#334155";
    const labelColor = theme === "light" ? "#6B7280" : "#94A3B8";
    const textColor = theme === "light" ? "#374151" : "#E2E8F0";
    const legendTextColor = theme === "light" ? "#374151" : "#CBD5E1";
    const lineColor = theme === "light" ? "#2563EB" : "#60A5FA";

    /* ---------- Aggregate workload ---------- */
    const workload = [0, 0, 0, 0, 0];
    schedule.forEach(slot => {
        const day = Number(slot.day);
        if (day >= 1 && day <= 5) workload[day - 1]++;
    });

    const maxLoad = Math.max(...workload, 1);
    const totalLoad = workload.reduce((a, b) => a + b, 0) || 1;

    /* ---------- Line Graph math ---------- */
    const width = 520;
    const height = 220;
    const padding = 40;
    const stepX = (width - padding * 2) / 4;

    const points = workload.map((value, index) => ({
        x: padding + index * stepX,
        y: height - padding - (value / maxLoad) * (height - padding * 2),
        value
    }));

    const buildSmoothPath = (pts: typeof points) => {
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1], curr = pts[i], midX = (prev.x + curr.x) / 2;
            d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
        }
        return d;
    };

    const pathD = buildSmoothPath(points);

    /* ---------- Pie chart math ---------- */
    let cumulativeAngle = 0;
    const radius = 70, centerX = 80, centerY = 110;
    const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    const describeArc = (startAngle: number, endAngle: number) => {
        const start = polarToCartesian(centerX, centerY, radius, endAngle);
        const end = polarToCartesian(centerX, centerY, radius, startAngle);
        return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${endAngle - startAngle <= 180 ? "0" : "1"} 0 ${end.x} ${end.y} Z`;
    };

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row gap-6">
                {/* ---------- Line Graph ---------- */}
                <div className="w-full overflow-x-auto">
                    <svg viewBox="0 0 520 220" className="w-full h-60 min-w-[520px]" preserveAspectRatio="xMidYMid meet">
                        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke={axisColor} />
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={axisColor} />

                        <path d={pathD} fill="none" stroke={lineColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                        {points.map((p, i) => (
                            <g key={i}>
                                <circle cx={p.x} cy={p.y} r="4" fill={lineColor} />
                                <text x={p.x} y={p.y - 10} fontSize="10" textAnchor="middle" fill={textColor}>
                                    {p.value}
                                </text>
                            </g>
                        ))}

                        {dayLabels.map((label, i) => (
                            <text key={label} x={padding + i * stepX} y={height - 10} fontSize="11" textAnchor="middle" fill={labelColor}>
                                {label}
                            </text>
                        ))}
                    </svg>
                </div>

                {/* ---------- Pie Chart ---------- */}
                <div className="w-full md:w-64 flex flex-col items-center">
                    <svg viewBox="0 0 160 220" className="w-full max-w-[160px]" preserveAspectRatio="xMidYMid meet">
                        {workload.map((value, index) => {
                            const sliceAngle = (value / totalLoad) * 360;
                            const startAngle = cumulativeAngle;
                            cumulativeAngle += sliceAngle;
                            return <path key={index} d={describeArc(startAngle, cumulativeAngle)} fill={pieColors[index]} />;
                        })}
                    </svg>

                    <div className="mt-2 space-y-1 text-xs">
                        {workload.map((value, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: pieColors[i] }} />
                                <span style={{ color: legendTextColor }}>{dayLabels[i]} ({value})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}