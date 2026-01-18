"use client";

type ScheduleSlot = {
    _id: string;
    day: number; // 1–5
    period: number;
    subject: string;
    classroomId: string;
    organisationId: string;
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function WeeklyWorkloadChart({
    schedule,
}: {
    schedule: ScheduleSlot[];
}) {
    /* ---------- Aggregate workload ---------- */
    const workload = [0, 0, 0, 0, 0];

    schedule.forEach(slot => {
        const day = Number(slot.day);
        if (day >= 1 && day <= 5) {
            workload[day - 1]++;
        }
    });

    const maxLoad = Math.max(...workload, 1);

    /* ---------- SVG sizing ---------- */
    const width = 520;
    const height = 220;
    const padding = 40;
    const stepX = (width - padding * 2) / 4;

    const points = workload.map((value, index) => {
        const x = padding + index * stepX;
        const y =
            height -
            padding -
            (value / maxLoad) * (height - padding * 2);
        return { x, y, value };
    });

    /* ---------- Freehand smooth curve ---------- */
    const buildSmoothPath = (pts: typeof points) => {
        let d = `M ${pts[0].x} ${pts[0].y}`;

        for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1];
            const curr = pts[i];
            const midX = (prev.x + curr.x) / 2;

            d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
        }

        return d;
    };

    const pathD = buildSmoothPath(points);

    return (
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Weekly Workload (Freehand Graph)
            </h3>
            <div>

            <svg  className="w-full h-60">
              
                <line
                    x1={padding}
                    y1={padding}
                    x2={padding}
                    y2={height - padding}
                    stroke="#CBD5E1"
                />
                <line
                    x1={padding}
                    y1={height - padding}
                    x2={width - padding}
                    y2={height - padding}
                    stroke="#CBD5E1"
                />

                {/* Freehand curved line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Points */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#2563EB" />
                        <text
                            x={p.x}
                            y={p.y - 10}
                            fontSize="10"
                            textAnchor="middle"
                            fill="#374151"
                        >
                            {p.value}
                        </text>
                    </g>
                ))}

                {/* X-axis labels */}
                {dayLabels.map((label, i) => (
                    <text
                        key={label}
                        x={padding + i * stepX}
                        y={height - 10}
                        fontSize="11"
                        textAnchor="middle"
                        fill="#6B7280"
                    >
                        {label}
                    </text>
                ))}
            </svg>
            </div>
        </div>
    );
}
