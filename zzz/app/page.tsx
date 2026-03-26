"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Home() {

    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser()

            if (data.user) {
                router.replace("/dashboard")
            } else {
                router.replace("/login")
            }
        }

        checkUser()
    }, [router])

    return <p className="p-10">Loading...</p>
}
