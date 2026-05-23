# Momentum Development Notes

## Authentication Decisions
- **Custom Branded Auth Pages**: Deferred to a later milestone. We are currently utilizing Clerk's default hosted account sign-in/sign-up components and redirect configurations to keep authentication setups lean during Phase 0/1.
- **Profile Synchronization**: Running standard fallback server actions (`ensureProfile()`) in the root layout to sync Clerk profiles directly into Supabase during local development, circumventing the need for public ngrok webhook tunnels.

## Fitness Tracking & Bodyweight Log Considerations
- **Bodyweight vs. Weighted Workouts**: Certain exercises (like pushups) do not require weight inputs for progression tracking since the user's body weight is the primary load. For these bodyweight exercises, tracking reps and sets is sufficient.
- **Initial Body Weight Input**: Integrate a general bodyweight input system (such as in the Wellness Log/Profile) that can be referenced for bodyweight exercises, rather than prompting the user for weight on every bodyweight set.

