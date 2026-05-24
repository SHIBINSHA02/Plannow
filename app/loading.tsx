// app/loading.tsx
"use client"
export default function Loading() {
    return (
        <div className="min-h-screen p-10 space-y-10">
            {/* Header */}
            <div className="space-y-4">
                <div className="h-10 w-1/2 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-6 w-1/3 bg-gray-200 rounded-lg animate-pulse" />
            </div>

            {/* Stats / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-40 bg-gray-200 rounded-xl animate-pulse"
                    />
                ))}
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                <div className="h-8 w-1/4 bg-gray-200 rounded-lg animate-pulse" />

                <div className="space-y-4">
                    <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-11/12 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-10/12 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-9/12 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>

            {/* Table-like Rows */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="h-16 w-full bg-gray-200 rounded-xl animate-pulse"
                    />
                ))}
            </div>
        </div>
    );
}
