"use client"

import { useTheme } from "next-themes"

export default function ThemeToggle() {

    const { theme, setTheme } = useTheme()

    return (
        <button
            onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
            }
            className="
        px-3 py-2
        rounded-lg
        bg-neutral-800
        text-white
        dark:bg-white
        dark:text-black
        transition
      "
        >
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
        </button>
    )
}
