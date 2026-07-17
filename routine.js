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
  subtitle: "6-day Glute block (Mon–Sat) + optional Upper A / Upper B days",
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
      name: "Glute 1",
      focus: "RDL · Hip Thrust · Bulgarian (Mon)",
      exercises: [
        { name: "Romanian Deadlift", videoId: "Uc5rP5xs7qQ", gym: { name: "Barbell Romanian Deadlift", videoId: "5bJEigM5iVg", muscles: "Hamstrings, glutes", cues: ["Soft knees, push the hips back", "Bar close to the legs, flat back", "Squeeze glutes to stand tall"] }, sets: 3, reps: "12", rest: "90 sec", rir: "2", note: "Hinge deep, squeeze glutes",
          muscles: "Hamstrings, glutes",
          cues: ["Soft knees, push the hips back to hinge", "Weight stays close to your legs", "Drive hips forward, squeeze the glutes to stand"] },
        { name: "Hip Thrust", videoId: "2OaqZ-QAiYw", gym: { name: "Barbell Hip Thrust", videoId: "S_uZP4UH6J0", muscles: "Glutes", cues: ["Upper back on a bench, padded bar over hips", "Drive through the heels to full extension", "Squeeze the glutes hard at the top"] }, sets: 3, reps: "12", rest: "90 sec", rir: "2", note: "Full lockout, ribs down",
          muscles: "Glutes",
          cues: ["Shoulders on a bench, drive through the heels", "Full hip extension, ribs down", "Squeeze the glutes hard at the top"] },
        { name: "Bulgarian Split Squat", videoId: "BqJlc5yN58w", gym: { name: "Dumbbell Bulgarian Split Squat", videoId: "hiLF_pF3EJM", muscles: "Quads, glutes", cues: ["Rear foot on a bench, weight at your sides", "Drop straight down, front shin near vertical", "Drive up through the front heel"] }, sets: 3, reps: "12/leg", rest: "90 sec", rir: "2", note: "Depth + control",
          muscles: "Quads, glutes",
          cues: ["Rear foot elevated, drop straight down", "Front shin near vertical, knee tracks toes", "Drive up through the front heel"] },
      ],
    },
    {
      name: "Glute 2",
      focus: "BSS · B-stance RDL · Kickback · Airplane (Tue)",
      exercises: [
        { name: "Bulgarian Split Squat", videoId: "BqJlc5yN58w", gym: { name: "Dumbbell Bulgarian Split Squat", videoId: "hiLF_pF3EJM", muscles: "Quads, glutes", cues: ["Rear foot on a bench, weight at your sides", "Drop straight down, front shin near vertical", "Drive up through the front heel"] }, sets: 3, reps: "12/leg", rest: "90 sec", rir: "2", note: "",
          muscles: "Quads, glutes",
          cues: ["Rear foot elevated, drop straight down", "Front shin near vertical, knee tracks toes", "Drive up through the front heel"] },
        { name: "B-Stance Romanian Deadlift", videoId: "9M7s_utu-ls", sets: 3, reps: "12/leg", rest: "60 sec", rir: "2", note: "Kickstand back foot",
          muscles: "Glutes, hamstrings",
          cues: ["Back foot as a kickstand — toe down, light", "Hinge over the working leg", "Load the front glute/ham, squeeze to stand"] },
        { name: "Glute Kickback", videoId: "jBmarLD4Nog", gym: { name: "Cable Glute Kickback", videoId: "bVrmtCI00Ys", muscles: "Glutes", cues: ["Strap on the ankle, hinge slightly", "Drive the heel straight back, squeeze", "Control the return, no swinging"] }, sets: 3, reps: "12/leg", rest: "45 sec", rir: "2", note: "Squeeze at the top",
          muscles: "Glutes",
          cues: ["Band on the ankle, brace the core", "Drive the heel straight back, squeeze the glute", "Control the return, no swinging"] },
        { name: "Single-Leg Airplane", videoId: "9svtEV4vkp0", sets: 3, reps: "12/leg", rest: "45 sec", rir: "2", note: "Slow rotation",
          muscles: "Glutes, balance",
          cues: ["Hinge on one leg, arms out like wings", "Rotate the hips open, then closed", "Move slow, keep the standing knee soft"] },
      ],
    },
    {
      name: "Glute 3",
      focus: "Hip Thrust holds · BSS · Clamshell (Wed)",
      exercises: [
        { name: "Hip Thrust", videoId: "2OaqZ-QAiYw", gym: { name: "Barbell Hip Thrust", videoId: "S_uZP4UH6J0", muscles: "Glutes", cues: ["Upper back on a bench, padded bar over hips", "Drive through the heels to full extension", "3-second squeeze at the top"] }, sets: 3, reps: "10", rest: "90 sec", rir: "2", note: "3-sec hold at the top",
          muscles: "Glutes",
          cues: ["Drive to full extension, ribs down", "Hold the top squeeze for 3 seconds", "Lower under control"] },
        { name: "Bulgarian Split Squat", videoId: "BqJlc5yN58w", gym: { name: "Dumbbell Bulgarian Split Squat", videoId: "hiLF_pF3EJM", muscles: "Quads, glutes", cues: ["Rear foot on a bench, weight at your sides", "Drop straight down, front shin near vertical", "Drive up through the front heel"] }, sets: 3, reps: "12/leg", rest: "90 sec", rir: "2", note: "",
          muscles: "Quads, glutes",
          cues: ["Rear foot elevated, drop straight down", "Front shin near vertical, knee tracks toes", "Drive up through the front heel"] },
        { name: "Clamshell", videoId: "aQVApsdOLSI", sets: 3, reps: "12/side", rest: "45 sec", rir: "2", note: "Band above the knees",
          muscles: "Glute medius",
          cues: ["Side-lying, knees bent, feet stacked", "Open the top knee, keep the feet together", "Squeeze the outer glute, no hip rock"] },
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
      name: "Glute 4",
      focus: "Side Steps · Kickback · Airplane (Thu)",
      exercises: [
        { name: "Banded Side Steps", videoId: "y_bqFDQZSHQ", gym: { name: "Hip Abduction Machine", videoId: "OjI5OpV6IWA", muscles: "Glute medius, hips", cues: ["Sit tall, knees against the pads", "Press the knees outward", "Slow return, keep tension"] }, sets: 3, reps: "15/direction", rest: "45 sec", rir: "2", note: "Stay low, band tight",
          muscles: "Glute medius, hips",
          cues: ["Band above the knees, sit into a half-squat", "Step sideways, keep tension on the band", "Small controlled steps, stay low"] },
        { name: "Glute Kickback", videoId: "jBmarLD4Nog", gym: { name: "Cable Glute Kickback", videoId: "bVrmtCI00Ys", muscles: "Glutes", cues: ["Strap on the ankle, hinge slightly", "Drive the heel straight back, squeeze", "Control the return, no swinging"] }, sets: 3, reps: "12/leg", rest: "45 sec", rir: "2", note: "Squeeze at the top",
          muscles: "Glutes",
          cues: ["Band on the ankle, brace the core", "Drive the heel straight back, squeeze the glute", "Control the return, no swinging"] },
        { name: "Single-Leg Airplane", videoId: "9svtEV4vkp0", sets: 3, reps: "12/leg", rest: "45 sec", rir: "2", note: "Slow rotation",
          muscles: "Glutes, balance",
          cues: ["Hinge on one leg, arms out like wings", "Rotate the hips open, then closed", "Move slow, keep the standing knee soft"] },
      ],
    },
    {
      name: "Glute 5",
      focus: "Hip Thrust + 21s · BSS · StairMaster (Fri)",
      exercises: [
        { name: "Hip Thrust", videoId: "2OaqZ-QAiYw", gym: { name: "Barbell Hip Thrust", videoId: "S_uZP4UH6J0", muscles: "Glutes", cues: ["Upper back on a bench, padded bar over hips", "Drive through the heels to full extension", "Squeeze the glutes hard at the top"] }, sets: 3, reps: "10", rest: "90 sec", rir: "2", note: "Heavier, full lockout",
          muscles: "Glutes",
          cues: ["Shoulders on a bench, drive through the heels", "Full hip extension, ribs down", "Squeeze the glutes hard at the top"] },
        { name: "Hip Thrust (21s)", videoId: "2OaqZ-QAiYw", gym: { name: "Barbell Hip Thrust (21s)", videoId: "S_uZP4UH6J0", muscles: "Glutes", cues: ["7 bottom-half reps", "7 top-half reps", "7 full reps — no rest between"] }, sets: 1, reps: "21", rest: "90 sec", rir: "1", note: "7 bottom + 7 top + 7 full",
          muscles: "Glutes",
          cues: ["7 reps in the bottom-half range", "7 reps in the top-half range", "7 full reps — burn it out"] },
        { name: "Bulgarian Split Squat", videoId: "BqJlc5yN58w", gym: { name: "Dumbbell Bulgarian Split Squat", videoId: "hiLF_pF3EJM", muscles: "Quads, glutes", cues: ["Rear foot on a bench, weight at your sides", "Drop straight down, front shin near vertical", "Drive up through the front heel"] }, sets: 3, reps: "12/leg", rest: "90 sec", rir: "2", note: "",
          muscles: "Quads, glutes",
          cues: ["Rear foot elevated, drop straight down", "Front shin near vertical, knee tracks toes", "Drive up through the front heel"] },
        { name: "StairMaster", sets: 1, reps: "5 min", rest: "—", rir: "—", note: "Cardio finisher — log minutes in reps",
          muscles: "Glutes, cardio",
          cues: ["Steady, moderate pace", "Stand tall — don't lean on the rails", "Drive through the whole foot"] },
      ],
    },
    {
      name: "Glute 6",
      focus: "Side Steps · Kickback · Airplane (Sat)",
      exercises: [
        { name: "Banded Side Steps", videoId: "y_bqFDQZSHQ", gym: { name: "Hip Abduction Machine", videoId: "OjI5OpV6IWA", muscles: "Glute medius, hips", cues: ["Sit tall, knees against the pads", "Press the knees outward", "Slow return, keep tension"] }, sets: 3, reps: "15/direction", rest: "45 sec", rir: "2", note: "Stay low, band tight",
          muscles: "Glute medius, hips",
          cues: ["Band above the knees, sit into a half-squat", "Step sideways, keep tension on the band", "Small controlled steps, stay low"] },
        { name: "Glute Kickback", videoId: "jBmarLD4Nog", gym: { name: "Cable Glute Kickback", videoId: "bVrmtCI00Ys", muscles: "Glutes", cues: ["Strap on the ankle, hinge slightly", "Drive the heel straight back, squeeze", "Control the return, no swinging"] }, sets: 3, reps: "12/leg", rest: "45 sec", rir: "2", note: "Squeeze at the top",
          muscles: "Glutes",
          cues: ["Band on the ankle, brace the core", "Drive the heel straight back, squeeze the glute", "Control the return, no swinging"] },
        { name: "Single-Leg Airplane", videoId: "9svtEV4vkp0", sets: 3, reps: "12/leg", rest: "45 sec", rir: "2", note: "Slow rotation",
          muscles: "Glutes, balance",
          cues: ["Hinge on one leg, arms out like wings", "Rotate the hips open, then closed", "Move slow, keep the standing knee soft"] },
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
