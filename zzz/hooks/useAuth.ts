"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

export const useAuth = () => {

    const router = useRouter()

    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        // ===== Восстановление session =====
        supabase.auth.getSession().then(({ data }) => {

            if (!data.session) {
                router.replace("/login")
                setLoading(false)
                return
            }

            setUser(data.session.user)
            setLoading(false)
        })

        // ===== Подписка на изменения auth =====
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {

                if (!session) {
                    router.replace("/login")
                }

                setUser(session?.user ?? null)
            }
        )

        return () => {
            listener.subscription.unsubscribe()
        }

    }, [router])

    const logout = async () => {
        await supabase.auth.signOut()
        router.replace("/login")
    }

    return { user, loading, logout }
}