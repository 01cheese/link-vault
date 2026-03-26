"use client"

import { X, Check, Sparkles, Loader2 } from "lucide-react"
import { Collection } from "@/lib/types"
import {useState} from "react";

type AddLinkModalProps = {
    isOpen: boolean
    onClose: () => void
    url: string
    title: string
    tags: string
    onUrlChange: (url: string) => void
    onTitleChange: (title: string) => void
    onTagsChange: (tags: string) => void
    onSubmit: () => void
    isAdding: boolean
    selectedCollection: string | null
    collections: Collection[]
}

export default function AddLinkModal({
                                         isOpen,
                                         onClose,
                                         url,
                                         title,
                                         tags,
                                         onUrlChange,
                                         onTitleChange,
                                         onTagsChange,
                                         onSubmit,
                                         isAdding,
                                         selectedCollection,
                                         collections
                                     }: AddLinkModalProps) {

    const [isGeneratingTags, setIsGeneratingTags] = useState(false)
    const [suggestedTags, setSuggestedTags] = useState<string[]>([])
    const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(true)

    if (!isOpen) return null

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && url.trim() && !isAdding) {
            onSubmit()
        }
    }

    const currentCollection = collections.find(c => c.id === selectedCollection)

    // Получаем текущие теги как массив
    const currentTags = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

    // Генерация тегов
    const generateTags = async () => {

        setIsGeneratingTags(true)

        try {
            const response = await fetch("/api/generate-tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, url })
            })

            const data = await response.json()

            if (data.tags && data.tags.length > 0) {
                setSuggestedTags(data.tags)
                // Автоматически добавляем сгенерированные теги
                const newTags = [...new Set([...currentTags, ...data.tags])]
                onTagsChange(newTags.join(', '))
            }
        } catch (error) {
            console.error("Error generating tags:", error)
        } finally {
            setIsGeneratingTags(false)
        }
    }

    // Автогенерация при вводе URL
    const handleUrlChange = async (newUrl: string) => {
        onUrlChange(newUrl)

        // Автоматически генерируем теги когда URL введен
        if (autoGenerateEnabled && newUrl.trim() && newUrl.startsWith('http')) {
            setTimeout(() => {
                generateTags()
            }, 1000)
        }
    }

    // Добавить тег
    const addTag = (tag: string) => {
        if (!currentTags.includes(tag)) {
            const newTags = [...currentTags, tag]
            onTagsChange(newTags.join(', '))
        }
    }

    // Удалить тег
    const removeTag = (tagToRemove: string) => {
        const newTags = currentTags.filter(t => t !== tagToRemove)
        onTagsChange(newTags.join(', '))
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Link</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <input
                    placeholder="URL (required)"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full border border-gray-300 dark:border-neutral-700 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    autoFocus
                />

                <input
                    placeholder="Title (optional - will auto-fetch)"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full border border-gray-300 dark:border-neutral-700 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                />

                {/* Секция тегов */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tags
                        </label>
                        <button
                            onClick={generateTags}
                            disabled={isGeneratingTags || (!url && !title)}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isGeneratingTags ? (
                                <>
                                    <Loader2 size={12} className="animate-spin"/>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={12}/>
                                    Auto-generate
                                </>
                            )}
                        </button>
                    </div>

                    {/* Отображение текущих тегов */}
                    {currentTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {currentTags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                    {tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-blue-900 dark:hover:text-blue-100">
                                        <X size={12}/>
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <input
                        placeholder="Add custom tags (comma-separated)"
                        value={tags}
                        onChange={(e) => onTagsChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full border border-gray-300 dark:border-neutral-700 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
                    />

                    <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <input
                            type="checkbox"
                            checked={autoGenerateEnabled}
                            onChange={(e) => setAutoGenerateEnabled(e.target.checked)}
                            className="rounded"
                        />
                        Auto-generate tags when URL is entered
                    </label>
                </div>

                {selectedCollection && currentCollection && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                        <span>Will be added to:</span>
                        <span className="font-semibold">
                            {currentCollection.icon} {currentCollection.name}
                        </span>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isAdding}
                        className="flex-1 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 py-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isAdding || !url.trim()}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isAdding ? (
                            <>
                                <Loader2 size={16} className="animate-spin"/>
                                Adding...
                            </>
                        ) : (
                            <>
                                <Check size={16}/> Add Link
                            </>
                        )}
                    </button>
                </div>

            </div>

        </div>
    )
}