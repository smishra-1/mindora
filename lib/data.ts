export type BuddyId = "bear" | "fox" | "bunny" | "dragon";
export type MoodId = "happy" | "calm" | "sad" | "angry" | "worried" | "tired";
export type TagId =
  | "school"
  | "exams"
  | "friends"
  | "family"
  | "outside"
  | "sports"
  | "screens"
  | "alone";
export type GrownUpId = "teacher" | "parent" | "counselor";

export const BUDDIES: Record<
  BuddyId,
  { label: string; emoji: string; bg: string; defaultName: string }
> = {
  bear: { label: "Bear", emoji: "🐻", bg: "var(--peach)", defaultName: "Honey" },
  fox: { label: "Fox", emoji: "🦊", bg: "var(--sun)", defaultName: "Ember" },
  bunny: { label: "Bunny", emoji: "🐰", bg: "var(--lilac)", defaultName: "Bubbles" },
  dragon: { label: "Dragon", emoji: "🐲", bg: "var(--mint)", defaultName: "Sparky" },
};

export const MOODS: Record<
  MoodId,
  { label: string; emoji: string; bg: string; ink: string; score: number }
> = {
  happy: { label: "Happy", emoji: "😄", bg: "var(--sun)", ink: "#c58a00", score: 5 },
  calm: { label: "Calm", emoji: "😌", bg: "var(--mint)", ink: "#2f9a5a", score: 4 },
  sad: { label: "Sad", emoji: "😢", bg: "var(--sky)", ink: "#2f78c4", score: 1 },
  angry: { label: "Angry", emoji: "😠", bg: "var(--rose)", ink: "#d2475b", score: 2 },
  worried: { label: "Worried", emoji: "😟", bg: "var(--lilac)", ink: "#7b5cc4", score: 2 },
  tired: { label: "Tired", emoji: "😴", bg: "var(--cloud)", ink: "#6b7280", score: 3 },
};

export const MOOD_ORDER: MoodId[] = ["happy", "calm", "sad", "angry", "worried", "tired"];
export const LOW_MOODS: MoodId[] = ["sad", "angry", "worried"];

export const TAGS: Record<TagId, { label: string; emoji: string }> = {
  school: { label: "School", emoji: "🏫" },
  exams: { label: "Exams or tests", emoji: "📝" },
  friends: { label: "Friends", emoji: "🧑‍🤝‍🧑" },
  family: { label: "Family time", emoji: "🏡" },
  outside: { label: "Played outside", emoji: "🌳" },
  sports: { label: "Sports", emoji: "⚽" },
  screens: { label: "Lots of screens", emoji: "📱" },
  alone: { label: "Felt left out", emoji: "🫥" },
};

export const STRESS_LABELS = ["", "Very relaxed", "A little", "Some", "A lot", "Too much"];

export const GROWN_UPS: Record<
  GrownUpId,
  { label: string; emoji: string; hint: string; placeholder: string }
> = {
  teacher: { label: "My teacher", emoji: "🧑‍🏫", hint: "Someone at school", placeholder: "Ms. Rao" },
  parent: { label: "My parent", emoji: "👨‍👩‍👧", hint: "Mum, Dad or carer", placeholder: "Mum" },
  counselor: { label: "The counsellor", emoji: "💬", hint: "At school", placeholder: "the counsellor" },
};

export const HELPLINES = [
  {
    name: "Tele-MANAS",
    detail: "Free 24/7 mental health support, India",
    phone: "14416",
  },
  { name: "Childline", detail: "Help for children & young people, India", phone: "1098" },
  { name: "Emergency", detail: "If you are in danger right now", phone: "112" },
];

export type ActivityId =
  | "belly-breathing"
  | "box-breathing"
  | "grounding"
  | "muscle-relax"
  | "stretch"
  | "drawing"
  | "good-things"
  | "body-scan"
  | "wind-down";

export type Activity = {
  id: ActivityId;
  title: string;
  emoji: string;
  kind: "breathing" | "steps" | "good-things";
  minutes: number;
  intro: string;
  steps: string[];
  /** breathing pattern in seconds: in, hold, out, hold */
  pattern?: [number, number, number, number];
};

