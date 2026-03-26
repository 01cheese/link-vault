"use client"

import { X } from "lucide-react"
import { Collection } from "@/lib/types"

type ActiveFiltersProps = {
    selectedTags: string[]
    selectedCollection: string | null
    showFavoritesOnly: boolean
    collections: Collection[]
    onRemoveTag: (tag: string) => void
    onRemoveCollection: () => void
    onRemoveFavorites: () => void
}

export default function ActiveFilters({
                                          selectedTags,
                                          selectedCollection,
                                          showFavoritesOnly,
                                          collections,
                                          onRemoveTag,
                                          onRemoveCollection,
                                          onRemoveFavorites
                                      }: ActiveFiltersProps) {

    const hasActiveFilters = selectedTags.length > 0 || selectedCollection || showFavoritesOnly

    if (!hasActiveFilters) return null

    const currentCollection = collections.find(c => c.id === selectedCollection)

    return (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>

            {selectedTags.map(tag => (
                <span
                    key={tag}
                    className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-sm">
                    {tag}
                    <button onClick={() => onRemoveTag(tag)}>
                        <X size={14}/>
                    </button>
                </span>
            ))}

            {selectedCollection && currentCollection && (
                <span className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm">
                    {currentCollection.icon} {currentCollection.name}
                    <button onClick={onRemoveCollection}>
                        <X size={14}/>
                    </button>
                </span>
            )}

            {showFavoritesOnly && (
                <span className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded text-sm">
                    ⭐ Favorites
                    <button onClick={onRemoveFavorites}>
                        <X size={14}/>
                    </button>
                </span>
            )}
        </div>
    )
}