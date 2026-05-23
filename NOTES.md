# Momentum Development Notes

## Authentication Decisions
- **Custom Branded Auth Pages**: Deferred to a later milestone. We are currently utilizing Clerk's default hosted account sign-in/sign-up components and redirect configurations to keep authentication setups lean during Phase 0/1.
- **Profile Synchronization**: Running standard fallback server actions (`ensureProfile()`) in the root layout to sync Clerk profiles directly into Supabase during local development, circumventing the need for public ngrok webhook tunnels.
