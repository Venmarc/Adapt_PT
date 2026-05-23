import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ensureProfile } from '@/app/actions/auth-actions';
import { getWellnessEntries } from '@/app/actions/wellness-actions';
import WellnessClient from '@/app/components/wellness/wellness-client';

export const metadata = {
  title: 'Wellness | Momentum',
  description: 'Log and track your sleep duration, quality, mood, and daily energy levels.',
};

export default async function WellnessPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  // Ensure user has profile synced in database (especially for local dev)
  await ensureProfile();

  // Fetch recent wellness logs for the last 30 days
  const res = await getWellnessEntries(30);
  
  if (res.error) {
    console.error('Error fetching wellness entries on page load:', res.error);
  }

  const initialEntries = res.data || [];

  return (
    <WellnessClient 
      initialEntries={initialEntries}
    />
  );
}
