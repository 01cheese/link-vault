import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json(
                { error: 'URL parameter is required' },
                { status: 400 }
            );
        }

        // Валидация URL
        let validUrl: URL;
        try {
            validUrl = new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL' },
                { status: 400 }
            );
        }

        // Проверка протокола (только http/https)
        if (!['http:', 'https:'].includes(validUrl.protocol)) {
            return NextResponse.json(
                { error: 'Invalid protocol' },
                { status: 400 }
            );
        }

        // Загружаем страницу
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; LinkSaasBot/1.0)',
            },
            // Таймаут 10 секунд
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch: ${response.status}` },
                { status: response.status }
            );
        }

        const html = await response.text();

        // Возвращаем HTML
        return new NextResponse(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=3600', // Кэш на 1 час
            },
        });
    } catch (error) {
        console.error('Fetch error:', error);

        return NextResponse.json(
            { error: 'Failed to fetch content' },
            { status: 500 }
        );
    }
}