import { NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function POST(request: NextRequest) {
    try {
        const { title, description, url } = await request.json()

        const tags = generateSmartTags(title, description, url)

        return NextResponse.json({ tags })

    } catch (error) {
        console.error("Error generating tags:", error)
        return NextResponse.json({ tags: [] }, { status: 200 })
    }
}

function generateSmartTags(
    title?: string,
    description?: string,
    url?: string
): string[] {

    const tags = new Set<string>()

    // ---------------- NORMALIZE TEXT ----------------

    const rawText = `${title || ""} ${description || ""}`
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")

    const words = rawText.split(/\s+/)

    // ---------------- STOP WORDS ----------------

    const stopWords = new Set([
        "the","and","for","with","from","this","that",
        "you","your","are","was","were","how","what"
    ])

    const filteredWords = words.filter(
        w => w.length > 2 && !stopWords.has(w)
    )

    // ---------------- WORD FREQUENCY ----------------

    const freq: Record<string, number> = {}

    filteredWords.forEach(word => {
        freq[word] = (freq[word] || 0) + 1
    })

    // ---------------- CATEGORY KEYWORDS ----------------

    const categories: Record<string, string[]> = {
        react: ["react","nextjs","jsx","hooks"],
        javascript: ["javascript","node","npm","js"],
        typescript: ["typescript","ts"],
        python: ["python","django","flask"],
        ai: ["ai","gpt","openai","machine","learning"],
        design: ["design","ui","ux","figma"],
        devops: ["docker","kubernetes","ci","cd"],
        database: ["sql","postgres","mongodb","database"],
        video: ["video","youtube","stream"],
        tutorial: ["tutorial","guide","learn"],
        article: ["article","blog","post"],
        productivity: ["tool","workflow","productivity"]
    }

    // ---------------- CATEGORY MATCH ----------------

    for (const [tag, keywords] of Object.entries(categories)) {

        if (keywords.some(k => rawText.includes(k))) {
            tags.add(tag)
        }

        if (tags.size >= 4) return Array.from(tags)
    }

    // ---------------- MOST FREQUENT WORDS ----------------

    const sortedWords = Object.entries(freq)
        .sort((a,b)=>b[1]-a[1])
        .map(([word])=>word)

    sortedWords.forEach(word => {

        if (tags.size >= 4) return

        if (word.length > 4) {
            tags.add(word)
        }
    })

    // ---------------- DOMAIN TAG ----------------

    if (url && tags.size < 4) {
        try {

            const domain = new URL(url)
                .hostname
                .replace("www.","")
                .split(".")[0]

            tags.add(domain)

        } catch {}
    }

    return Array.from(tags).slice(0,4)
}



