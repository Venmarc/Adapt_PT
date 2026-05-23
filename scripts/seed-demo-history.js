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

async function seed() {
  console.log('🌱 Starting realistic demo history seeding...');

  // 1. Fetch the first profile
  let { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id, full_name')
    .limit(1);

  let user;
  if (profileErr || !profiles || profiles.length === 0) {
    console.log('⚠️ No profiles found in the database. Creating default demo profile (user_demo_momentum)...');
    const { data: newProfile, error: createProfileErr } = await supabase
      .from('profiles')
      .insert({
        id: 'user_demo_momentum',
        full_name: 'Victor (Demo)',
        username: 'victor_demo'
      })
      .select()
      .single();

    if (createProfileErr) {
      console.error('❌ Error creating default demo profile:', createProfileErr);
      process.exit(1);
    }
    user = newProfile;
  } else {
    user = profiles[0];
  }

  console.log(`👤 Using target profile: ${user.full_name} (${user.id})`);

  // 2. Clear existing records for this user to ensure idempotency
  console.log('🧹 Clearing existing user logs, workouts, and habits to prevent duplication...');
  
  // Delete workout exercises first
  const { data: userWorkouts } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', user.id);
  
  if (userWorkouts && userWorkouts.length > 0) {
    const workoutIds = userWorkouts.map(w => w.id);
    await supabase.from('workout_exercises').delete().in('workout_id', workoutIds);
  }
  
  await supabase.from('workouts').delete().eq('user_id', user.id);
  await supabase.from('habit_logs').delete().eq('user_id', user.id);
  await supabase.from('habits').delete().eq('user_id', user.id);

  // 3. Seed Habits
  console.log('📤 Inserting template habits...');
  const habitsToInsert = [
    {
      user_id: user.id,
      name: 'Drink Water',
      description: 'Hydrate continuously throughout the day',
      category: 'Health',
      recurrence: { type: 'daily' },
      target_count: 8,
      unit: 'glasses',
      is_active: true
    },
    {
      user_id: user.id,
      name: 'Read 15 Pages',
      description: 'Read self-improvement or technical books',
      category: 'Growth',
      recurrence: { type: 'daily' },
      target_count: 15,
      unit: 'pages',
      is_active: true
    },
    {
      user_id: user.id,
      name: 'Morning Meditation',
      description: 'Box breathing and mindfulness to start the day',
      category: 'Mindfulness',
      recurrence: { type: 'daily' },
      target_count: 10,
      unit: 'minutes',
      is_active: true
    },
    {
      user_id: user.id,
      name: 'Strength Workout',
      description: 'Weightlifting session focused on progression',
      category: 'Fitness',
      recurrence: { type: 'weekly', days: [1, 3, 5] }, // Mon, Wed, Fri
      target_count: 1,
      unit: 'session',
      is_active: true
    }
  ];

  const { data: habits, error: habitsErr } = await supabase
    .from('habits')
    .insert(habitsToInsert)
    .select();

  if (habitsErr || !habits) {
    console.error('❌ Error inserting habits:', habitsErr);
    process.exit(1);
  }
  console.log(`✅ Successfully created ${habits.length} habits.`);

  // Map habits for easier reference
  const habitMap = {};
  habits.forEach(h => {
    habitMap[h.name] = h;
  });

  // 4. Generate Habit Logs for the last 30 days
  console.log('📅 Generating 30 days of habit completion logs...');
  const logsToInsert = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const logDate = new Date(today);
    logDate.setDate(today.getDate() - i);
    const dateStr = logDate.toISOString().split('T')[0];
    const dayOfWeek = logDate.getDay(); // 0 = Sun, 1 = Mon, etc.

    // Habit: Drink Water (daily, quantifiable)
    const waterCompleted = Math.random() > 0.15; // 85% adherence
    logsToInsert.push({
      habit_id: habitMap['Drink Water'].id,
      user_id: user.id,
      logged_date: dateStr,
      completed: waterCompleted,
      count: waterCompleted ? Math.floor(Math.random() * 4) + 8 : Math.floor(Math.random() * 5) + 3,
      difficulty: waterCompleted ? 1 : 3,
      notes: waterCompleted ? 'Hydrated well today.' : 'Forgot my water bottle at work.',
      context_tags: ['routine', 'wellness']
    });

    // Habit: Read 15 Pages (daily, quantifiable)
    const readCompleted = Math.random() > 0.3; // 70% adherence
    logsToInsert.push({
      habit_id: habitMap['Read 15 Pages'].id,
      user_id: user.id,
      logged_date: dateStr,
      completed: readCompleted,
      count: readCompleted ? Math.floor(Math.random() * 10) + 15 : Math.floor(Math.random() * 8),
      difficulty: readCompleted ? 2 : 4,
      notes: readCompleted ? 'Fascinating chapters on habits.' : 'Too tired to read tonight.',
      context_tags: ['learning', 'growth']
    });

    // Habit: Morning Meditation (daily, yes/no)
    const medCompleted = Math.random() > 0.25; // 75% adherence
    logsToInsert.push({
      habit_id: habitMap['Morning Meditation'].id,
      user_id: user.id,
      logged_date: dateStr,
      completed: medCompleted,
      count: medCompleted ? 10 : 0,
      difficulty: medCompleted ? 1 : 2,
      notes: medCompleted ? 'Felt very calm.' : 'Woke up late.',
      context_tags: ['mindfulness']
    });

    // Habit: Strength Workout (weekly: Mon, Wed, Fri)
    if ([1, 3, 5].includes(dayOfWeek)) {
      const workCompleted = Math.random() > 0.1; // 90% adherence
      logsToInsert.push({
        habit_id: habitMap['Strength Workout'].id,
        user_id: user.id,
        logged_date: dateStr,
        completed: workCompleted,
        count: workCompleted ? 1 : 0,
        difficulty: workCompleted ? Math.floor(Math.random() * 3) + 3 : null,
        notes: workCompleted ? 'Killed it in the gym.' : 'Recovering from slight fatigue.',
        context_tags: ['fitness', 'workout']
      });
    }
  }

  const { error: logsErr } = await supabase.from('habit_logs').insert(logsToInsert);
  if (logsErr) {
    console.error('❌ Error inserting habit logs:', logsErr);
    process.exit(1);
  }
  console.log(`✅ Successfully seeded ${logsToInsert.length} habit logs.`);

  // 5. Seed Workouts and Sets
  console.log('🏋️ Fetching exercises from library...');
  const { data: exercises, error: exercisesErr } = await supabase
    .from('exercises')
    .select('id, name, category');

  if (exercisesErr || !exercises || exercises.length === 0) {
    console.error('❌ Error: No exercises found. Please run scripts/seed-exercises.js first!');
    process.exit(1);
  }

  const exerciseMap = {};
  exercises.forEach(e => {
    exerciseMap[e.name] = e.id;
  });

  const pushExercises = [
    { name: 'Barbell Bench Press', sets: 4, baseReps: 8, baseWeight: 60, weightIncrement: 2.5 },
    { name: 'Overhead Press', sets: 3, baseReps: 8, baseWeight: 40, weightIncrement: 1.25 },
    { name: 'Cable Tricep Pushdown', sets: 3, baseReps: 12, baseWeight: 20, weightIncrement: 2.5 }
  ];

  const pullExercises = [
    { name: 'Pull-up', sets: 4, baseReps: 8, baseWeight: 0, weightIncrement: 0 },
    { name: 'Barbell Row', sets: 4, baseReps: 10, baseWeight: 50, weightIncrement: 2.5 },
    { name: 'Dumbbell Bicep Curl', sets: 3, baseReps: 12, baseWeight: 12, weightIncrement: 2 }
  ];

  const legExercises = [
    { name: 'Barbell Squat', sets: 4, baseReps: 6, baseWeight: 80, weightIncrement: 5 },
    { name: 'Romanian Deadlift', sets: 4, baseReps: 8, baseWeight: 70, weightIncrement: 2.5 },
    { name: 'Standing Calf Raise', sets: 3, baseReps: 15, baseWeight: 50, weightIncrement: 5 }
  ];

  const workoutsList = [
    { name: 'Push Focus', routine: pushExercises, weekday: 1 }, // Monday
    { name: 'Pull Focus', routine: pullExercises, weekday: 3 }, // Wednesday
    { name: 'Legs Focus', routine: legExercises, weekday: 5 }  // Friday
  ];

  console.log('📅 Seeding 30 days of workouts and sets...');
  
  for (let i = 29; i >= 0; i--) {
    const workoutDate = new Date(today);
    workoutDate.setDate(today.getDate() - i);
    const dateStr = workoutDate.toISOString().split('T')[0];
    const dayOfWeek = workoutDate.getDay();

    const selectedWorkout = workoutsList.find(w => w.weekday === dayOfWeek);
    if (!selectedWorkout) continue;

    // 10% chance of skipping workout
    if (Math.random() < 0.1) continue;

    // Create Workout Session
    const duration = 50 + Math.floor(Math.random() * 20); // minutes
    const { data: workout, error: workErr } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: selectedWorkout.name,
        date: dateStr,
        notes: `Felt strong today. Focused on progressive overload.`,
        total_duration_minutes: duration,
        total_volume_kg: 0
      })
      .select()
      .single();

    if (workErr || !workout) {
      console.error('❌ Error creating workout session:', workErr);
      process.exit(1);
    }

    const workoutExercisesToInsert = [];
    let totalVolume = 0;
    const weeksAgo = Math.floor(i / 7);

    selectedWorkout.routine.forEach((exerciseSpec, index) => {
      const exerciseId = exerciseMap[exerciseSpec.name];
      if (!exerciseId) return;

      const sets = [];
      for (let s = 1; s <= exerciseSpec.sets; s++) {
        const calcWeight = Math.max(0, exerciseSpec.baseWeight - (exerciseSpec.weightIncrement * weeksAgo));
        const reps = exerciseSpec.baseReps + (Math.random() > 0.7 ? 1 : 0);
        sets.push({
          reps: reps,
          weight_kg: calcWeight,
          rpe: Math.floor(Math.random() * 3) + 7, // RPE 7-9
          notes: ''
        });
        totalVolume += calcWeight * reps;
      }

      workoutExercisesToInsert.push({
        workout_id: workout.id,
        exercise_id: exerciseId,
        order_index: index,
        sets: sets
      });
    });

    if (workoutExercisesToInsert.length > 0) {
      const { error: weErr } = await supabase
        .from('workout_exercises')
        .insert(workoutExercisesToInsert);
      
      if (weErr) {
        console.error('❌ Error inserting workout exercises:', weErr);
        process.exit(1);
      }

      // Update total volume
      await supabase
        .from('workouts')
        .update({ total_volume_kg: totalVolume })
        .eq('id', workout.id);
    }
  }

  console.log('✅ Success! Realistic demo database seeding complete!');
  process.exit(0);
}

seed();
