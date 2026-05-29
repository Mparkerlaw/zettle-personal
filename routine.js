/* =============================================================
   YOUR WORKOUT ROUTINE  —  "The Foundation" 8-Week Hypertrophy
   -------------------------------------------------------------
   This is the ONLY file you need to edit to change your routine.
   Each day has: name, focus, and a list of exercises.
   Each exercise has: name, sets, reps, and optional rest / rir / note.
     reps  -> "8-10", "6-8/side", "AMRAP", "20-30 sec", etc.
     rest  -> e.g. "90 sec"
     rir   -> reps-in-reserve target, e.g. "3→2"
     note  -> short cue
   ============================================================= */

const ROUTINE = {
  title: "The Foundation",
  subtitle: "8-Week Hypertrophy · Kettlebells + Bands · 4 days/week",
  days: [
    {
      name: "Upper A",
      focus: "Push — chest, shoulders, triceps + core (Mon)",
      exercises: [
        { name: "Half-Kneeling Single-Arm KB Overhead Press", sets: 4, reps: "6-8/side", rest: "90 sec", rir: "3→2", note: "From your journal" },
        { name: "KB Floor Press", sets: 4, reps: "8-10/side", rest: "90 sec", rir: "3→2", note: "Slow eccentric (3 sec)" },
        { name: "Push-Ups (band-resisted or elevated)", sets: 3, reps: "10-15", rest: "60 sec", rir: "2→1", note: "Elevate feet wk 5+" },
        { name: "Band Chest Fly", sets: 3, reps: "12-15", rest: "60 sec", rir: "2", note: "Squeeze at peak" },
        { name: "KB Halo", sets: 3, reps: "8/direction", rest: "45 sec", rir: "3", note: "Shoulder mobility" },
        { name: "Dead Bug", sets: 3, reps: "10/side", rest: "45 sec", rir: "—", note: "Brace hard, slow" },
      ],
    },
    {
      name: "Lower A",
      focus: "Hip hinge — posterior chain, glutes, hamstrings (Tue)",
      exercises: [
        { name: "KB Romanian Deadlift (bilateral)", sets: 4, reps: "8-10", rest: "90 sec", rir: "3→2", note: "Hinge deep, squeeze glutes" },
        { name: "Bulgarian Split Squat (KB goblet)", sets: 4, reps: "8-10/leg", rest: "90 sec", rir: "2→1", note: "From your journal" },
        { name: "Single-Leg Romanian Deadlift", sets: 3, reps: "8-10/leg", rest: "60 sec", rir: "2", note: "From your journal" },
        { name: "KB Swing", sets: 4, reps: "12-15", rest: "60 sec", rir: "3", note: "Power + conditioning" },
        { name: "Band-Resisted Hip Thrust", sets: 3, reps: "12-15", rest: "60 sec", rir: "2", note: "2-sec squeeze at top" },
        { name: "Calf Raises (KB in hand)", sets: 3, reps: "15-20", rest: "45 sec", rir: "2", note: "Slow up and down" },
      ],
    },
    {
      name: "Upper B",
      focus: "Pull — back, biceps, rear delts + core (Thu)",
      exercises: [
        { name: "Pull-Ups (or band-assisted)", sets: 4, reps: "5-8", rest: "90 sec", rir: "3→1", note: "Add reps weekly" },
        { name: "Single-Arm Chest-Supported Row", sets: 4, reps: "8-10/side", rest: "90 sec", rir: "2→1", note: "From your journal" },
        { name: "Band Face Pulls", sets: 3, reps: "15-20", rest: "45 sec", rir: "2", note: "Rear delt health" },
        { name: "KB Gorilla Row", sets: 3, reps: "10-12", rest: "60 sec", rir: "2", note: "Both KBs on floor" },
        { name: "Band Pull-Aparts", sets: 3, reps: "15-20", rest: "45 sec", rir: "3", note: "Posture builder" },
        { name: "Hollow Body Hold", sets: 3, reps: "20-30 sec", rest: "45 sec", rir: "—", note: "Build to 45 sec" },
      ],
    },
    {
      name: "Lower B",
      focus: "Quad & unilateral — stability, single-leg strength (Fri)",
      exercises: [
        { name: "KB Goblet Squat", sets: 4, reps: "10-12", rest: "90 sec", rir: "3→2", note: "Depth over weight" },
        { name: "KB Reverse Lunge", sets: 4, reps: "8-10/leg", rest: "60 sec", rir: "2", note: "Step back, not forward" },
        { name: "Curtsy Lunge (bodyweight or light KB)", sets: 3, reps: "10-12/leg", rest: "60 sec", rir: "3", note: "Mobility focus" },
        { name: "KB Step-Ups (bench)", sets: 3, reps: "8-10/leg", rest: "60 sec", rir: "2", note: "Drive through heel" },
        { name: "Banded Lateral Squat Walk", sets: 3, reps: "12/direction", rest: "45 sec", rir: "2", note: "Glute med activation" },
        { name: "Plank (weighted if easy)", sets: 3, reps: "30-45 sec", rest: "45 sec", rir: "—", note: "KB on back wk 5+" },
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
