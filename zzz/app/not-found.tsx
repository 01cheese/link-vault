"use client"

import Link from "next/link"

export default function NotFound() {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>

                <p className="text-xl mb-6">
                    Page not found
                </p>

                <Link
                    href="/"
                    className="px-6 py-3 bg-black text-white rounded-lg"
                >
                    Go Home
                </Link>
            </div>
        </div>
    )
}