export const ACTIVITIES: Record<ActivityId, Activity> = {
  "belly-breathing": {
    id: "belly-breathing",
    title: "Belly breathing",
    emoji: "🎈",
    kind: "breathing",
    minutes: 1,
    intro: "Slow breaths tell your body it's safe.",
    steps: [
      "Put one hand on your tummy.",
      "Breathe in slowly and feel it grow like a balloon.",
      "Breathe out and let it go flat.",
      "Do it 5 times.",
    ],
    pattern: [4, 0, 4, 0],
  },
  "box-breathing": {
    id: "box-breathing",
    title: "Box breathing",
    emoji: "🟪",
    kind: "breathing",
    minutes: 2,
    intro: "Four equal sides: in, hold, out, hold.",
    steps: [
      "Breathe in for 4.",
      "Hold for 4.",
      "Breathe out for 4.",
      "Hold for 4, then start again.",
    ],
    pattern: [4, 4, 4, 4],
  },
  grounding: {
    id: "grounding",
    title: "5-4-3-2-1 senses",
    emoji: "🖐️",
    kind: "steps",
    minutes: 3,
    intro: "Bring your mind back to right here, right now.",
    steps: [
      "Name 5 things you can see.",
      "Name 4 things you can touch.",
      "Name 3 things you can hear.",
      "Name 2 things you can smell.",
      "Name 1 thing you can taste.",
    ],
  },
  "muscle-relax": {
    id: "muscle-relax",
    title: "Squeeze & let go",
    emoji: "🍋",
    kind: "steps",
    minutes: 3,
    intro: "Tense a muscle, then let it go soft. Angry energy melts away.",
    steps: [
      "Squeeze your hands into fists like holding lemons. Hold 5… let go.",
      "Push your shoulders up to your ears. Hold 5… drop them.",
      "Scrunch your face tight. Hold 5… relax.",
      "Press your feet into the floor. Hold 5… soften.",
      "Notice how floppy and calm your body feels.",
    ],
  },
  stretch: {
    id: "stretch",
    title: "Quick stretch",
    emoji: "🤸",
    kind: "steps",
    minutes: 2,
    intro: "Wake your body up and shake off heavy feelings.",
    steps: [
      "Reach up high like you're picking a star.",
      "Bend down and touch your toes (or knees!).",
      "Roll your shoulders back 5 times.",
      "Shake your hands and feet for 10 seconds.",
    ],
  },
  drawing: {
    id: "drawing",
    title: "Draw your feeling",
    emoji: "🎨",
    kind: "steps",
    minutes: 5,
    intro: "Feelings are easier to hold when they're on paper.",
    steps: [
      "Grab paper and any colours.",
      "What colour is your feeling? What shape?",
      "Draw it as big or small as it feels.",
      "Now draw something that would help it feel better.",
    ],
  },
  "good-things": {
    id: "good-things",
    title: "3 good things",
    emoji: "🌟",
    kind: "good-things",
    minutes: 2,
    intro: "Even on hard days, small good things are hiding.",
    steps: ["Write down three good things from today, big or tiny."],
  },
  "body-scan": {
    id: "body-scan",
    title: "Mini meditation",
    emoji: "🧘",
    kind: "breathing",
    minutes: 2,
    intro: "Breathe slowly and notice each part of your body, head to toes.",
    steps: [
      "Sit or lie comfortably and close your eyes.",
      "Breathe in for 4, out for 6.",
      "Notice your head, shoulders, tummy, legs, toes.",
      "If your mind wanders, that's okay — come back to your breath.",
    ],
    pattern: [4, 0, 6, 0],
  },
  "wind-down": {
    id: "wind-down",
    title: "Sleep wind-down",
    emoji: "🌙",
    kind: "steps",
    minutes: 5,
    intro: "Good sleep makes tomorrow's feelings lighter.",
    steps: [
      "Put screens away 30 minutes before bed.",
      "Dim the lights and get cosy.",
      "Do 5 slow belly breaths in bed.",
      "Think of one thing you're looking forward to.",
    ],
  },
};

export const ACTIVITIES_FOR_MOOD: Record<MoodId, ActivityId[]> = {
  happy: ["good-things", "drawing", "stretch"],
  calm: ["body-scan", "good-things", "drawing"],
  sad: ["belly-breathing", "drawing", "good-things"],
  angry: ["muscle-relax", "box-breathing", "stretch"],
  worried: ["grounding", "box-breathing", "belly-breathing"],
  tired: ["wind-down", "stretch", "body-scan"],
};
