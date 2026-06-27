/* =============================================================
   YOUR WORKOUT ROUTINE  —  "The Foundation" 8-Week Hypertrophy
   -------------------------------------------------------------
   This is the ONLY file you need to edit to change your routine.
   Each day has: name, focus, and a list of exercises.
   Each exercise has: name, sets, reps, and optional fields:
     reps    -> "8-10", "6-8/side", "AMRAP", "20-30 sec", etc.
     rest    -> e.g. "90 sec"  (also drives the rest timer)
     rir     -> reps-in-reserve target, e.g. "3→2"
     note    -> short cue shown on the routine list
     muscles -> target muscles (string)
     cues    -> array of short "how to do it" form points
     video   -> optional custom YouTube search text (defaults to the name)
     videoId -> a specific YouTube video ID to embed in the detail view
                (auto-sourced; swap any you don't like). Omit to just show
                the "search YouTube" button instead.
   ============================================================= */

const ROUTINE = {
  title: "The Foundation",
  subtitle: "8-Week Hypertrophy · Kettlebells + Bands · 4 days/week",
  days: [
    {
      name: "Upper A",
      focus: "Push — chest, shoulders, triceps + core (Mon)",
      exercises: [
        { name: "Half-Kneeling Single-Arm KB Overhead Press", gym: { name: "Dumbbell Shoulder Press", videoId: "qEwKCR5JCog", muscles: "Shoulders, triceps, core", cues: ["Sit tall or stand braced, dumbbells at shoulders", "Press overhead without flaring the ribs", "Lower under control to ear level"] }, sets: 4, reps: "6-8/side", rest: "90 sec", rir: "3→2", note: "From your journal",
          muscles: "Shoulders, triceps, core",
          cues: ["Half-kneeling: ribs down, squeeze the down-side glute", "Press straight up until biceps is by your ear", "Lower under control — 3 seconds down"] },
        { name: "KB Floor Press", videoId: "zGqkWqza2z8", gym: { name: "Barbell Bench Press", videoId: "rT7DgCr-3pg", muscles: "Chest, triceps, front delts", cues: ["Shoulder blades pinched, slight arch", "Lower bar to mid-chest, elbows ~45°", "Drive feet and press to lockout"] }, sets: 4, reps: "8-10/side", rest: "90 sec", rir: "3→2", note: "Slow eccentric (3 sec)",
          muscles: "Chest, triceps, front delts",
          cues: ["Upper arms about 45° from your body", "Lightly touch elbows to the floor, no bounce", "3-second lowering, then press up hard"] },
        { name: "Push-Ups (band-resisted or elevated)", videoId: "Hzhyjhq9tQo", gym: { name: "Machine Chest Press", videoId: "pLofEAcfsO8", muscles: "Chest, triceps", cues: ["Set the seat so handles are at mid-chest", "Press smoothly without a harsh lockout", "Control the return, feel the stretch"] }, sets: 3, reps: "10-15", rest: "60 sec", rir: "2→1", note: "Elevate feet wk 5+",
          muscles: "Chest, triceps, core",
          cues: ["Straight line from head to heels, glutes tight", "Elbows tuck to ~45°, not flared", "Full lockout at the top each rep"] },
        { name: "Band Chest Fly", videoId: "kSOtuUb3_II", gym: { name: "Cable Chest Fly", videoId: "Iwe6AmxVf7o", muscles: "Chest", cues: ["Pulleys about shoulder height", "Soft fixed elbow bend, hug arms together", "Squeeze at center, slow return"] }, sets: 3, reps: "12-15", rest: "60 sec", rir: "2", note: "Squeeze at peak",
          muscles: "Chest",
          cues: ["Soft fixed bend in the elbows throughout", "Bring hands together and squeeze the chest", "Control the band back, feel the stretch"] },
        { name: "KB Halo", videoId: "Sci3lijQBmk", gym: { name: "Plate Halo", videoId: "ymCcWUFUfng", muscles: "Shoulders, upper back (mobility)", cues: ["Circle the plate close around your head", "Brace your core, ribs down", "Switch directions each set"] }, sets: 3, reps: "8/direction", rest: "45 sec", rir: "3", note: "Shoulder mobility",
          muscles: "Shoulders, upper back (mobility)",
          cues: ["Circle the bell close around your head", "Brace your core, keep ribs down", "Switch directions each set"] },
        { name: "Dead Bug", videoId: "bxn9FBrt4-A", gym: { name: "Cable Crunch", videoId: "AV5PmZJIrrw", muscles: "Abs", cues: ["Kneel, rope beside your head", "Crunch down with the abs, hips fixed", "Control the weight back up"] }, sets: 3, reps: "10/side", rest: "45 sec", rir: "—", note: "Brace hard, slow",
          muscles: "Deep core",
          cues: ["Press low back flat into the floor", "Extend opposite arm and leg slowly", "Exhale as you reach, never let the back arch"] },
      ],
    },
    {
      name: "Lower A",
      focus: "Hip hinge — posterior chain, glutes, hamstrings (Tue)",
      exercises: [
        { name: "KB Romanian Deadlift (bilateral)", videoId: "Uc5rP5xs7qQ", gym: { name: "Barbell Romanian Deadlift", videoId: "5bJEigM5iVg", muscles: "Hamstrings, glutes, lower back", cues: ["Soft knees, push the hips back", "Bar close to the legs, flat back", "Squeeze glutes to stand tall"] }, sets: 4, reps: "8-10", rest: "90 sec", rir: "3→2", note: "Hinge deep, squeeze glutes",
          muscles: "Hamstrings, glutes, lower back",
          cues: ["Soft knees, push hips back to hinge", "Keep the bells close to your legs", "Drive hips forward and squeeze glutes to stand"] },
        { name: "Bulgarian Split Squat (KB goblet)", videoId: "BqJlc5yN58w", gym: { name: "Dumbbell Bulgarian Split Squat", videoId: "hiLF_pF3EJM", muscles: "Quads, glutes", cues: ["Rear foot on a bench, dumbbells at your sides", "Drop straight down, front shin near vertical", "Drive up through the front heel"] }, sets: 4, reps: "8-10/leg", rest: "90 sec", rir: "2→1", note: "From your journal",
          muscles: "Quads, glutes",
          cues: ["Rear foot on the bench, weight at chest", "Drop straight down, front shin near vertical", "Front knee tracks over the toes"] },
        { name: "Single-Leg Romanian Deadlift", videoId: "Zfr6wizR8rs", gym: { name: "Dumbbell Single-Leg RDL", videoId: "Zfr6wizR8rs", muscles: "Hamstrings, glutes, balance", cues: ["Hinge over the standing leg", "Keep hips square, DB tracks the shin", "Stand tall and squeeze the glute"] }, sets: 3, reps: "8-10/leg", rest: "60 sec", rir: "2", note: "From your journal",
          muscles: "Hamstrings, glutes, balance",
          cues: ["Hinge over the standing leg", "Keep hips square — don't let them open", "Spine stays long, slow and controlled"] },
        { name: "KB Swing", videoId: "1Qi0NQW89Oc", gym: { name: "Cable Pull-Through", videoId: "DbSF7ipBh5Y", muscles: "Glutes, hamstrings", cues: ["Rope between legs, hinge the hips back", "Snap the hips forward to stand tall", "Glutes do the work, not the arms"] }, sets: 4, reps: "12-15", rest: "60 sec", rir: "3", note: "Power + conditioning",
          muscles: "Glutes, hamstrings, power",
          cues: ["Hinge, don't squat — bell swings between legs", "Snap the hips through hard to float the bell", "Bell rises to chest height on momentum only"] },
        { name: "Band-Resisted Hip Thrust", videoId: "2OaqZ-QAiYw", gym: { name: "Barbell Hip Thrust", videoId: "S_uZP4UH6J0", muscles: "Glutes", cues: ["Upper back on a bench, padded bar over hips", "Drive through the heels to full extension", "2-second squeeze at the top"] }, sets: 3, reps: "12-15", rest: "60 sec", rir: "2", note: "2-sec squeeze at top",
          muscles: "Glutes",
          cues: ["Shoulders on bench/floor, band over hips", "Drive through your heels", "Squeeze glutes hard for 2 seconds at the top"] },
        { name: "Calf Raises (KB in hand)", videoId: "r_2EXmQBIHI", gym: { name: "Standing Calf Raise (machine)", videoId: "SorIB5_zO9A", muscles: "Calves", cues: ["Balls of feet on the platform", "Full stretch at the bottom", "Rise onto the big toe, slow tempo"] }, sets: 3, reps: "15-20", rest: "45 sec", rir: "2", note: "Slow up and down",
          muscles: "Calves",
          cues: ["Full stretch at the bottom", "Rise all the way onto the big toe", "Slow tempo both directions, no bouncing"] },
      ],
    },
    {
      name: "Upper B",
      focus: "Pull — back, biceps, rear delts + core (Thu)",
      exercises: [
        { name: "Pull-Ups (or band-assisted)", videoId: "sIvJTfGxdFo", gym: { name: "Lat Pulldown", videoId: "CAwf7n6Luuc", muscles: "Lats, upper back, biceps", cues: ["Grip just outside shoulder width", "Pull the bar to your upper chest, chest up", "Control the bar all the way up"] }, sets: 4, reps: "5-8", rest: "90 sec", rir: "3→1", note: "Add reps weekly",
          muscles: "Lats, upper back, biceps",
          cues: ["Start from a full dead hang", "Pull your chest toward the bar", "Lower all the way down with control"] },
        { name: "Single-Arm Chest-Supported Row", videoId: "yR5q2hziZVs", gym: { name: "Chest-Supported Row Machine", videoId: "FU6YQawma2Q", muscles: "Lats, mid-back, biceps", cues: ["Chest on the pad", "Row to your hips, squeeze the blades", "Slow eccentric"] }, sets: 4, reps: "8-10/side", rest: "90 sec", rir: "2→1", note: "From your journal",
          muscles: "Lats, mid-back, biceps",
          cues: ["Chest supported on the bench", "Row the bell toward your hip", "Slow eccentric, squeeze the shoulder blade"] },
        { name: "Band Face Pulls", videoId: "AlTGQrDOd98", gym: { name: "Cable Face Pull", videoId: "0Po47vvj9g4", muscles: "Rear delts, upper back", cues: ["Rope at face height", "Pull toward your forehead, elbows high", "Squeeze the rear delts"] }, sets: 3, reps: "15-20", rest: "45 sec", rir: "2", note: "Rear delt health",
          muscles: "Rear delts, upper back",
          cues: ["Pull the band toward your forehead", "Keep elbows high, hands split apart", "Squeeze shoulder blades together"] },
        { name: "KB Gorilla Row", videoId: "yNJwusxZnfw", gym: { name: "Dumbbell Bent-Over Row", videoId: "pYcpY20QaE8", muscles: "Lats, mid-back, biceps", cues: ["Hinge ~45°, flat back", "Row the dumbbells to your hips", "Brace your core, no jerking"] }, sets: 3, reps: "10-12", rest: "60 sec", rir: "2", note: "Both KBs on floor",
          muscles: "Lats, mid-back, biceps",
          cues: ["Hinge over both bells, flat back", "Row one bell at a time to the hip", "Brace the core, minimal torso rotation"] },
        { name: "Band Pull-Aparts", videoId: "kZDAZFxA3-c", gym: { name: "Reverse Pec Deck (Rear Delt Fly)", videoId: "dC7jhEk-29A", muscles: "Rear delts", cues: ["Chest on the pad, slight elbow bend", "Open the arms back in an arc", "Squeeze the shoulder blades together"] }, sets: 3, reps: "15-20", rest: "45 sec", rir: "3", note: "Posture builder",
          muscles: "Rear delts, posture",
          cues: ["Arms straight out in front", "Pull the band apart to your chest", "Squeeze shoulder blades, control the return"] },
        { name: "Hollow Body Hold", videoId: "HAfUt2Cco74", gym: { name: "Hanging Leg Raise", videoId: "rbOJSK07AGA", muscles: "Core", cues: ["Hang from the bar, no swinging", "Raise the legs with control", "Lower slowly, stay tight"] }, sets: 3, reps: "20-30 sec", rest: "45 sec", rir: "—", note: "Build to 45 sec",
          muscles: "Core",
          cues: ["Press low back flat to the floor", "Extend arms overhead and legs out", "Hold the brace — build time week to week"] },
      ],
    },
    {
      name: "Lower B",
      focus: "Quad & unilateral — stability, single-leg strength (Fri)",
      exercises: [
        { name: "KB Goblet Squat", videoId: "aNDUbH_Uv4g", gym: { name: "Barbell Back Squat", videoId: "8PMjqgR8Wa8", muscles: "Quads, glutes", cues: ["Bar on upper traps, brace hard", "Sit between the hips to depth", "Drive up through the midfoot"] }, sets: 4, reps: "10-12", rest: "90 sec", rir: "3→2", note: "Depth over weight",
          muscles: "Quads, glutes",
          cues: ["Hold the bell at your chest", "Sit down between your hips", "Chase depth over load, chest tall"] },
        { name: "KB Reverse Lunge", videoId: "gWN9epxFqX8", gym: { name: "Dumbbell Reverse Lunge", videoId: "GcYirgCLhnI", muscles: "Quads, glutes", cues: ["Dumbbells at your sides", "Step back, rear knee toward the floor", "Drive up through the front heel"] }, sets: 4, reps: "8-10/leg", rest: "60 sec", rir: "2", note: "Step back, not forward",
          muscles: "Quads, glutes",
          cues: ["Step backward into the lunge", "Rear knee gently toward the floor", "Drive up through the front heel"] },
        { name: "Curtsy Lunge (bodyweight or light KB)", videoId: "1MgFup8A_0c", gym: { name: "Dumbbell Curtsy Lunge", videoId: "g8mCJDtD2DQ", muscles: "Glutes, adductors", cues: ["Step diagonally behind the standing leg", "Control the range, stay tall", "Drive back up through the front heel"] }, sets: 3, reps: "10-12/leg", rest: "60 sec", rir: "3", note: "Mobility focus",
          muscles: "Glutes, adductors (mobility)",
          cues: ["Step diagonally behind the standing leg", "Control the range — quality over depth", "Stay tall, hips facing forward"] },
        { name: "KB Step-Ups (bench)", videoId: "aUVJekdrpPM", gym: { name: "Dumbbell Box Step-Up", videoId: "aKj-6hgiViA", muscles: "Quads, glutes", cues: ["Whole foot on the box", "Drive up through the heel, minimal push-off", "Lower under control"] }, sets: 3, reps: "8-10/leg", rest: "60 sec", rir: "2", note: "Drive through heel",
          muscles: "Quads, glutes",
          cues: ["Whole foot flat on the bench", "Drive up through the heel, minimal push-off", "Lower yourself down under control"] },
        { name: "Banded Lateral Squat Walk", videoId: "y_bqFDQZSHQ", gym: { name: "Hip Abduction Machine", videoId: "OjI5OpV6IWA", muscles: "Glute medius, hips", cues: ["Sit tall, knees against the pads", "Press the knees outward", "Slow return, keep tension"] }, sets: 3, reps: "12/direction", rest: "45 sec", rir: "2", note: "Glute med activation",
          muscles: "Glute medius, hips",
          cues: ["Band just above the knees", "Sit into a half-squat", "Take small steps, keep band tension constant"] },
        { name: "Plank (weighted if easy)", videoId: "mwlp75MS6Rg", gym: { name: "Ab Wheel Rollout", videoId: "j6lR4u193gE", muscles: "Core", cues: ["Knees down, brace hard", "Roll out as far as you can control", "Pull back with the abs, no sagging"] }, sets: 3, reps: "30-45 sec", rest: "45 sec", rir: "—", note: "KB on back wk 5+",
          muscles: "Core",
          cues: ["Straight line, elbows under shoulders", "Squeeze glutes and quads", "Don't let the hips sag or pike"] },
      ],
    },
  ],

  // Reference info shown on the Routine tab (purely informational).
  phases: [
    { name: "Foundation", weeks: "1–3", sets: "3 sets", rir: "3–4", focus: "Learn movements, build mind-muscle connection, nail form" },
    { name: "Volume", weeks: "4–6", sets: "3–4 sets", rir: "2–3", focus: "Add a 4th set on compounds, increase reps within range" },
    { name: "Intensity", weeks: "7–8", sets: "4 sets", rir: "1–2", focus: "Push closer to failure, add tempo/pauses, heavier loads" },
  ],
};

