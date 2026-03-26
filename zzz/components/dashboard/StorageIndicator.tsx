"use client";

interface StorageIndicatorProps {
    usedBytes: number;
    limitBytes: number;
    loading?: boolean;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function StorageIndicator({ usedBytes, limitBytes, loading }: StorageIndicatorProps) {
    if (loading) return null;

    const percentage = Math.min((usedBytes / limitBytes) * 100, 100);
    const isNearLimit = percentage >= 80;
    const isAtLimit = percentage >= 100;

    return (
        <div className="px-3 py-2 bg-gray-100 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
            <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Storage</span>
                <span className={`text-xs font-medium ${
                    isAtLimit
                        ? "text-red-600 dark:text-red-400"
                        : isNearLimit
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-gray-700 dark:text-gray-300"
                }`}>
                    {formatBytes(usedBytes)} / {formatBytes(limitBytes)}
                </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${
                        isAtLimit
                            ? "bg-red-600 dark:bg-red-500"
                            : isNearLimit
                                ? "bg-orange-500 dark:bg-orange-400"
                                : "bg-blue-600 dark:bg-blue-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {isAtLimit && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Storage limit reached. Delete some links to free up space.
                </p>
            )}
        </div>
    );
}
