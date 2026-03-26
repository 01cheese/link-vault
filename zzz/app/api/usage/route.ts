import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024; // 10 MB

function estimateLinkSize(link: Record<string, unknown>): number {
    const fields: unknown[] = [
        link.url,
        link.title,
        link.description,
        link.favicon,
        link.image,
        Array.isArray(link.tags) ? (link.tags as string[]).join(",") : "",
    ];

    return fields.reduce<number>((sum, val) => {
        if (!val || typeof val !== "string") return sum;
        return sum + Buffer.byteLength(val, "utf8");
    }, 0);
}

export async function GET() {
    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: links, error } = await supabase
        .from("links")
        .select("url, title, description, favicon, image, tags")
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
    }

    const usedBytes = (links || []).reduce<number>(
        (sum, link) => sum + estimateLinkSize(link as Record<string, unknown>),
        0
    );

    return NextResponse.json({
        usedBytes,
        limitBytes: STORAGE_LIMIT_BYTES,
        count: (links || []).length
    });
}