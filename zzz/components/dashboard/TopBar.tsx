"use client"

import { Search, Plus, Tag as TagIcon, Trash2, Download, LayoutGrid, List } from "lucide-react"

export type ViewMode = "grid" | "list"

type TopBarProps = {
    searchQuery: string
    onSearchChange: (q: string) => void
    onAddLink: () => void
    onToggleTagFilter: () => void
    selectedTagsCount: number
    showTagFilter: boolean
    onSelectAll: () => void
    selectedLinksCount: number
    filteredLinksCount: number
    onDeleteSelected: () => void
    onExportJSON: () => void
    sort: string
    onSortChange: (s: string) => void
    view: ViewMode
    onViewChange: (v: ViewMode) => void
}

function Btn({
    onClick, children, active = false, danger = false, style: extraStyle = {}
}: {
    onClick: () => void, children: React.ReactNode, active?: boolean, danger?: boolean, style?: React.CSSProperties
}) {
    return (
        <button
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "0 10px", height: 30, borderRadius: "var(--radius-sm)",
                border: `1px solid ${danger ? "rgba(239,68,68,.25)" : active ? "rgba(59,130,246,.3)" : "var(--border)"}`,
                background: danger ? "var(--danger-dim)" : active ? "var(--accent-dim)" : "var(--surface-2)",
                color: danger ? "var(--danger)" : active ? "var(--accent)" : "var(--text-soft)",
                fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "all .12s",
                whiteSpace: "nowrap", flexShrink: 0,
                ...extraStyle,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = ".8")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
            {children}
        </button>
    )
}

export default function TopBar({
    searchQuery, onSearchChange, onAddLink,
    onToggleTagFilter, selectedTagsCount, showTagFilter,
    onSelectAll, selectedLinksCount, filteredLinksCount,
    onDeleteSelected, onExportJSON, sort, onSortChange,
    view, onViewChange,
}: TopBarProps) {

    return (
        <div style={{ marginBottom: 20 }}>

            {/* Row 1 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {/* Search */}
                <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
                    <Search size={13} style={{
                        position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                        color: "var(--text-muted)", pointerEvents: "none",
                    }} />
                    <input
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Search links…"
                        style={{
                            width: "100%", paddingLeft: 32, paddingRight: 12, height: 36,
                            background: "var(--surface-2)", border: "1px solid var(--border)",
                            borderRadius: "var(--radius)", fontSize: 13, color: "var(--text)",
                            outline: "none", fontWeight: 400, transition: "border-color .15s",
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                </div>

                {/* Add link CTA */}
                <button
                    onClick={onAddLink}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "0 14px", height: 36, borderRadius: "var(--radius)",
                        background: "var(--accent)", border: "none",
                        color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
                        transition: "opacity .15s", flexShrink: 0,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = ".9")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                    <Plus size={14} strokeWidth={2.5} />
                    Add Link
                </button>
            </div>

            {/* Row 2 */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>

                <Btn onClick={onToggleTagFilter} active={selectedTagsCount > 0 || showTagFilter}>
                    <TagIcon size={11} />
                    Tags
                    {selectedTagsCount > 0 && (
                        <span style={{
                            background: "var(--accent)", color: "#fff",
                            borderRadius: 20, padding: "0 5px", fontSize: 9, fontWeight: 700, lineHeight: "16px"
                        }}>{selectedTagsCount}</span>
                    )}
                </Btn>

                <Btn onClick={onSelectAll} active={selectedLinksCount > 0 && selectedLinksCount === filteredLinksCount}>
                    {selectedLinksCount === filteredLinksCount && filteredLinksCount > 0 ? "Deselect All" : "Select All"}
                </Btn>

                {selectedLinksCount > 0 && (
                    <Btn onClick={onDeleteSelected} danger>
                        <Trash2 size={11} />
                        Delete {selectedLinksCount}
                    </Btn>
                )}

                <Btn onClick={onExportJSON}>
                    <Download size={11} />
                    Export
                </Btn>

                <div style={{ flex: 1 }} />

                {/* Sort */}
                <select
                    value={sort}
                    onChange={e => onSortChange(e.target.value)}
                    style={{
                        height: 30, padding: "0 8px", borderRadius: "var(--radius-sm)",
                        background: "var(--surface-2)", border: "1px solid var(--border)",
                        color: "var(--text-soft)", fontSize: 11, fontWeight: 500, cursor: "pointer",
                        outline: "none",
                    }}
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="title">A → Z</option>
                </select>

                {/* View toggle */}
                <div style={{
                    display: "flex", borderRadius: "var(--radius-sm)", overflow: "hidden",
                    border: "1px solid var(--border)",
                }}>
                    {([["grid", LayoutGrid], ["list", List]] as const).map(([mode, Icon]) => (
                        <button
                            key={mode}
                            onClick={() => onViewChange(mode as ViewMode)}
                            style={{
                                width: 30, height: 30, border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: view === mode ? "var(--accent)" : "var(--surface-2)",
                                color: view === mode ? "#fff" : "var(--text-muted)",
                                transition: "all .12s",
                            }}
                        >
                            <Icon size={13} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
