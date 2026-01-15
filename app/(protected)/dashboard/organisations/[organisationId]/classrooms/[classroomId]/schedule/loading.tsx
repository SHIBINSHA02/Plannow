export default function Loading() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Schedule Skeleton */}
            <div className="space-y-2">
                {/* Days Header */}
                <div className="grid grid-cols-6 gap-2">
                    <div className="h-10 bg-gray-100 rounded" />
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="h-10 bg-gray-200 rounded animate-pulse"
                        />
                    ))}
                </div>

                {/* Period Rows */}
                {[...Array(5)].map((_, row) => (
                    <div key={row} className="grid grid-cols-6 gap-2">
                        {/* Period Label */}
                        <div className="h-16 bg-gray-100 rounded" />

                        {/* Cells */}
                        {[...Array(5)].map((_, col) => (
                            <div
                                key={col}
                                className="h-16 bg-gray-200 rounded animate-pulse"
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
