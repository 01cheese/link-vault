"use client"

type TagFilterProps = {
    allTags: string[]
    selectedTags: string[]
    onToggleTag: (tag: string) => void
    onClearAll: () => void
    getTagCount: (tag: string) => number
}

export default function TagFilter({
                                      allTags,
                                      selectedTags,
                                      onToggleTag,
                                      onClearAll,
                                      getTagCount
                                  }: TagFilterProps) {

    if (allTags.length === 0) return null

    return (
        <div className="mb-6 p-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Filter by Tags</h3>
                {selectedTags.length > 0 && (
                    <button
                        onClick={onClearAll}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        Clear all
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => onToggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedTags.includes(tag)
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
                        }`}>
                        {tag}
                        <span className="ml-2 text-xs opacity-75">
                            ({getTagCount(tag)})
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}