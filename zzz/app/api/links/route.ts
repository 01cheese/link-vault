import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024; // 10 MB

// Estimate the size of a link record in bytes
function estimateLinkSize(link: Record<string, unknown>): number {
    return new TextEncoder().encode(JSON.stringify(link)).length;
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const { url, title, description, image, favicon } = body;

        if (!url) {
            return NextResponse.json(
                { error: "URL required" },
                { status: 400 }
            );
        }

        // ===== Check storage usage =====
        const { data: existingLinks } = await supabase
            .from("links")
            .select("*")
            .eq("user_id", user.id);

        const usedBytes = (existingLinks || []).reduce(
            (sum: number, link: Record<string, unknown>) => sum + estimateLinkSize(link),
            0
        );

        const newLinkSize = estimateLinkSize({ url, title, description, image, favicon });

        if (usedBytes + newLinkSize > STORAGE_LIMIT_BYTES) {
            return NextResponse.json(
                { error: "Storage limit reached" },
                { status: 403 }
            );
        }

        // ===== Create link =====
        const { data, error } = await supabase
            .from("links")
            .insert({
                user_id: user.id,
                url,
                title,
                description,
                image,
                favicon
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Internal error" },
            { status: 500 }
        );
    }
}
