"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Collection } from "@/lib/types"

export const useCollections = (userId: string | undefined) => {
    const [collections, setCollections] = useState<Collection[]>([])

    const loadCollections = async () => {
        if (!userId) return

        const { data } = await supabase
            .from("collections")
            .select("*")
            .eq("user_id", userId)
            .order("name")

        if (data) setCollections(data)
    }

    const addCollection = async (name: string, icon: string) => {
        if (!userId) return null

        const { data, error } = await supabase
            .from("collections")
            .insert([{ user_id: userId, name: name.trim(), icon }])
            .select()

        if (error) {
            console.error("Error creating collection:", error)
            return null
        }

        if (data && data.length > 0) {
            setCollections(prev => [...prev, data[0]])
            return data[0]
        }

        return null
    }

    const updateCollection = async (id: string, name: string, icon: string) => {
        const { data, error } = await supabase
            .from("collections")
            .update({ name: name.trim(), icon })
            .eq("id", id)
            .select()

        if (data && !error) {
            setCollections(prev => prev.map(c => c.id === id ? data[0] : c))
            return data[0]
        }

        return null
    }

    const deleteCollection = async (id: string) => {
        const { error } = await supabase
            .from("collections")
            .delete()
            .eq("id", id)

        if (!error) {
            setCollections(prev => prev.filter(c => c.id !== id))
            return true
        }

        return false
    }

    return {
        collections,
        loadCollections,
        addCollection,
        updateCollection,
        deleteCollection
    }
}