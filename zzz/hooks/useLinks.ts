"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { LinkType } from "@/lib/types"
import { normalizeUrl } from "@/utils/linkUtils"

const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024 // 10 MB

function estimateLinkSize(data: Record<string, unknown>): number {
    const fields = [data.url, data.title, data.description, data.favicon, data.image,
        Array.isArray(data.tags) ? (data.tags as string[]).join(",") : ""]
    return fields.reduce<number>((sum, val) => {
        if (!val || typeof val !== "string") return sum
        return sum + new TextEncoder().encode(val).length
    }, 0)
}

export const useLinks = (userId: string | undefined, onUsageChange?: () => void) => {
    const [links, setLinks] = useState<LinkType[]>([])

    const loadLinks = async () => {
        if (!userId) return
        const { data } = await supabase
            .from("links").select("*").eq("user_id", userId)
            .order("created_at", { ascending: false })
        if (data) setLinks(data)
    }

    /**
     * ASYNC (OPTIMISTIC) ADD:
     * 1. Size check
     * 2. Insert minimal record immediately → modal closes, card appears
     * 3. Background: fetch metadata via /api/parse-link
     * 4. Update supabase + local state when metadata arrives
     */
    const addLink = async (
        url: string,
        title: string,
        tags: string,
        collectionId: string | null
    ) => {
        if (!userId) return null

        const normalizedUrl = normalizeUrl(url)
        const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean)

        let hostname = normalizedUrl
        try { hostname = new URL(normalizedUrl).hostname } catch {}

        const quickTitle = title.trim() || hostname

        const quickLinkData = {
            user_id:       userId,
            url:           normalizedUrl,
            title:         quickTitle,
            description:   null,
            favicon:       null,
            image:         null,
            tags:          tagsArray,
            collection_id: collectionId,
            is_favorite:   false,
        }

        // ── Storage limit check ──
        const { data: existingLinks } = await supabase
            .from("links").select("url,title,description,favicon,image,tags")
            .eq("user_id", userId)

        const usedBytes = (existingLinks || []).reduce<number>(
            (sum, link) => sum + estimateLinkSize(link as Record<string, unknown>), 0)

        if (usedBytes + estimateLinkSize(quickLinkData as Record<string, unknown>) > STORAGE_LIMIT_BYTES) {
            return "LIMIT_REACHED"
        }

        // ── Insert immediately ──
        const { data, error } = await supabase
            .from("links").insert([quickLinkData]).select()

        if (error || !data?.[0]) {
            console.error("Supabase insert error:", error)
            return null
        }

        const savedLink: LinkType = data[0]

        // Add to state immediately with loading flag
        setLinks(prev => [{ ...savedLink, _loading: true }, ...prev])
        onUsageChange?.()

        // ── Background: fetch real metadata ──
        ;(async () => {
            try {
                const res = await fetch("/api/parse-link", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: normalizedUrl }),
                })

                if (!res.ok) throw new Error("parse-link failed")
                const meta = await res.json()

                const cleanTitle = (title.trim() || meta?.title || hostname)
                    .replace(/<[^>]*>/g, "").trim()

                const updates = {
                    title:       cleanTitle,
                    description: meta?.description || null,
                    favicon:     meta?.favicon     || null,
                    image:       meta?.image       || null,
                }

                const { data: updated } = await supabase
                    .from("links").update(updates).eq("id", savedLink.id).select().single()

                setLinks(prev => prev.map(l =>
                    l.id === savedLink.id
                        ? { ...(updated || l), ...updates, _loading: false }
                        : l
                ))
            } catch {
                // Remove loading indicator on error, keep basic link
                setLinks(prev => prev.map(l =>
                    l.id === savedLink.id ? { ...l, _loading: false } : l
                ))
            }
        })()

        return savedLink
    }

    const updateLink = async (id: string, updates: Partial<LinkType>) => {
        const { data, error } = await supabase
            .from("links").update(updates).eq("id", id).select().single()
        if (data && !error) {
            setLinks(prev => prev.map(l => l.id === id ? data : l))
            return data
        }
        return null
    }

    const deleteLink = async (id: string) => {
        const { error } = await supabase.from("links").delete().eq("id", id)
        if (!error) {
            setLinks(prev => prev.filter(l => l.id !== id))
            onUsageChange?.()
            return true
        }
        return false
    }

    const deleteLinks = async (ids: string[]) => {
        const { error } = await supabase.from("links").delete().in("id", ids)
        if (!error) {
            setLinks(prev => prev.filter(l => !ids.includes(l.id)))
            onUsageChange?.()
            return true
        }
        return false
    }

    const toggleFavorite = async (link: LinkType) => {
        return updateLink(link.id, { is_favorite: !link.is_favorite })
    }

    return { links, loadLinks, addLink, updateLink, deleteLink, deleteLinks, toggleFavorite }
}
