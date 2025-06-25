'use server';

import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const syncUserToSupabase = async () => {
    const user = await currentUser();

    if (!user) return;

    const email = user.emailAddresses?.[0]?.emailAddress;
    const id = user.id;

    // Upsert to avoid duplicates
    const { error } = await supabase.from('users').upsert({
        id,
        email,
    });

    if (error) {
        console.error('Error syncing user to Supabase:', error.message);
    }
};
