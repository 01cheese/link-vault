// my-app/app/api/parse-link/route.ts

import { NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json()

        if (!url) {
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400 }
            )
        }

        // Fetch the page
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })

        if (!response.ok) {
            return NextResponse.json(
                {
                    title: new URL(url).hostname,
                    description: null,
                    image: null,
                    favicon: null
                },
                { status: 200 }
            )
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // Extract metadata
        const metadata = {
            title:
                $('meta[property="og:title"]').attr('content') ||
                $('meta[name="twitter:title"]').attr('content') ||
                $('title').text() ||
                new URL(url).hostname,

            description:
                $('meta[property="og:description"]').attr('content') ||
                $('meta[name="twitter:description"]').attr('content') ||
                $('meta[name="description"]').attr('content') ||
                null,

            image:
                $('meta[property="og:image"]').attr('content') ||
                $('meta[name="twitter:image"]').attr('content') ||
                null,

            favicon:
                $('link[rel="icon"]').attr('href') ||
                $('link[rel="shortcut icon"]').attr('href') ||
                `${new URL(url).origin}/favicon.ico`
        }

        // Make sure image and favicon are absolute URLs
        if (metadata.image && !metadata.image.startsWith('http')) {
            metadata.image = new URL(metadata.image, url).href
        }

        if (metadata.favicon && !metadata.favicon.startsWith('http')) {
            metadata.favicon = new URL(metadata.favicon, url).href
        }

        return NextResponse.json(metadata)

    } catch (error) {
        console.error("Error parsing link:", error)
        return NextResponse.json(
            {
                title: "Error parsing link",
                description: null,
                image: null,
                favicon: null
            },
            { status: 200 }
        )
    }
}