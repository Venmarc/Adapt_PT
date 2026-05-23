'use server';

import { currentUser } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/app/lib/supabase-server';

type ClerkWebhookUser = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  username?: string | null;
  email_addresses?: Array<{ email_address: string }>;
};

/**
 * Webhook handler to sync Clerk profile creations/updates to Supabase profiles table.
 */
export async function syncUserProfile(clerkData: ClerkWebhookUser) {
  const serviceClient = createSupabaseServiceClient();

  const fullName = `${clerkData.first_name || ''} ${clerkData.last_name || ''}`.trim() || null;
  const avatarUrl = clerkData.image_url || null;
  const username = clerkData.username || null;

  console.log(`💾 Syncing Clerk profile for ${clerkData.id}`);

  const { error } = await serviceClient
    .from('profiles')
    .upsert({
      clerk_id: clerkData.id,
      full_name: fullName,
      username,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'clerk_id' });

  if (error) {
    console.error('Supabase profile sync error:', error);
    throw new Error(`Failed to sync profile: ${error.message}`);
  }

  console.log(`✅ Profile successfully synced for ${clerkData.id}`);
  return { success: true };
}

/**
 * Fallback server action to guarantee a profile exists in Supabase.
 * Call this at layouts/pages to catch cases where the local Clerk webhook sync
 * did not run (e.g. during local development without ngrok).
 */
export async function ensureProfile() {
  const user = await currentUser();
  if (!user) return null;

  const serviceClient = createSupabaseServiceClient();

  // Try to fetch profile first to avoid redundant updates
  const { data: profile, error: fetchError } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('clerk_id', user.id)
    .single();

  if (fetchError || !profile) {
    // Generate fallback display names/usernames in case of blanks
    const email = user.emailAddresses?.[0]?.emailAddress || '';
    const emailFallback = email ? email.split('@')[0] : 'User';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || emailFallback;
    const username = user.username || emailFallback;
    const avatarUrl = user.imageUrl || null;

    console.log(`👤 Profile missing in Supabase for user ${user.id}. Syncing fallback...`);

    const { error: insertError } = await serviceClient
      .from('profiles')
      .upsert({
        clerk_id: user.id,
        full_name: fullName,
        username,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'clerk_id' });

    if (insertError) {
      console.error('ensureProfile Supabase upsert error:', insertError);
    } else {
      console.log(`✅ ensureProfile registered profile in Supabase for user ${user.id}`);
    }
  }

  return { id: user.id };
}
