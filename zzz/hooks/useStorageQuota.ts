"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024; // 10 MB

function estimateLinkSize(data: Record<string, unknown>): number {
    const fields = [
        data.url,
        data.title,
        data.description,
        data.favicon,
        data.image,
        Array.isArray(data.tags) ? (data.tags as string[]).join(",") : "",
    ];
    return fields.reduce<number>((sum, val) => {
        if (!val || typeof val !== "string") return sum;
        return sum + new TextEncoder().encode(val).length;
    }, 0);
}

export type StorageQuota = {
    usedBytes: number;
    limitBytes: number;
    count: number;
    loading: boolean;
};

export function useStorageQuota(userId?: string): StorageQuota & { refresh: () => Promise<void> } {
    const [quota, setQuota] = useState<StorageQuota>({
        usedBytes: 0,
        limitBytes: STORAGE_LIMIT_BYTES,
        count: 0,
        loading: true,
    });

    const refresh = useCallback(async () => {
        if (!userId) {
            setQuota(q => ({ ...q, loading: false }));
            return;
        }

        const { data: links } = await supabase
            .from("links")
            .select("url, title, description, favicon, image, tags")
            .eq("user_id", userId);

        const usedBytes = (links || []).reduce<number>(
            (sum, link) => sum + estimateLinkSize(link as Record<string, unknown>),
            0
        );

        setQuota({
            usedBytes,
            limitBytes: STORAGE_LIMIT_BYTES,
            count: (links || []).length,
            loading: false,
        });
    }, [userId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { ...quota, refresh };
}