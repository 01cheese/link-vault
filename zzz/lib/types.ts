export type Collection = {
    id: string
    name: string
    icon: string
    user_id: string
    created_at: string
}

export type LinkType = {
    id: string
    user_id: string
    title: string
    url: string
    description?: string | null
    favicon?: string | null
    image?: string | null
    collection_id?: string | null
    tags: string[]
    is_favorite: boolean
    created_at: string
    _loading?: boolean  // runtime-only: metadata fetch in progress
}

export const iconOptions = [
    "📁", "💼", "🎨", "📚", "💻", "🎮",
    "🎵", "📺", "🏠", "✈️", "🍔", "⚡",
    "🔥", "⭐", "💡", "🚀"
]
