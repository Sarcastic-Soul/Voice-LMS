"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

// Create a new companion
export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("companions")
        .insert({ ...formData, author })
        .select();

    if (error || !data) throw new Error(error?.message || "Failed to create a companion");

    return data[0];
};

// Fetch all companions with optional filters
export const getAllCompanions = async ({
    limit = 10,
    page = 1,
    subject,
    topic,
}: GetAllCompanions) => {
    await auth(); // Optional: for session validation
    const supabase = createSupabaseClient();

    let query = supabase.from("companions").select();

    if (subject && topic) {
        query = query
            .ilike("subject", `%${subject}%`)
            .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    } else if (subject) {
        query = query.ilike("subject", `%${subject}%`);
    } else if (topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const { data: companions, error } = await query;

    if (error) throw new Error(error.message);

    return companions;
};

// Get a single companion by ID
export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("companions")
        .select()
        .eq("id", id);

    if (error) throw new Error(error.message);

    return data[0];
};

// Add companion to session history
export const addToSessionHistory = async (companionId: string) => {
    const { userId } = await auth();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.from("session_history").insert({
        companion_id: companionId,
        user_id: userId,
    });

    if (error) throw new Error(error.message);

    return data;
};

// Get recent global sessions
export const getRecentSessions = async (limit = 10) => {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("session_history")
        .select(`companions:companion_id (*)`)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
};

// Get sessions of a specific user
export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("session_history")
        .select(`companions:companion_id (*)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
};

// Get companions created by the user
export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("companions")
        .select()
        .eq("author", userId);

    if (error) throw new Error(error.message);

    return data;
};

// Check if user is allowed to create a new companion
export const newCompanionPermissions = async () => {
    const { userId, has } = await auth();
    const supabase = createSupabaseClient();

    let limit = 0;

    if (has({ plan: "pro" })) {
        return true;
    } else if (has({ feature: "3_companion_limit" })) {
        limit = 3;
    } else if (has({ feature: "10_companion_limit" })) {
        limit = 10;
    }

    const { data, error } = await supabase
        .from("companions")
        .select("id", { count: "exact" })
        .eq("author", userId);

    if (error) throw new Error(error.message);

    return data.length < limit;
};

// Toggle bookmark status (set isBookmarked to true/false)
export const toggleBookmark = async (companionId: string, isBookmarked: boolean) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Not authenticated");

    const supabase = createSupabaseClient();

    const { error } = await supabase
        .from("companions")
        .update({ isBookmarked })
        .eq("id", companionId)
        .eq("author", userId); // Optional: Only let authors update their own companions' bookmark status

    if (error) throw new Error(error.message);
};

export const getBookmarkedCompanions = async (userId: string) => {
    if (!userId) return [];

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .select('*')
        .eq('author', userId)
        .eq('isBookmarked', true);

    if (error) {
        console.error('Error fetching bookmarked companions:', error.message);
        return [];
    }

    return data;
};