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
   ============================================================= */

const ROUTINE = {
  title: "The Foundation",
  subtitle: "8-Week Hypertrophy · Kettlebells + Bands · 4 days/week",
  days: [
    {
      name: "Upper A",
      focus: "Push — chest, shoulders, triceps + core (Mon)",
      exercises: [
        { name: "Half-Kneeling Single-Arm KB Overhead Press", sets: 4, reps: "6-8/side", rest: "90 sec", rir: "3→2", note: "From your journal",
          muscles: "Shoulders, triceps, core",
          cues: ["Half-kneeling: ribs down, squeeze the down-side glute", "Press straight up until biceps is by your ear", "Lower under control — 3 seconds down"] },
        { name: "KB Floor Press", sets: 4, reps: "8-10/side", rest: "90 sec", rir: "3→2", note: "Slow eccentric (3 sec)",
          muscles: "Chest, triceps, front delts",
          cues: ["Upper arms about 45° from your body", "Lightly touch elbows to the floor, no bounce", "3-second lowering, then press up hard"] },
        { name: "Push-Ups (band-resisted or elevated)", sets: 3, reps: "10-15", rest: "60 sec", rir: "2→1", note: "Elevate feet wk 5+",
          muscles: "Chest, triceps, core",
          cues: ["Straight line from head to heels, glutes tight", "Elbows tuck to ~45°, not flared", "Full lockout at the top each rep"] },
        { name: "Band Chest Fly", sets: 3, reps: "12-15", rest: "60 sec", rir: "2", note: "Squeeze at peak",
          muscles: "Chest",
          cues: ["Soft fixed bend in the elbows throughout", "Bring hands together and squeeze the chest", "Control the band back, feel the stretch"] },
        { name: "KB Halo", sets: 3, reps: "8/direction", rest: "45 sec", rir: "3", note: "Shoulder mobility",
          muscles: "Shoulders, upper back (mobility)",
          cues: ["Circle the bell close around your head", "Brace your core, keep ribs down", "Switch directions each set"] },
        { name: "Dead Bug", sets: 3, reps: "10/side", rest: "45 sec", rir: "—", note: "Brace hard, slow",
          muscles: "Deep core",
          cues: ["Press low back flat into the floor", "Extend opposite arm and leg slowly", "Exhale as you reach, never let the back arch"] },
      ],
    },
    {
      name: "Lower A",
      focus: "Hip hinge — posterior chain, glutes, hamstrings (Tue)",
      exercises: [
        { name: "KB Romanian Deadlift (bilateral)", sets: 4, reps: "8-10", rest: "90 sec", rir: "3→2", note: "Hinge deep, squeeze glutes",
          muscles: "Hamstrings, glutes, lower back",
          cues: ["Soft knees, push hips back to hinge", "Keep the bells close to your legs", "Drive hips forward and squeeze glutes to stand"] },
        { name: "Bulgarian Split Squat (KB goblet)", sets: 4, reps: "8-10/leg", rest: "90 sec", rir: "2→1", note: "From your journal",
          muscles: "Quads, glutes",
          cues: ["Rear foot on the bench, weight at chest", "Drop straight down, front shin near vertical", "Front knee tracks over the toes"] },
        { name: "Single-Leg Romanian Deadlift", sets: 3, reps: "8-10/leg", rest: "60 sec", rir: "2", note: "From your journal",
          muscles: "Hamstrings, glutes, balance",
          cues: ["Hinge over the standing leg", "Keep hips square — don't let them open", "Spine stays long, slow and controlled"] },
        { name: "KB Swing", sets: 4, reps: "12-15", rest: "60 sec", rir: "3", note: "Power + conditioning",
          muscles: "Glutes, hamstrings, power",
          cues: ["Hinge, don't squat — bell swings between legs", "Snap the hips through hard to float the bell", "Bell rises to chest height on momentum only"] },
        { name: "Band-Resisted Hip Thrust", sets: 3, reps: "12-15", rest: "60 sec", rir: "2", note: "2-sec squeeze at top",
          muscles: "Glutes",
          cues: ["Shoulders on bench/floor, band over hips", "Drive through your heels", "Squeeze glutes hard for 2 seconds at the top"] },
        { name: "Calf Raises (KB in hand)", sets: 3, reps: "15-20", rest: "45 sec", rir: "2", note: "Slow up and down",
          muscles: "Calves",
          cues: ["Full stretch at the bottom", "Rise all the way onto the big toe", "Slow tempo both directions, no bouncing"] },
      ],
    },
    {
      name: "Upper B",
      focus: "Pull — back, biceps, rear delts + core (Thu)",
      exercises: [
        { name: "Pull-Ups (or band-assisted)", sets: 4, reps: "5-8", rest: "90 sec", rir: "3→1", note: "Add reps weekly",
          muscles: "Lats, upper back, biceps",
          cues: ["Start from a full dead hang", "Pull your chest toward the bar", "Lower all the way down with control"] },
        { name: "Single-Arm Chest-Supported Row", sets: 4, reps: "8-10/side", rest: "90 sec", rir: "2→1", note: "From your journal",
          muscles: "Lats, mid-back, biceps",
          cues: ["Chest supported on the bench", "Row the bell toward your hip", "Slow eccentric, squeeze the shoulder blade"] },
        { name: "Band Face Pulls", sets: 3, reps: "15-20", rest: "45 sec", rir: "2", note: "Rear delt health",
          muscles: "Rear delts, upper back",
          cues: ["Pull the band toward your forehead", "Keep elbows high, hands split apart", "Squeeze shoulder blades together"] },
        { name: "KB Gorilla Row", sets: 3, reps: "10-12", rest: "60 sec", rir: "2", note: "Both KBs on floor",
          muscles: "Lats, mid-back, biceps",
          cues: ["Hinge over both bells, flat back", "Row one bell at a time to the hip", "Brace the core, minimal torso rotation"] },
        { name: "Band Pull-Aparts", sets: 3, reps: "15-20", rest: "45 sec", rir: "3", note: "Posture builder",
          muscles: "Rear delts, posture",
          cues: ["Arms straight out in front", "Pull the band apart to your chest", "Squeeze shoulder blades, control the return"] },
        { name: "Hollow Body Hold", sets: 3, reps: "20-30 sec", rest: "45 sec", rir: "—", note: "Build to 45 sec",
          muscles: "Core",
          cues: ["Press low back flat to the floor", "Extend arms overhead and legs out", "Hold the brace — build time week to week"] },
      ],
    },
    {
      name: "Lower B",
      focus: "Quad & unilateral — stability, single-leg strength (Fri)",
      exercises: [
        { name: "KB Goblet Squat", sets: 4, reps: "10-12", rest: "90 sec", rir: "3→2", note: "Depth over weight",
          muscles: "Quads, glutes",
          cues: ["Hold the bell at your chest", "Sit down between your hips", "Chase depth over load, chest tall"] },
        { name: "KB Reverse Lunge", sets: 4, reps: "8-10/leg", rest: "60 sec", rir: "2", note: "Step back, not forward",
          muscles: "Quads, glutes",
          cues: ["Step backward into the lunge", "Rear knee gently toward the floor", "Drive up through the front heel"] },
        { name: "Curtsy Lunge (bodyweight or light KB)", sets: 3, reps: "10-12/leg", rest: "60 sec", rir: "3", note: "Mobility focus",
          muscles: "Glutes, adductors (mobility)",
          cues: ["Step diagonally behind the standing leg", "Control the range — quality over depth", "Stay tall, hips facing forward"] },
        { name: "KB Step-Ups (bench)", sets: 3, reps: "8-10/leg", rest: "60 sec", rir: "2", note: "Drive through heel",
          muscles: "Quads, glutes",
          cues: ["Whole foot flat on the bench", "Drive up through the heel, minimal push-off", "Lower yourself down under control"] },
        { name: "Banded Lateral Squat Walk", sets: 3, reps: "12/direction", rest: "45 sec", rir: "2", note: "Glute med activation",
          muscles: "Glute medius, hips",
          cues: ["Band just above the knees", "Sit into a half-squat", "Take small steps, keep band tension constant"] },
        { name: "Plank (weighted if easy)", sets: 3, reps: "30-45 sec", rest: "45 sec", rir: "—", note: "KB on back wk 5+",
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
