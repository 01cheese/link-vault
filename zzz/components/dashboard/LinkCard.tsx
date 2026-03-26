"use client"

import { Star, ExternalLink, Trash2 } from "lucide-react"
import { LinkType } from "@/lib/types"

type LinkCardProps = {
    link: LinkType
    isSelected: boolean
    isEditing: boolean
    onToggleSelect: () => void
    onToggleFavorite: () => void
    onStartEdit: () => void
    onUpdateTitle: (title: string) => void
    onCancelEdit: () => void
    onDelete: () => void
    onTagClick: (tag: string) => void
}

export default function LinkCard({
                                     link,
                                     isSelected,
                                     isEditing,
                                     onToggleSelect,
                                     onToggleFavorite,
                                     onStartEdit,
                                     onUpdateTitle,
                                     onCancelEdit,
                                     onDelete,
                                     onTagClick
                                 }: LinkCardProps) {

    // Clean title from any HTML tags
    const cleanTitle = link.title?.replace(/<[^>]*>/g, '').trim() || link.url

    // Get domain from URL for display
    const getDomain = (url: string) => {
        try {
            return new URL(url).hostname
        } catch {
            return url
        }
    }

    return (
        <div
            className={`bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-md transition-shadow ${
                isSelected ? "ring-2 ring-blue-500" : ""
            }`}>

            <div className="flex justify-between items-start mb-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggleSelect}
                    className="mt-1 w-4 h-4 cursor-pointer"
                />

                <button
                    onClick={onToggleFavorite}
                    className="transition-colors">
                    <Star
                        size={20}
                        className={link.is_favorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}
                    />
                </button>
            </div>

            {link.image && (
                <img
                    src={link.image}
                    alt={cleanTitle}
                    className="w-full h-40 object-cover rounded mb-3"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                    }}
                />
            )}

            {isEditing ? (
                <input
                    autoFocus
                    defaultValue={cleanTitle}
                    onBlur={(e) => onUpdateTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onUpdateTitle(e.currentTarget.value)
                        }
                        if (e.key === 'Escape') {
                            onCancelEdit()
                        }
                    }}
                    className="border border-blue-500 px-2 py-1 w-full mb-2 rounded focus:outline-none text-gray-900 dark:text-white dark:bg-neutral-800"
                />
            ) : (
                <h3
                    onClick={onStartEdit}
                    className="font-medium mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-900 dark:text-white line-clamp-2"
                    title={cleanTitle}>
                    {cleanTitle}
                </h3>
            )}

            {link.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {link.description}
                </p>
            )}

<a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 hover:underline mb-3 break-all">
            <span className="truncate" title={link.url}>{getDomain(link.url)}</span>
            <ExternalLink size={14} className="flex-shrink-0"/>
        </a>

    {link.tags && link.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
            {link.tags.map((t, i) => (
                <button
                    key={i}
                    onClick={() => onTagClick(t)}
                    className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                    {t}
                </button>
            ))}
        </div>
    )}

    <button
        onClick={onDelete}
        className="mt-3 hover:scale-110 transition-transform">
        <Trash2 size={18} className="text-red-500"/>
    </button>

</div>
)
}