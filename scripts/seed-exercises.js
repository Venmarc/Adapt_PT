global.WebSocket = class {};
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env from the project root
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found at', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const exercisesToSeed = [
  // Push
  { name: 'Barbell Bench Press', category: 'Push', muscle_group: ['Chest', 'Shoulders', 'Triceps'], is_custom: false, user_id: null },
  { name: 'Incline Dumbbell Bench Press', category: 'Push', muscle_group: ['Chest', 'Shoulders', 'Triceps'], is_custom: false, user_id: null },
  { name: 'Overhead Press', category: 'Push', muscle_group: ['Shoulders', 'Triceps'], is_custom: false, user_id: null },
  { name: 'Lateral Raise', category: 'Push', muscle_group: ['Shoulders'], is_custom: false, user_id: null },
  { name: 'Cable Tricep Pushdown', category: 'Push', muscle_group: ['Triceps'], is_custom: false, user_id: null },
  { name: 'Dips', category: 'Push', muscle_group: ['Chest', 'Triceps', 'Shoulders'], is_custom: false, user_id: null },
  { name: 'Pushups', category: 'Push', muscle_group: ['Chest', 'Triceps', 'Shoulders'], is_custom: false, user_id: null },
  { name: 'Pike Pushups', category: 'Push', muscle_group: ['Shoulders', 'Triceps'], is_custom: false, user_id: null },
  { name: 'Diamond Pushups', category: 'Push', muscle_group: ['Triceps', 'Chest'], is_custom: false, user_id: null },
  { name: 'Decline Pushups', category: 'Push', muscle_group: ['Chest', 'Triceps', 'Shoulders'], is_custom: false, user_id: null },

  // Pull
  { name: 'Pull-up', category: 'Pull', muscle_group: ['Lats', 'Upper Back', 'Biceps'], is_custom: false, user_id: null },
  { name: 'Barbell Row', category: 'Pull', muscle_group: ['Lats', 'Upper Back', 'Biceps', 'Lower Back'], is_custom: false, user_id: null },
  { name: 'Lat Pulldown', category: 'Pull', muscle_group: ['Lats', 'Biceps'], is_custom: false, user_id: null },
  { name: 'Dumbbell Bicep Curl', category: 'Pull', muscle_group: ['Biceps'], is_custom: false, user_id: null },
  { name: 'Face Pull', category: 'Pull', muscle_group: ['Rear Delts', 'Upper Back'], is_custom: false, user_id: null },
  { name: 'Hammer Curl', category: 'Pull', muscle_group: ['Biceps', 'Forearms'], is_custom: false, user_id: null },
  { name: 'Chin-up', category: 'Pull', muscle_group: ['Lats', 'Biceps'], is_custom: false, user_id: null },
  { name: 'Inverted Row', category: 'Pull', muscle_group: ['Lats', 'Upper Back', 'Biceps'], is_custom: false, user_id: null },

  // Legs
  { name: 'Barbell Squat', category: 'Legs', muscle_group: ['Quads', 'Glutes', 'Hamstrings', 'Calves'], is_custom: false, user_id: null },
  { name: 'Romanian Deadlift', category: 'Legs', muscle_group: ['Hamstrings', 'Glutes', 'Lower Back'], is_custom: false, user_id: null },
  { name: 'Leg Press', category: 'Legs', muscle_group: ['Quads', 'Glutes'], is_custom: false, user_id: null },
  { name: 'Leg Curl', category: 'Legs', muscle_group: ['Hamstrings'], is_custom: false, user_id: null },
  { name: 'Leg Extension', category: 'Legs', muscle_group: ['Quads'], is_custom: false, user_id: null },
  { name: 'Standing Calf Raise', category: 'Legs', muscle_group: ['Calves'], is_custom: false, user_id: null },
  { name: 'Bodyweight Squat', category: 'Legs', muscle_group: ['Quads', 'Glutes'], is_custom: false, user_id: null },
  { name: 'Walking Lunges', category: 'Legs', muscle_group: ['Quads', 'Glutes'], is_custom: false, user_id: null },
  { name: 'Bulgarian Split Squat', category: 'Legs', muscle_group: ['Quads', 'Glutes'], is_custom: false, user_id: null },
  { name: 'Glute Bridge', category: 'Legs', muscle_group: ['Glutes', 'Hamstrings'], is_custom: false, user_id: null },
  { name: 'Donkey Kicks', category: 'Legs', muscle_group: ['Glutes'], is_custom: false, user_id: null },

  // Core
  { name: 'Plank', category: 'Core', muscle_group: ['Abs', 'Lower Back'], is_custom: false, user_id: null },
  { name: 'Hanging Leg Raise', category: 'Core', muscle_group: ['Abs'], is_custom: false, user_id: null },
  { name: 'Ab Wheel Rollout', category: 'Core', muscle_group: ['Abs'], is_custom: false, user_id: null },
  { name: 'Bicycle Crunches', category: 'Core', muscle_group: ['Abs'], is_custom: false, user_id: null },
  { name: 'Russian Twists', category: 'Core', muscle_group: ['Abs', 'Obliques'], is_custom: false, user_id: null },
  { name: 'Lying Leg Raise', category: 'Core', muscle_group: ['Abs'], is_custom: false, user_id: null },

  // Cardio
  { name: 'Treadmill Run', category: 'Cardio', muscle_group: ['Cardiovascular System'], is_custom: false, user_id: null },
  { name: 'Stationary Cycling', category: 'Cardio', muscle_group: ['Cardiovascular System', 'Quads'], is_custom: false, user_id: null },
  { name: 'Rowing Machine', category: 'Cardio', muscle_group: ['Cardiovascular System', 'Full Body'], is_custom: false, user_id: null },
  { name: 'Elliptical Trainer', category: 'Cardio', muscle_group: ['Cardiovascular System'], is_custom: false, user_id: null },
  { name: 'Burpee', category: 'Cardio', muscle_group: ['Cardiovascular System', 'Full Body'], is_custom: false, user_id: null },
  { name: 'Jumping Jacks', category: 'Cardio', muscle_group: ['Cardiovascular System'], is_custom: false, user_id: null },
  { name: 'Mountain Climbers', category: 'Cardio', muscle_group: ['Cardiovascular System', 'Abs'], is_custom: false, user_id: null }
];

async function seed() {
  console.log('🌱 Starting exercise library database seed...');
  
  // 1. Fetch existing global exercises to prevent duplication
  const { data: existing, error: fetchError } = await supabase
    .from('exercises')
    .select('name')
    .is('user_id', null)
    .eq('is_custom', false);

  if (fetchError) {
    console.error('❌ Error fetching existing exercises:', fetchError);
    process.exit(1);
  }

  const existingNames = new Set(existing.map(e => e.name));
  console.log(`🔍 Found ${existingNames.size} existing global exercises in DB.`);

  // 2. Filter out exercises that already exist
  const newExercises = exercisesToSeed.filter(e => !existingNames.has(e.name));

  if (newExercises.length === 0) {
    console.log('✅ No new exercises to seed. Database is already up-to-date.');
    process.exit(0);
  }

  console.log(`📤 Seeding ${newExercises.length} new exercises...`);

  // 3. Insert new exercises
  const { data: inserted, error: insertError } = await supabase
    .from('exercises')
    .insert(newExercises)
    .select('name');

  if (insertError) {
    console.error('❌ Error inserting exercises:', insertError);
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${inserted.length} exercises!`);
  inserted.forEach(e => console.log(`   - ${e.name}`));
  process.exit(0);
}

seed();
