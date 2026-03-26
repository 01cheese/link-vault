"use client"

import { X, Check } from "lucide-react"
import { iconOptions } from "@/lib/types"

type AddCollectionModalProps = {
    isOpen: boolean
    onClose: () => void
    name: string
    icon: string
    onNameChange: (name: string) => void
    onIconChange: (icon: string) => void
    onSubmit: () => void
}

export default function AddCollectionModal({
                                               isOpen,
                                               onClose,
                                               name,
                                               icon,
                                               onNameChange,
                                               onIconChange,
                                               onSubmit
                                           }: AddCollectionModalProps) {

    if (!isOpen) return null

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && name.trim()) {
            onSubmit()
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">

                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Collection</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Choose Icon
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                        {iconOptions.map(iconOption => (
                            <button
                                key={iconOption}
                                onClick={() => onIconChange(iconOption)}
                                className={`text-2xl p-2 rounded border-2 transition-all ${
                                    icon === iconOption
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-110"
                                        : "border-gray-200 dark:border-neutral-700 hover:border-blue-300"
                                }`}>
                                {iconOption}
                            </button>
                        ))}
                    </div>
                </div>

                <input
                    placeholder="Collection name (e.g., Work, Personal, Reading List)"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full border border-gray-300 dark:border-neutral-700 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    autoFocus
                />

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 py-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={!name.trim()}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Check size={16}/> Create
                    </button>
                </div>

            </div>

        </div>
    )
}