/* =============================================================
   FUEL  —  what to eat before & after training.
   Edit freely: title, timing, tip, and the list of quick ideas.
   ============================================================= */
const FUEL = {
  pre: {
    title: "Fuel up before you train",
    timing: "Window 1 or 2 · ~60–90 min before",
    tip: "Carbs for energy + some protein. Don't lift fasted at 133 lbs — pre-load if today is a fasting day.",
    ideas: [
      "Oats + banana + scoop of whey",
      "Rice cakes + honey + Greek yogurt",
      "Toast + eggs + a piece of fruit",
      "Smoothie: banana, oats, whey, milk",
      "Bagel + peanut butter + honey",
      "Greek yogurt + granola + berries",
      "Cream of rice + protein + cinnamon",
      "Apple + handful of nuts + jerky",
    ],
  },
  post: {
    title: "Refuel — within 60 minutes",
    timing: "Window 3 · protein first, then carbs",
    tip: "Hit protein right away, then carbs to refill the tank. This is where the growth happens — aim toward your 2,800+ day.",
    ideas: [
      "Chicken or beef + rice + veg",
      "Protein shake + banana right now",
      "Eggs + potatoes + toast",
      "Greek yogurt + granola + berries",
      "Salmon + sweet potato + greens",
      "Turkey + pasta + olive oil",
      "Cottage cheese + pineapple + honey",
      "Burrito bowl: rice, beans, chicken, cheese",
    ],
  },
};

