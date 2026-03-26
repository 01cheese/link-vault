"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useCollections } from "@/hooks/useCollections"
import { useLinks } from "@/hooks/useLinks"
import { useStorageQuota } from "@/hooks/useStorageQuota"
import { validateUrl, normalizeUrl, exportToJSON } from "@/utils/linkUtils"

import Sidebar from "@/components/dashboard/Sidebar"
import TopBar from "@/components/dashboard/TopBar"
import LinkCardEnhanced from "@/components/dashboard/LinkCardEnhanced"
import TagFilter from "@/components/dashboard/TagFilter"
import ActiveFilters from "@/components/dashboard/ActiveFilters"
import AddLinkModal from "@/components/dashboard/AddLinkModal"
import AddCollectionModal from "@/components/dashboard/AddCollectionModal"
import LimitReachedModal from "@/components/dashboard/LimitReachedModal"

export default function Dashboard() {

    const { user, loading: authLoading, logout } = useAuth()
    const { usedBytes, limitBytes, loading: storageLoading, refresh: refreshStorage } = useStorageQuota(user?.id)

    const {
        collections,
        loadCollections,
        addCollection,
        updateCollection,
        deleteCollection
    } = useCollections(user?.id)

    const {
        links,
        loadLinks,
        addLink,
        updateLink,
        deleteLink,
        deleteLinks,
        toggleFavorite
    } = useLinks(user?.id, refreshStorage)

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

    const [selectedLinks, setSelectedLinks] = useState<string[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingCollection, setEditingCollection] = useState<string | null>(null)

    const [view, setView] = useState<"grid" | "list">("grid")
    const [sort, setSort] = useState("newest")

    const [showAddLink, setShowAddLink] = useState(false)
    const [showAddCollection, setShowAddCollection] = useState(false)
    const [showTagFilter, setShowTagFilter] = useState(false)
    const [showLimitModal, setShowLimitModal] = useState(false)
    const [isAddingLink, setIsAddingLink] = useState(false)

    const [newLink, setNewLink] = useState({ url: "", title: "", tags: "" })
    const [newCollection, setNewCollection] = useState({ name: "", icon: "📁" })

    useEffect(() => {
        if (user) {
            loadCollections()
            loadLinks()
        }
    }, [user])

    // ================= LIMIT CHECK =================

    const canAddLink = () => usedBytes < limitBytes

    // ================= HANDLERS =================

    const handleAddLinkClick = () => {
        if (!canAddLink()) {
            setShowLimitModal(true)
            return
        }
        setShowAddLink(true)
    }

    const handleAddLink = async () => {
        if (!newLink.url.trim()) {
            alert("Please enter a URL")
            return
        }

        const normalized = normalizeUrl(newLink.url)

        if (!validateUrl(normalized)) {
            alert("Please enter a valid URL")
            return
        }

        setIsAddingLink(true)

        try {
            const result = await addLink(
                normalized,
                newLink.title,
                newLink.tags,
                selectedCollection
            )

            if (result === "LIMIT_REACHED") {
                setShowAddLink(false)
                setShowLimitModal(true)
                await refreshStorage()
                return
            }

            if (result) {
                setShowAddLink(false)
                setNewLink({ url: "", title: "", tags: "" })
                await refreshStorage()
            } else {
                alert("Failed to add link. Please try again.")
            }
        } catch {
            alert("An error occurred while adding the link.")
        } finally {
            setIsAddingLink(false)
        }
    }

    const handleAddCollection = async () => {
        if (!newCollection.name.trim()) {
            alert("Please enter a collection name")
            return
        }

        const result = await addCollection(newCollection.name, newCollection.icon)

        if (result) {
            setShowAddCollection(false)
            setNewCollection({ name: "", icon: "📁" })
        } else {
            alert("Failed to create collection")
        }
    }

    const handleUpdateCollection = async (id: string, name: string, icon: string) => {
        if (!name.trim()) return
        await updateCollection(id, name, icon)
        setEditingCollection(null)
    }

    const handleDeleteCollection = async (id: string) => {
        const linksInCollection = links.filter(l => l.collection_id === id).length

        const confirmed = confirm(
            linksInCollection > 0
                ? `This collection contains ${linksInCollection} link(s). Delete anyway? Links will not be deleted.`
                : "Delete this collection?"
        )

        if (!confirmed) return

        const success = await deleteCollection(id)

        if (success && selectedCollection === id) {
            setSelectedCollection(null)
        }
    }

    const handleDeleteLink = async (id: string) => {
        const confirmed = confirm("Are you sure you want to delete this link?")
        if (!confirmed) return
        await deleteLink(id)
        await refreshStorage()
    }

    const handleDeleteSelected = async () => {
        if (selectedLinks.length === 0) {
            alert("No links selected")
            return
        }

        const confirmed = confirm(`Delete ${selectedLinks.length} link(s)?`)
        if (!confirmed) return

        await deleteLinks(selectedLinks)
        setSelectedLinks([])
        await refreshStorage()
    }

    const handleUpdateTitle = async (id: string, title: string) => {
        if (!title.trim()) return
        await updateLink(id, { title: title.trim() })
        setEditingId(null)
    }

    const handleToggleFavorite = async (link: any) => {
        await toggleFavorite(link)
    }

    const toggleSelect = (id: string) => {
        setSelectedLinks(prev =>
            prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
        )
    }

    const selectAll = () => {
        if (selectedLinks.length === filteredLinks.length && filteredLinks.length > 0) {
            setSelectedLinks([])
        } else {
            setSelectedLinks(filteredLinks.map(l => l.id))
        }
    }

    const allTags = Array.from(new Set(links.flatMap(link => link.tags || []))).sort()

    const toggleTagFilter = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }

    const clearTagFilters = () => setSelectedTags([])

    const getTagCount = (tag: string) => links.filter(l => l.tags?.includes(tag)).length

    const filteredLinks = links.filter(link => {
        const matchesSearch =
            link.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesCollection = !selectedCollection || link.collection_id === selectedCollection
        const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => link.tags?.includes(tag))
        const matchesFavorites = !showFavoritesOnly || link.is_favorite

        return matchesSearch && matchesCollection && matchesTags && matchesFavorites
    })

    const sortedLinks = [...filteredLinks].sort((a, b) => {
        if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        if (sort === "title") return a.title.localeCompare(b.title)
        return 0
    })

    const handleExportJSON = () => {
        const filename = `links-export-${new Date().toISOString().split('T')[0]}.json`
        exportToJSON(sortedLinks, filename)
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-neutral-950">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-neutral-950 transition-colors">

            <Sidebar
                userEmail={user?.email}
                collections={collections}
                selectedCollection={selectedCollection}
                showFavoritesOnly={showFavoritesOnly}
                linksCount={links.length}
                favoritesCount={links.filter(l => l.is_favorite).length}
                onSelectAll={() => { setSelectedCollection(null); setShowFavoritesOnly(false) }}
                onSelectFavorites={() => { setSelectedCollection(null); setShowFavoritesOnly(true) }}
                onSelectCollection={(id) => { setSelectedCollection(id); setShowFavoritesOnly(false) }}
                onAddCollection={() => setShowAddCollection(true)}
                onEditCollection={(id) => setEditingCollection(id)}
                onDeleteCollection={handleDeleteCollection}
                onLogout={logout}
                editingCollection={editingCollection}
                onUpdateCollection={handleUpdateCollection}
                setEditingCollection={setEditingCollection}
                getLinksInCollection={(id) => links.filter(l => l.collection_id === id).length}
                storageUsedBytes={usedBytes}
                storageLimitBytes={limitBytes}
                storageLoading={storageLoading}
            />

            <main className="flex-1 p-6 overflow-y-auto relative">

                <TopBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onAddLink={handleAddLinkClick}
                    onToggleTagFilter={() => setShowTagFilter(!showTagFilter)}
                    selectedTagsCount={selectedTags.length}
                    showTagFilter={showTagFilter}
                    onSelectAll={selectAll}
                    selectedLinksCount={selectedLinks.length}
                    filteredLinksCount={filteredLinks.length}
                    onDeleteSelected={handleDeleteSelected}
                    onExportJSON={handleExportJSON}
                    sort={sort}
                    onSortChange={setSort}
                    view={view}
                    onViewChange={setView}
                />

                {showTagFilter && (
                    <TagFilter
                        allTags={allTags}
                        selectedTags={selectedTags}
                        onToggleTag={toggleTagFilter}
                        onClearAll={clearTagFilters}
                        getTagCount={getTagCount}
                    />
                )}

                <ActiveFilters
                    selectedTags={selectedTags}
                    selectedCollection={selectedCollection}
                    showFavoritesOnly={showFavoritesOnly}
                    collections={collections}
                    onRemoveTag={toggleTagFilter}
                    onRemoveCollection={() => setSelectedCollection(null)}
                    onRemoveFavorites={() => setShowFavoritesOnly(false)}
                />

                {sortedLinks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p className="text-lg mb-2">No links found</p>
                        <p className="text-sm">
                            {selectedTags.length > 0 || selectedCollection || searchQuery
                                ? "Try adjusting your filters"
                                : "Add your first link to get started"}
                        </p>
                    </div>
                ) : (
                    <div className={view === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                        {sortedLinks.map(link => (
                            <LinkCardEnhanced
                                key={link.id}
                                link={link}
                                onToggleFavorite={() => handleToggleFavorite(link)}
                                onDelete={() => handleDeleteLink(link.id)}
                                onTagClick={toggleTagFilter}
                            />
                        ))}
                    </div>
                )}

            </main>

            <AddLinkModal
                isOpen={showAddLink}
                onClose={() => { setShowAddLink(false); setNewLink({ url: "", title: "", tags: "" }) }}
                url={newLink.url}
                title={newLink.title}
                tags={newLink.tags}
                onUrlChange={(url) => setNewLink({ ...newLink, url })}
                onTitleChange={(title) => setNewLink({ ...newLink, title })}
                onTagsChange={(tags) => setNewLink({ ...newLink, tags })}
                onSubmit={handleAddLink}
                isAdding={isAddingLink}
                selectedCollection={selectedCollection}
                collections={collections}
            />

            <AddCollectionModal
                isOpen={showAddCollection}
                onClose={() => { setShowAddCollection(false); setNewCollection({ name: "", icon: "📁" }) }}
                name={newCollection.name}
                icon={newCollection.icon}
                onNameChange={(name) => setNewCollection({ ...newCollection, name })}
                onIconChange={(icon) => setNewCollection({ ...newCollection, icon })}
                onSubmit={handleAddCollection}
            />

            <LimitReachedModal
                isOpen={showLimitModal}
                onClose={() => setShowLimitModal(false)}
            />

        </div>
    )
}