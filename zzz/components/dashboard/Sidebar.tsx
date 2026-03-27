"use client"

import { Star, LogOut, FolderPlus, Edit2, X, Link as LinkIcon } from "lucide-react"
import { Collection } from "@/lib/types"
import StorageIndicator from "@/components/dashboard/StorageIndicator"
import { useState } from "react"

type SidebarProps = {
    userEmail?: string
    collections: Collection[]
    selectedCollection: string | null
    showFavoritesOnly: boolean
    linksCount: number
    favoritesCount: number
    onSelectAll: () => void
    onSelectFavorites: () => void
    onSelectCollection: (id: string) => void
    onAddCollection: () => void
    onEditCollection: (id: string) => void
    onDeleteCollection: (id: string) => void
    onLogout: () => void
    editingCollection: string | null
    onUpdateCollection: (id: string, name: string, icon: string) => void
    setEditingCollection: (id: string | null) => void
    getLinksInCollection: (id: string) => number
    storageUsedBytes: number
    storageLimitBytes: number
    storageLoading?: boolean
    mobileOpen: boolean
    onMobileClose: () => void
}

function NavItem({ active, onClick, icon, label, count }: {
    active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count?: number
}) {
    return (
        <button
            onClick={onClick}
            style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "9px 10px", borderRadius: "var(--radius-sm)", border: "none",
                cursor: "pointer", transition: "background .12s",
                background: active ? "var(--accent-dim)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-soft)",
                fontWeight: active ? 600 : 400, fontSize: 13,
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--surface-2)" }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
        >
            <span style={{ flexShrink: 0 }}>{icon}</span>
            <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
            {count !== undefined && (
                <span style={{ fontSize: 11, color: active ? "var(--accent)" : "var(--text-muted)", fontWeight: 600, flexShrink: 0 }}>
                    {count}
                </span>
            )}
        </button>
    )
}

const iconOptions = ["📁","💼","🎨","📚","💻","🎮","🎵","📺","🏠","✈️","🍔","⚡","🔥","⭐","💡","🚀"]