/* =============================================================
   QUOTES  —  shown when you start a workout. Add your own freely.
   ============================================================= */
const QUOTES = [
  { q: "Whether you think you can, or you think you can't — you're right.", a: "Henry Ford" },
  { q: "Strength does not come from physical capacity. It comes from an indomitable will.", a: "Mahatma Gandhi" },
  { q: "Take care of your body. It's the only place you have to live.", a: "Jim Rohn" },
  { q: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", a: "Will Durant" },
  { q: "Success isn't always about greatness. It's about consistency.", a: "Dwayne Johnson" },
  { q: "The last three or four reps is what makes the muscle grow.", a: "Arnold Schwarzenegger" },
  { q: "What hurts today makes you stronger tomorrow.", a: "Jay Cutler" },
  { q: "There is no shortcut to anywhere worth going.", a: "Beverly Sills" },
  { q: "Energy and persistence conquer all things.", a: "Benjamin Franklin" },
  { q: "Don't count the days, make the days count.", a: "Muhammad Ali" },
  { q: "Motivation is what gets you started. Habit is what keeps you going.", a: "Jim Ryun" },
  { q: "A year from now you may wish you had started today.", a: "Karen Lamb" },
  { q: "The successful warrior is the average man, with laser-like focus.", a: "Bruce Lee" },
];

/* Short hype lines flashed on the final set of Focus Mode. Edit freely. */
const FINAL_HYPE = [
  "Last set — make it count 🔥",
  "Empty the tank 💥",
  "Finish strong 💪",
  "One more — leave nothing 🔥",
  "This is the one that grows 🌱",
];

/* Inspiring food / nutrition quotes, rotated on the fuel cards. Edit freely. */
const FUEL_QUOTES = [
  { q: "Let food be thy medicine and medicine be thy food.", a: "Hippocrates" },
  { q: "Tell me what you eat, and I will tell you what you are.", a: "Brillat-Savarin" },
  { q: "To eat is a necessity, but to eat intelligently is an art.", a: "La Rochefoucauld" },
  { q: "A healthy outside starts from the inside.", a: "Robert Urich" },
  { q: "Your diet is a bank account. Good food choices are good investments.", a: "Bethenny Frankel" },
  { q: "If you keep good food in your fridge, you will eat good food.", a: "Errick McAdams" },
  { q: "First we eat, then we do everything else.", a: "M.F.K. Fisher" },
  { q: "One cannot think well, love well, sleep well, if one has not dined well.", a: "Virginia Woolf" },
  { q: "The greatest wealth is health.", a: "Virgil" },
  { q: "Eat breakfast like a king, lunch like a prince, dinner like a pauper.", a: "Adelle Davis" },
];
