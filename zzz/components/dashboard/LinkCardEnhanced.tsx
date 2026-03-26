"use client"

import { Star, Trash2, ExternalLink, Globe } from "lucide-react"
import { LinkType } from "@/lib/types"

type Props = {
    link: LinkType
    onToggleFavorite: () => void
    onDelete: () => void
    onTagClick?: (tag: string) => void
}

export default function LinkCardEnhanced({ link, onToggleFavorite, onDelete, onTagClick }: Props) {
    const isLoading = link._loading

    let hostname = link.url
    try { hostname = new URL(link.url).hostname.replace("www.", "") } catch {}

    return (
        <div
            className="fade-up"
            style={{
                background: "var(--surface)",
                border: isLoading ? "1px solid var(--accent-dim)" : "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "14px 16px",
                transition: "border-color .15s, box-shadow .15s",
                position: "relative",
                overflow: "hidden",
            }}
            onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)" }}
            onMouseLeave={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.borderColor = "var(--border)" }}
        >
            {/* Loading bar */}
            {isLoading && (
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
                    animation: "shimmer 1.5s ease-in-out infinite",
                    backgroundSize: "200% 100%",
                }} />
            )}

            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>

                {/* Favicon */}
                <div style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0, overflow: "hidden",
                    background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center",
                    marginTop: 1,
                }}>
                    {isLoading ? (
                        <div className="shimmer-bg" style={{ width: "100%", height: "100%", borderRadius: 7 }} />
                    ) : link.favicon ? (
                        <img src={link.favicon} alt="" style={{ width: 16, height: 16, objectFit: "contain" }}
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none" }} />
                    ) : (
                        <Globe size={13} style={{ color: "var(--text-muted)" }} />
                    )}
                </div>

                {/* Title + URL */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {isLoading ? (
                        <>
                            <div className="shimmer-bg" style={{ height: 14, width: "70%", borderRadius: 4, marginBottom: 5 }} />
                            <div className="shimmer-bg" style={{ height: 11, width: "45%", borderRadius: 4 }} />
                        </>
                    ) : (
                        <>
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "block", fontWeight: 600, fontSize: 13,
                                    color: "var(--text)", textDecoration: "none",
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    lineHeight: 1.4,
                                }}
                                onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                                onMouseLeave={e => (e.currentTarget.style.color = "var(--text)")}
                            >
                                {link.title || hostname}
                            </a>
                            <div style={{
                                fontSize: 11, color: "var(--text-muted)", fontWeight: 400,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                marginTop: 2,
                            }}>
                                {hostname}
                            </div>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 2, flexShrink: 0, opacity: isLoading ? 0 : 1 }}>
                    <button onClick={onToggleFavorite} style={{
                        width: 26, height: 26, border: "none", background: "transparent",
                        cursor: "pointer", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                        color: link.is_favorite ? "var(--warning)" : "var(--text-muted)", transition: "color .15s",
                    }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                        <Star size={14} fill={link.is_favorite ? "currentColor" : "none"} />
                    </button>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{
                        width: 26, height: 26, border: "none", background: "transparent",
                        cursor: "pointer", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--text-muted)", textDecoration: "none", transition: "color .15s",
                    }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--surface-2)", (e.currentTarget as HTMLElement).style.color = "var(--text)")}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent", (e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
                    >
                        <ExternalLink size={14} />
                    </a>
                    <button onClick={onDelete} style={{
                        width: 26, height: 26, border: "none", background: "transparent",
                        cursor: "pointer", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--text-muted)", transition: "color .15s",
                    }}
                        onMouseEnter={e => ((e.currentTarget.style.background = "var(--danger-dim)"), (e.currentTarget.style.color = "var(--danger)"))}
                        onMouseLeave={e => ((e.currentTarget.style.background = "transparent"), (e.currentTarget.style.color = "var(--text-muted)"))}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Description */}
            {!isLoading && link.description && (
                <p style={{
                    fontSize: 11, color: "var(--text-soft)", lineHeight: 1.6,
                    margin: "6px 0", overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                }}>
                    {link.description}
                </p>
            )}

            {/* Loading description shimmer */}
            {isLoading && (
                <div style={{ margin: "6px 0" }}>
                    <div className="shimmer-bg" style={{ height: 10, width: "90%", borderRadius: 3, marginBottom: 4 }} />
                    <div className="shimmer-bg" style={{ height: 10, width: "60%", borderRadius: 3 }} />
                </div>
            )}

            {/* Tags */}
            {!isLoading && link.tags && link.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                    {link.tags.map(tag => (
                        <button key={tag} onClick={() => onTagClick?.(tag)} style={{
                            padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 500,
                            background: "var(--surface-2)", color: "var(--text-soft)",
                            border: "1px solid var(--border)", cursor: "pointer", transition: "all .12s",
                        }}
                            onMouseEnter={e => ((e.currentTarget.style.background = "var(--accent-dim)"), (e.currentTarget.style.color = "var(--accent)"), (e.currentTarget.style.borderColor = "rgba(59,130,246,.3)"))}
                            onMouseLeave={e => ((e.currentTarget.style.background = "var(--surface-2)"), (e.currentTarget.style.color = "var(--text-soft)"), (e.currentTarget.style.borderColor = "var(--border)"))}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Loading tags shimmer */}
            {isLoading && (
                <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                    <div className="shimmer-bg" style={{ height: 18, width: 48, borderRadius: 20 }} />
                    <div className="shimmer-bg" style={{ height: 18, width: 64, borderRadius: 20 }} />
                    <div className="shimmer-bg" style={{ height: 18, width: 40, borderRadius: 20 }} />
                </div>
            )}

            {isLoading && (
                <div style={{ marginTop: 8, fontSize: 10, color: "var(--accent)", fontWeight: 500 }}>
                    Fetching metadata…
                </div>
            )}
        </div>
    )
}
