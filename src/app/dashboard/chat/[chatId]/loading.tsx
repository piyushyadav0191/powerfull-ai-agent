export default function Loading() {

    const numMessages = Math.floor(Math.random() * 10) + 1;

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4">
            {Array.from({ length: numMessages }).map((_, index) => (
            <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
                </div>
            </div>
            ))}
        </div>
    )

}