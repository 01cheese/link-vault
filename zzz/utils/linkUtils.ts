export const parseMetadata = async (url: string) => {
    try {
        const res = await fetch("/api/parse-link", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url })
        })

        if (!res.ok) {
            console.error("Failed to parse metadata")
            return null
        }

        return await res.json()
    } catch (error) {
        console.error("Error parsing metadata:", error)
        return null
    }
}

export const normalizeUrl = (url: string): string => {
    const trimmed = url.trim()
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return `https://${trimmed}`
    }
    return trimmed
}

export const validateUrl = (url: string): boolean => {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

export const exportToJSON = (data: any[], filename: string) => {
    const jsonData = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}