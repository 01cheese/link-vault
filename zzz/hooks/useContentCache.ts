import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface CachedContent {
    linkId: string;
    content: string;
    cachedAt: Date;
}

// Простое хранилище в localStorage для кэша
const CACHE_KEY = 'links_content_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 дней

export function useContentCache() {
    const [cache, setCache] = useState<Map<string, CachedContent>>(new Map());
    const [isLoading, setIsLoading] = useState(false);

    // Загрузить кэш из localStorage при монтировании
    useEffect(() => {
        loadCacheFromStorage();
    }, []);

    const loadCacheFromStorage = () => {
        try {
            const stored = localStorage.getItem(CACHE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                const now = Date.now();

                // Фильтруем устаревший кэш
                const validCache = new Map(
                    Object.entries(parsed)
                        .filter(([_, value]: [string, any]) => {
                            const cachedAt = new Date(value.cachedAt).getTime();
                            return now - cachedAt < CACHE_DURATION;
                        })
                        .map(([key, value]: [string, any]) => [
                            key,
                            {
                                ...value,
                                cachedAt: new Date(value.cachedAt),
                            },
                        ])
                );

                setCache(validCache);
            }
        } catch (error) {
            console.error('Failed to load cache:', error);
        }
    };

    const saveCacheToStorage = (newCache: Map<string, CachedContent>) => {
        try {
            const obj = Object.fromEntries(newCache);
            localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
        } catch (error) {
            console.error('Failed to save cache:', error);
        }
    };

    // Получить контент для ссылки
    const getContent = (linkId: string): string | null => {
        const cached = cache.get(linkId);
        if (!cached) return null;

        // Проверяем актуальность
        const age = Date.now() - cached.cachedAt.getTime();
        if (age > CACHE_DURATION) {
            return null;
        }

        return cached.content;
    };

    // Загрузить контент для конкретной ссылки
    const fetchContent = async (linkId: string, url: string): Promise<string | null> => {
        // Проверяем кэш
        const cached = getContent(linkId);
        if (cached) return cached;

        try {
            // Простой fetch через прокси или напрямую
            // В production лучше использовать свой API endpoint
            const response = await fetch(`/api/fetch-content?url=${encodeURIComponent(url)}`);

            if (!response.ok) {
                throw new Error('Failed to fetch content');
            }

            const text = await response.text();
            const content = extractTextFromHTML(text);

            // Сохраняем в кэш
            const newCache = new Map(cache);
            newCache.set(linkId, {
                linkId,
                content,
                cachedAt: new Date(),
            });

            setCache(newCache);
            saveCacheToStorage(newCache);

            return content;
        } catch (error) {
            console.error('Failed to fetch content for', url, error);
            return null;
        }
    };

    // Загрузить контент для нескольких ссылок
    const fetchMultipleContents = async (
        links: Array<{ id: string; url: string }>
    ): Promise<void> => {
        setIsLoading(true);

        try {
            // Фильтруем только те, которых нет в кэше
            const toFetch = links.filter((link) => !getContent(link.id));

            // Загружаем по 3 одновременно, чтобы не перегрузить
            const batchSize = 3;
            const newCache = new Map(cache);

            for (let i = 0; i < toFetch.length; i += batchSize) {
                const batch = toFetch.slice(i, i + batchSize);

                await Promise.all(
                    batch.map(async (link) => {
                        const content = await fetchContent(link.id, link.url);
                        if (content) {
                            newCache.set(link.id, {
                                linkId: link.id,
                                content,
                                cachedAt: new Date(),
                            });
                        }
                    })
                );

                setCache(new Map(newCache));
                saveCacheToStorage(newCache);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Очистить кэш
    const clearCache = () => {
        setCache(new Map());
        localStorage.removeItem(CACHE_KEY);
    };

    return {
        cache,
        isLoading,
        getContent,
        fetchContent,
        fetchMultipleContents,
        clearCache,
    };
}

// Простое извлечение текста из HTML
function extractTextFromHTML(html: string): string {
    // Удаляем скрипты и стили
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Удаляем HTML теги
    text = text.replace(/<[^>]+>/g, ' ');

    // Декодируем entities
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    // Удаляем лишние пробелы
    text = text.replace(/\s+/g, ' ').trim();

    // Ограничиваем размер для производительности
    return text.substring(0, 10000); // Максимум 10k символов
}