function SidebarInner(props: SidebarProps & { onNavClick: () => void }) {
    const {
        userEmail, collections, selectedCollection, showFavoritesOnly,
        linksCount, favoritesCount, onSelectAll, onSelectFavorites,
        onSelectCollection, onAddCollection, onEditCollection, onDeleteCollection,
        onLogout, editingCollection, onUpdateCollection, setEditingCollection,
        getLinksInCollection, storageUsedBytes, storageLimitBytes, storageLoading,
        onNavClick,
    } = props

    const [hoveredId, setHoveredId] = useState<string | null>(null)

    const nav = (fn: () => void) => { fn(); onNavClick() }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ padding: "18px 16px 16px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 8, background: "var(--accent)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14,
                    }}>⚡</div>
                    <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>LinkVault</span>
                </div>
                {userEmail && (
                    <div style={{
                        marginTop: 8, fontSize: 10, color: "var(--text-muted)", fontWeight: 500,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{userEmail}</div>
                )}
            </div>

            <div style={{ padding: "10px 8px", flex: 1, overflow: "hidden auto" }}>
                <NavItem active={selectedCollection === null && !showFavoritesOnly} onClick={() => nav(onSelectAll)} icon={<LinkIcon size={14} />} label="All Links" count={linksCount} />
                <NavItem active={showFavoritesOnly} onClick={() => nav(onSelectFavorites)} icon={<Star size={14} />} label="Favorites" count={favoritesCount} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 10px 6px" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Collections</span>
                    <button onClick={onAddCollection} style={{ width: 20, height: 20, border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                        <FolderPlus size={13} />
                    </button>
                </div>

                {collections.map(c => (
                    <div key={c.id} style={{ position: "relative" }} onMouseEnter={() => setHoveredId(c.id)} onMouseLeave={() => setHoveredId(null)}>
                        {editingCollection === c.id ? (
                            <div style={{ display: "flex", gap: 4, padding: "4px 4px" }}>
                                <select value={c.icon} onChange={e => onUpdateCollection(c.id, c.name, e.target.value)} style={{ width: 34, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 13, color: "var(--text)", cursor: "pointer" }}>
                                    {iconOptions.map(ico => <option key={ico} value={ico}>{ico}</option>)}
                                </select>
                                <input
                                    autoFocus defaultValue={c.name}
                                    onBlur={e => onUpdateCollection(c.id, e.target.value, c.icon)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") onUpdateCollection(c.id, e.currentTarget.value, c.icon)
                                        if (e.key === "Escape") setEditingCollection(null)
                                    }}
                                    style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--accent)", borderRadius: 5, padding: "3px 7px", fontSize: 12, color: "var(--text)", outline: "none" }}
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => nav(() => onSelectCollection(c.id))}
                                style={{
                                    width: "100%", display: "flex", alignItems: "center", gap: 7,
                                    padding: "9px 10px", borderRadius: "var(--radius-sm)", border: "none",
                                    cursor: "pointer", transition: "background .12s",
                                    background: selectedCollection === c.id ? "var(--accent-dim)" : "transparent",
                                    color: selectedCollection === c.id ? "var(--accent)" : "var(--text-soft)", fontSize: 13,
                                }}
                                onMouseEnter={e => { if (selectedCollection !== c.id) e.currentTarget.style.background = "var(--surface-2)" }}
                                onMouseLeave={e => { if (selectedCollection !== c.id) e.currentTarget.style.background = "transparent" }}
                            >
                                <span style={{ fontSize: 14, flexShrink: 0 }}>{c.icon}</span>
                                <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: selectedCollection === c.id ? 600 : 400 }}>{c.name}</span>
                                <span style={{ fontSize: 11, color: selectedCollection === c.id ? "var(--accent)" : "var(--text-muted)", flexShrink: 0 }}>{getLinksInCollection(c.id)}</span>
                                {hoveredId === c.id && (
                                    <span style={{ display: "flex", gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                                        <span onClick={e => { e.stopPropagation(); onEditCollection(c.id) }} style={{ width: 20, height: 20, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", cursor: "pointer" }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text)"}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
                                        ><Edit2 size={11} /></span>
                                        <span onClick={e => { e.stopPropagation(); onDeleteCollection(c.id) }} style={{ width: 20, height: 20, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", cursor: "pointer" }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--danger)"}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
                                        ><X size={11} /></span>
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ padding: "8px 12px 12px", borderTop: "1px solid var(--border)" }}>
                {!storageLoading && <StorageIndicator usedBytes={storageUsedBytes} limitBytes={storageLimitBytes} loading={storageLoading} />}
                <button
                    onClick={onLogout}
                    style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", marginTop: 8, padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, fontWeight: 500, transition: "all .12s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "var(--danger-dim)" }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent" }}
                >
                    <LogOut size={13} /> Logout
                </button>
            </div>
        </div>
    )
}

export default function Sidebar(props: SidebarProps) {
    const { mobileOpen, onMobileClose } = props

    return (
        <>
            {/* Desktop */}
            <aside className="sidebar-desktop" style={{
                width: "var(--sidebar)", background: "var(--surface)", flexShrink: 0,
                borderRight: "1px solid var(--border)", overflow: "hidden",
            }}>
                <SidebarInner {...props} onNavClick={() => {}} />
            </aside>

            {/* Mobile backdrop */}
            <div
                className="sidebar-backdrop"
                onClick={onMobileClose}
                style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
                    zIndex: 40, backdropFilter: "blur(3px)",
                    opacity: mobileOpen ? 1 : 0,
                    pointerEvents: mobileOpen ? "all" : "none",
                    transition: "opacity 0.25s",
                }}
            />

            {/* Mobile drawer */}
            <aside
                className="sidebar-drawer"
                style={{
                    position: "fixed", top: 0, left: 0, bottom: 0,
                    width: 280, background: "var(--surface)",
                    borderRight: "1px solid var(--border)", zIndex: 50,
                    transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.28s cubic-bezier(.16,1,.3,1)",
                    overflow: "hidden",
                }}
            >
                <button
                    onClick={onMobileClose}
                    style={{
                        position: "absolute", top: 14, right: 14, zIndex: 1,
                        width: 28, height: 28, borderRadius: 8,
                        border: "1px solid var(--border)", background: "var(--surface-2)",
                        color: "var(--text-soft)", display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer",
                    }}
                ><X size={14} /></button>
                <SidebarInner {...props} onNavClick={onMobileClose} />
            </aside>
        </>
    )
}
