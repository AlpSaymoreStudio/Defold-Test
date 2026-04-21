export type Stat = {
  strength: number;
  mana: number;
  accuracy: number;
  defense: number;
  agility: number;
};

export type UniqueStatKey =
  | "plausibility"
  | "resonance"
  | "toxicity"
  | "harmony"
  | "entropy"
  | "divinity"
  | "corruption"
  | "bond"
  | "momentum"
  | "fate"
  | "illusion"
  | "void";

export type HigherClass = {
  id: string;
  name: string;
  description: string;
  lore: string;
  uniqueStat?: { key: UniqueStatKey; name: string; description: string };
  statBonus: Partial<Stat>;
  abilities: string[];
  color: string;
};

export type BaseClass = {
  id: string;
  name: string;
  description: string;
  lore: string;
  baseStats: Stat;
  icon: string;
  color: string;
  higherClasses: [HigherClass, HigherClass, HigherClass];
};

export type PlayerStats = Stat & {
  [key in UniqueStatKey]?: number;
};

export type PlayerClass = {
  baseClassId: string;
  higherClassId?: string;
};

export const BASE_CLASSES: BaseClass[] = [
  {
    id: "warrior",
    name: "Warrior",
    description: "Master of arms, forged in battle's fire.",
    lore: "Warriors are those who survived where others fell. In a world overrun by monsters, they learned to become something worse.",
    baseStats: { strength: 12, mana: 3, accuracy: 7, defense: 10, agility: 6 },
    icon: "sword",
    color: "#c0392b",
    higherClasses: [
      {
        id: "knight",
        name: "Knight",
        description: "A bastion of steel and honor — or what remains of it.",
        lore: "Knights swore oaths to a goddess who may have already betrayed them. Still, the armor holds.",
        statBonus: { strength: 4, defense: 8, agility: -1 },
        abilities: ["Shield Bash", "Holy Bulwark", "Rallying Cry"],
        color: "#85929e",
      },
      {
        id: "berserker",
        name: "Berserker",
        description: "Pain is fuel. Death is irrelevant.",
        lore: "When the world breaks you, you can break it back. Berserkers stopped fearing death long ago.",
        statBonus: { strength: 10, agility: 3, defense: -2, mana: -1 },
        abilities: ["Blood Rage", "Brutal Strike", "Undying Fury"],
        color: "#922b21",
      },
      {
        id: "paladin",
        name: "Paladin",
        description: "Divine wrath wrapped in sacred steel.",
        lore: "Paladins channel holy power — but whose holiness? The goddess they serve may not be what she seems.",
        statBonus: { strength: 5, mana: 6, defense: 5 },
        abilities: ["Sacred Flame", "Divine Shield", "Judgment"],
        color: "#f0b429",
      },
    ],
  },
  {
    id: "mage",
    name: "Mage",
    description: "Wielder of arcane forces beyond comprehension.",
    lore: "Magic in this world bleeds from the cracks between realms — where the monsters came from. Mages feed on that wound.",
    baseStats: { strength: 3, mana: 14, accuracy: 9, defense: 4, agility: 7 },
    icon: "star",
    color: "#3498db",
    higherClasses: [
      {
        id: "elemental_mage",
        name: "Elemental Mage",
        description: "Commands fire, frost, and storm.",
        lore: "The elements don't care about prophecy or blessing. Neither does an Elemental Mage.",
        statBonus: { mana: 8, accuracy: 5, strength: 1 },
        abilities: ["Fireball", "Frostbolt", "Chain Lightning"],
        color: "#e74c3c",
      },
      {
        id: "warlock",
        name: "Warlock",
        description: "Power through dark pacts and forbidden knowledge.",
        lore: "The monsters come from another world. Warlocks learned to borrow their power.",
        statBonus: { mana: 10, strength: 3, defense: -1 },
        abilities: ["Drain Life", "Curse of Agony", "Shadow Bolt"],
        color: "#7d3c98",
      },
      {
        id: "necromancer",
        name: "Necromancer",
        description: "Life and death are merely suggestions.",
        lore: "If the dead can be called back, perhaps even a dying world can be saved. Or damned more thoroughly.",
        statBonus: { mana: 12, defense: 2, agility: -2 },
        abilities: ["Raise Dead", "Death Coil", "Soul Harvest"],
        color: "#1c2833",
      },
    ],
  },
  {
    id: "rogue",
    name: "Rogue",
    description: "Shadow and silence. A blade before a whisper.",
    lore: "In a world where monsters wear armor now, subtlety became the deadliest art.",
    baseStats: { strength: 7, mana: 5, accuracy: 11, defense: 5, agility: 13 },
    icon: "eye-off",
    color: "#2ecc71",
    higherClasses: [
      {
        id: "assassin",
        name: "Assassin",
        description: "One hit. One kill. No witnesses.",
        lore: "The hero called from another world was mistaken for evil. The Assassin knows how that feels.",
        statBonus: { agility: 8, accuracy: 6, defense: -3 },
        abilities: ["Shadowstep", "Lethal Poison", "Execution"],
        color: "#1a252f",
      },
      {
        id: "shadowdancer",
        name: "Shadowdancer",
        description: "Becomes the darkness itself.",
        lore: "There are places between light and shadow. The Shadowdancer lives there.",
        statBonus: { agility: 5, mana: 5, accuracy: 5 },
        abilities: ["Phase Shift", "Mirror Image", "Void Step"],
        color: "#6c3483",
      },
      {
        id: "trickster",
        name: "Trickster",
        description: "Chaos is a tool. Confusion is a weapon.",
        lore: "A hero accused of being an omen of evil learns quickly: perception can be weaponized.",
        statBonus: { agility: 6, accuracy: 4, mana: 4 },
        abilities: ["Smoke Screen", "Decoy", "Blind"],
        color: "#f39c12",
      },
    ],
  },
  {
    id: "ranger",
    name: "Ranger",
    description: "Hunter of the wilds. Never misses. Never forgets.",
    lore: "When the monsters first arrived, the Rangers were already in the forests, learning. They adapted faster than anyone.",
    baseStats: { strength: 6, mana: 5, accuracy: 13, defense: 6, agility: 10 },
    icon: "target",
    color: "#27ae60",
    higherClasses: [
      {
        id: "beastmaster",
        name: "Beastmaster",
        description: "Speaks the language of fangs and claw.",
        lore: "The monsters are beasts from another world. Some beasts can be tamed.",
        statBonus: { strength: 4, agility: 4, mana: 3, accuracy: 3 },
        abilities: ["Beast Bond", "Pack Hunt", "Feral Roar"],
        color: "#784212",
      },
      {
        id: "sniper",
        name: "Sniper",
        description: "A mile away. Already dead.",
        lore: "In a world of chaos, precision is salvation. Every shot is a prayer to no goddess in particular.",
        statBonus: { accuracy: 12, agility: 3, defense: -2 },
        abilities: ["Piercing Shot", "Eagle Eye", "Dead Shot"],
        color: "#1a5276",
      },
      {
        id: "trapper",
        name: "Trapper",
        description: "The battlefield is already set. You just walked in.",
        lore: "Patience is a weapon. The Trapper learned this watching monsters set ambushes of their own.",
        statBonus: { accuracy: 5, defense: 5, agility: 3, mana: 3 },
        abilities: ["Snare Trap", "Explosive Mine", "Net Throw"],
        color: "#6e2f1a",
      },
    ],
  },
  {
    id: "bard",
    name: "Bard",
    description: "Words that cut. Songs that break reality.",
    lore: "The bards say truth has power. In this world of false prophecy, that power is dangerous.",
    baseStats: { strength: 5, mana: 9, accuracy: 8, defense: 6, agility: 9 },
    icon: "music",
    color: "#e91e63",
    higherClasses: [
      {
        id: "bard_of_anarchy",
        name: "Bard of Anarchy",
        description: "Weaponizes narrative. Makes the false true.",
        lore: "The world runs on stories. The Bard of Anarchy knows which stories are lies — and how to use them.",
        uniqueStat: {
          key: "plausibility",
          name: "Plausibility",
          description: "How convincing your narrative is. Higher Plausibility makes your lies become truth.",
        },
        statBonus: { mana: 5, accuracy: 5, agility: 3 },
        abilities: ["Rewrite Fate", "False Prophecy", "Crowd Control"],
        color: "#c0392b",
      },
      {
        id: "minstrel",
        name: "Minstrel",
        description: "Heals through harmony. Inspires through melody.",
        lore: "Even in apocalypse, song endures. The Minstrel carries what memory the world is losing.",
        uniqueStat: {
          key: "resonance",
          name: "Resonance",
          description: "The depth of your melody's power over hearts and minds.",
        },
        statBonus: { mana: 8, defense: 4, agility: 2 },
        abilities: ["Song of Healing", "Ballad of Courage", "Lullaby"],
        color: "#f39c12",
      },
      {
        id: "siren",
        name: "Siren",
        description: "Enchants. Enthralls. Destroys with a smile.",
        lore: "Not all monsters came from another world. Some were always here, humming a lovely tune.",
        uniqueStat: {
          key: "illusion",
          name: "Illusion",
          description: "The veil between what is real and what your targets believe.",
        },
        statBonus: { mana: 7, accuracy: 6, agility: 3 },
        abilities: ["Charm", "Phantom Dance", "Wail of Despair"],
        color: "#9b59b6",
      },
    ],
  },
  {
    id: "monk",
    name: "Monk",
    description: "Body as weapon. Spirit as armor.",
    lore: "The old temples are silent now. Monks carry the training — and the questions their masters never answered.",
    baseStats: { strength: 9, mana: 6, accuracy: 9, defense: 8, agility: 11 },
    icon: "zap",
    color: "#e67e22",
    higherClasses: [
      {
        id: "iron_fist",
        name: "Iron Fist",
        description: "No weapon. No mercy. Just impact.",
        lore: "The Iron Fist school teaches one lesson: everything breaks eventually.",
        uniqueStat: {
          key: "momentum",
          name: "Momentum",
          description: "Built up kinetic force. Each strike makes the next more devastating.",
        },
        statBonus: { strength: 8, agility: 4, mana: -2 },
        abilities: ["Iron Palm", "Tremor Strike", "Shatter"],
        color: "#e74c3c",
      },
      {
        id: "zen_master",
        name: "Zen Master",
        description: "Still water. Unbreakable.",
        lore: "When a world ends, wisdom is the last thing standing. The Zen Master waits.",
        statBonus: { defense: 8, mana: 6, agility: 2 },
        abilities: ["Perfect Guard", "Counterflow", "Inner Peace"],
        color: "#48c9b0",
      },
      {
        id: "void_walker",
        name: "Void Walker",
        description: "Exists between strikes. Between heartbeats.",
        lore: "The rift between worlds left holes in reality. The Void Walker learned to step through them.",
        uniqueStat: {
          key: "void",
          name: "Void",
          description: "Connection to the space between realms. Allows phasing through attacks.",
        },
        statBonus: { agility: 8, mana: 5, strength: 3 },
        abilities: ["Phase Punch", "Void Step", "Reality Tear"],
        color: "#2c3e50",
      },
    ],
  },
  {
    id: "cleric",
    name: "Cleric",
    description: "Servant of divine light — but which goddess?",
    lore: "Clerics pray to a goddess who, it turns out, may have orchestrated everything. Their faith is complicated.",
    baseStats: { strength: 5, mana: 12, accuracy: 7, defense: 9, agility: 5 },
    icon: "sun",
    color: "#f1c40f",
    higherClasses: [
      {
        id: "high_priest",
        name: "High Priest",
        description: "Conduit of divine power. For better or worse.",
        lore: "The High Priest channels the goddess directly. They still aren't sure what she's using them for.",
        uniqueStat: {
          key: "divinity",
          name: "Divinity",
          description: "Connection to divine will. The closer you are, the more power — and the more doubt.",
        },
        statBonus: { mana: 10, defense: 5, accuracy: 3 },
        abilities: ["Mass Heal", "Divine Wrath", "Blessing"],
        color: "#f9e4b7",
      },
      {
        id: "inquisitor",
        name: "Inquisitor",
        description: "Hunts heresy. Defines it too.",
        lore: "The Inquisitor was sent to find the cursed outsider — the hero called from another world. Then things got complicated.",
        statBonus: { strength: 5, mana: 5, accuracy: 8 },
        abilities: ["Purge", "Brand of Heresy", "Trial by Fire"],
        color: "#e74c3c",
      },
      {
        id: "plague_doctor",
        name: "Plague Doctor",
        description: "Studies death to prevent — or cause — it.",
        lore: "When monsters brought new diseases, the Plague Doctor learned the medicines. And then the poisons.",
        uniqueStat: {
          key: "toxicity",
          name: "Toxicity",
          description: "Mastery of blight and cure. The line between medicine and poison is choice.",
        },
        statBonus: { mana: 8, accuracy: 6, defense: 2 },
        abilities: ["Miasma", "Anesthetic", "Lethal Remedy"],
        color: "#1a7a6e",
      },
    ],
  },
  {
    id: "alchemist",
    name: "Alchemist",
    description: "Transforms matter. Transforms the battlefield.",
    lore: "Alchemists were ridiculed before the monsters came. Now their bottles are worth more than prayers.",
    baseStats: { strength: 5, mana: 10, accuracy: 10, defense: 6, agility: 7 },
    icon: "droplet",
    color: "#1abc9c",
    higherClasses: [
      {
        id: "artificer",
        name: "Artificer",
        description: "Builds what others only dream of.",
        lore: "The Artificer asked: why rely on magic that answers to a goddess? Build your own.",
        statBonus: { mana: 6, accuracy: 6, defense: 4 },
        abilities: ["Deploy Turret", "Overclock", "Construct Golem"],
        color: "#7fb3d3",
      },
      {
        id: "poison_master",
        name: "Poison Master",
        description: "Every substance is lethal. Dosage is art.",
        lore: "The monsters have biology unlike anything of this world. The Poison Master mapped it.",
        uniqueStat: {
          key: "toxicity",
          name: "Toxicity",
          description: "Mastery of venoms and corrosives. Stack effects for devastating results.",
        },
        statBonus: { accuracy: 8, agility: 5, mana: 3 },
        abilities: ["Venom Splash", "Toxic Cloud", "Paralytic Dart"],
        color: "#1abc9c",
      },
      {
        id: "transmuter",
        name: "Transmuter",
        description: "Reshapes reality — one element at a time.",
        lore: "The barrier between worlds is thinning. The Transmuter uses this as a workshop.",
        uniqueStat: {
          key: "entropy",
          name: "Entropy",
          description: "Controlled chaos. Higher entropy means greater transformation power — and risk.",
        },
        statBonus: { mana: 9, accuracy: 5, strength: 2 },
        abilities: ["Transmute", "Elemental Shift", "Disintegrate"],
        color: "#a569bd",
      },
    ],
  },
  {
    id: "shaman",
    name: "Shaman",
    description: "Speaks to spirits the living cannot see.",
    lore: "The monsters come from another world — a world that also has shamans. Two shamans, two worlds, same spirits.",
    baseStats: { strength: 6, mana: 11, accuracy: 8, defense: 7, agility: 8 },
    icon: "cloud-lightning",
    color: "#16a085",
    higherClasses: [
      {
        id: "storm_caller",
        name: "Storm Caller",
        description: "The sky answers.",
        lore: "The sky doesn't care about prophecy. The Storm Caller found that liberating.",
        statBonus: { mana: 8, accuracy: 6, strength: 2 },
        abilities: ["Call Lightning", "Thunder Clap", "Storm Eye"],
        color: "#3498db",
      },
      {
        id: "spirit_walker",
        name: "Spirit Walker",
        description: "Between worlds. Between death.",
        lore: "The rift didn't just let monsters through. Spirits walk freer now. The Spirit Walker guides them.",
        uniqueStat: {
          key: "harmony",
          name: "Harmony",
          description: "Alignment with the spirit world. Higher harmony amplifies spirit powers.",
        },
        statBonus: { mana: 7, agility: 5, defense: 4 },
        abilities: ["Spirit Bond", "Ghost Walk", "Ancestral Wrath"],
        color: "#76d7c4",
      },
      {
        id: "hex_doctor",
        name: "Hex Doctor",
        description: "Curses that cannot be undone.",
        lore: "Not all wounds are physical. The Hex Doctor learned from the monsters — they curse in languages no one else spoke.",
        statBonus: { mana: 9, accuracy: 5, agility: 2 },
        abilities: ["Hex", "Voodoo Doll", "Curse of Weakness"],
        color: "#6c3483",
      },
    ],
  },
  {
    id: "summoner",
    name: "Summoner",
    description: "Commands legions. Never fights alone.",
    lore: "If monsters can come from another world, so can allies. The Summoner opened different doors.",
    baseStats: { strength: 4, mana: 13, accuracy: 7, defense: 6, agility: 7 },
    icon: "users",
    color: "#9b59b6",
    higherClasses: [
      {
        id: "necrolord",
        name: "Necrolord",
        description: "The fallen fight on.",
        lore: "Every monster the world kills could become a soldier. The Necrolord understood this first.",
        uniqueStat: {
          key: "corruption",
          name: "Corruption",
          description: "Depth of death magic wielded. The more corrupted, the more powerful — and the more dangerous.",
        },
        statBonus: { mana: 10, defense: 3, strength: 3 },
        abilities: ["Undead Army", "Death Grasp", "Soul Link"],
        color: "#1c2833",
      },
      {
        id: "beast_lord",
        name: "Beast Lord",
        description: "Apex predator of a broken world.",
        lore: "The monsters have hierarchies. The Beast Lord learned to climb them.",
        uniqueStat: {
          key: "bond",
          name: "Bond",
          description: "Depth of connection with summoned beasts. Bond determines their obedience and power.",
        },
        statBonus: { strength: 5, mana: 7, agility: 4 },
        abilities: ["Pack Leader", "Wild Stampede", "Alpha Bond"],
        color: "#784212",
      },
      {
        id: "phantom_weaver",
        name: "Phantom Weaver",
        description: "Calls what was never alive.",
        lore: "Between worlds, there are things that were never born. The Phantom Weaver gives them purpose.",
        statBonus: { mana: 11, accuracy: 5, agility: -1 },
        abilities: ["Phantom Army", "Weave Reality", "Astral Projection"],
        color: "#7f8c8d",
      },
    ],
  },
  {
    id: "duelist",
    name: "Duelist",
    description: "One on one. Always wins.",
    lore: "Honor died with the old world. The Duelist kept the technique.",
    baseStats: { strength: 10, mana: 5, accuracy: 12, defense: 7, agility: 10 },
    icon: "activity",
    color: "#e74c3c",
    higherClasses: [
      {
        id: "blade_saint",
        name: "Blade Saint",
        description: "The sword is a prayer. Every strike is devotion.",
        lore: "Not to the goddess — the Blade Saint decided that long ago. Devotion to the blade itself.",
        statBonus: { strength: 7, accuracy: 6, agility: 2 },
        abilities: ["Sacred Slash", "Blade Dance", "Parry God"],
        color: "#f0b429",
      },
      {
        id: "fencer",
        name: "Fencer",
        description: "Style is substance.",
        lore: "A monster that's confused is already defeated. The Fencer learned this from the monsters themselves.",
        uniqueStat: {
          key: "momentum",
          name: "Momentum",
          description: "Flowing combat energy. Momentum builds as you chain attacks.",
        },
        statBonus: { agility: 8, accuracy: 7, defense: -1 },
        abilities: ["Riposte", "Fleche", "En Garde"],
        color: "#85929e",
      },
      {
        id: "blood_knight",
        name: "Blood Knight",
        description: "Drinks power from wounds — yours and theirs.",
        lore: "Pain feeds the Blood Knight. Turns out this world has plenty.",
        statBonus: { strength: 9, agility: 4, defense: 2 },
        abilities: ["Blood Drain", "Crimson Tide", "Pain Surge"],
        color: "#922b21",
      },
    ],
  },
  {
    id: "seer",
    name: "Seer",
    description: "Reads fate. Sometimes rewrites it.",
    lore: "The prophecy said a hero from another world would bring ruin. The Seer is beginning to think prophecies are written, not discovered.",
    baseStats: { strength: 4, mana: 12, accuracy: 10, defense: 5, agility: 9 },
    icon: "eye",
    color: "#8e44ad",
    higherClasses: [
      {
        id: "oracle",
        name: "Oracle",
        description: "Sees all timelines. Chooses the worst one for enemies.",
        lore: "The Oracle saw the goddess's plan. Seeing it was the easy part.",
        uniqueStat: {
          key: "fate",
          name: "Fate",
          description: "Threads of destiny under your control. Manipulate probability itself.",
        },
        statBonus: { mana: 9, accuracy: 7, agility: 2 },
        abilities: ["Foresight", "Paradox", "Unravel Fate"],
        color: "#a569bd",
      },
      {
        id: "prophet",
        name: "Prophet",
        description: "Speaks truth into existence.",
        lore: "There was a prophecy. The Prophet chose not to believe it — and started writing their own.",
        uniqueStat: {
          key: "resonance",
          name: "Resonance",
          description: "How deeply your words echo through the world's fabric.",
        },
        statBonus: { mana: 10, defense: 5, accuracy: 3 },
        abilities: ["Divine Word", "Revelation", "Prophecy of Doom"],
        color: "#f0b429",
      },
      {
        id: "dream_walker",
        name: "Dream Walker",
        description: "Reality is someone else's dream.",
        lore: "The border between worlds is thin. The Dream Walker found you can step through it while asleep.",
        uniqueStat: {
          key: "illusion",
          name: "Illusion",
          description: "The depth of the dream you cast over others. Stronger illusions become reality.",
        },
        statBonus: { mana: 8, agility: 6, accuracy: 4 },
        abilities: ["Dream Trap", "Nightmare", "Waking World"],
        color: "#2c3e50",
      },
    ],
  },
];

export type StoryChoice = {
  id: string;
  text: string;
  consequence: string;
  nextNodeId: string;
  affectsRelationship?: "ally" | "enemy" | "neutral";
};

export type StoryNode = {
  id: string;
  chapterId: string;
  speakerName?: string;
  speakerRole?: string;
  dialogue: string;
  mood: "neutral" | "tense" | "mysterious" | "combat" | "revelation" | "dark";
  choices?: StoryChoice[];
  nextNodeId?: string;
  isCombat?: boolean;
  isChapterEnd?: boolean;
};

export type Chapter = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  unlocked: boolean;
};

export const CHAPTERS: Chapter[] = [
  { id: "ch1", number: 1, title: "The Accused", subtitle: "You didn't ask to be summoned.", unlocked: true },
  { id: "ch2", number: 2, title: "The Cursed Land", subtitle: "A world that fears you.", unlocked: false },
  { id: "ch3", number: 3, title: "The Mother's Tear", subtitle: "The other side of the war.", unlocked: false },
  { id: "ch4", number: 4, title: "Beneath the Seal", subtitle: "The goddess has a plan.", unlocked: false },
  { id: "ch5", number: 5, title: "Two Worlds, One Lie", subtitle: "Everything you were told.", unlocked: false },
];

export const STORY_NODES: StoryNode[] = [
  {
    id: "ch1_start",
    chapterId: "ch1",
    speakerName: "???",
    speakerRole: "Voice in the Dark",
    dialogue: "You open your eyes. The air smells wrong — iron and something older. You are not where you were. You are not sure you are who you were.",
    mood: "mysterious",
    nextNodeId: "ch1_n2",
  },
  {
    id: "ch1_n2",
    chapterId: "ch1",
    speakerName: "Inquisitor Vael",
    speakerRole: "Servant of the Goddess",
    dialogue: "The omen. The one foretold — the bringer of the second flood. We have been waiting. Seize them.",
    mood: "tense",
    choices: [
      { id: "c1a", text: "\"I don't know what you're talking about.\"", consequence: "They don't believe you.", nextNodeId: "ch1_n3a" },
      { id: "c1b", text: "Fight back immediately.", consequence: "Your instincts are sharper than theirs.", nextNodeId: "ch1_n3b", affectsRelationship: "enemy" },
      { id: "c1c", text: "Say nothing. Observe.", consequence: "Silence is its own answer here.", nextNodeId: "ch1_n3c" },
    ],
  },
  {
    id: "ch1_n3a",
    chapterId: "ch1",
    speakerName: "Inquisitor Vael",
    speakerRole: "Servant of the Goddess",
    dialogue: "Of course you don't. The omen never does. The prophecy was clear — an outsider, no blessing, no mark. Only ruin in their wake. Take them to the cells.",
    mood: "dark",
    nextNodeId: "ch1_n4",
  },
  {
    id: "ch1_n3b",
    chapterId: "ch1",
    speakerName: "Narrator",
    speakerRole: "",
    dialogue: "Three guards rush you. You don't know how you know what to do — but your body does. Two are down before you remember you're not a fighter. You are. You are now.",
    mood: "combat",
    isCombat: true,
    nextNodeId: "ch1_n4",
  },
  {
    id: "ch1_n3c",
    chapterId: "ch1",
    speakerName: "Narrator",
    speakerRole: "",
    dialogue: "You say nothing. You watch. A younger soldier meets your eye — something in their expression is not hatred. It is recognition. They look away quickly. Chains are placed on your wrists.",
    mood: "mysterious",
    nextNodeId: "ch1_n4",
  },
  {
    id: "ch1_n4",
    chapterId: "ch1",
    speakerName: "Cell Wall",
    speakerRole: "(carved into stone)",
    dialogue: "The words are scratched deep: 'Goddess smiles upon those who never ask why.' Beneath it, in fresher marks: 'I asked. I know now. Run if you can.'",
    mood: "dark",
    nextNodeId: "ch1_n5",
  },
  {
    id: "ch1_n5",
    chapterId: "ch1",
    speakerName: "The Prisoner",
    speakerRole: "Cell next to yours",
    dialogue: "You survived the summoning. Most omens don't. That means something — I don't know what, but it means something. My name was Elara. I'm a Seer. Or I was. What are you?",
    mood: "mysterious",
    choices: [
      { id: "c5a", text: "\"I'm no one. I just want to go home.\"", consequence: "A truth that matters here.", nextNodeId: "ch1_n6" },
      { id: "c5b", text: "\"Someone who wants to understand what's happening.\"", consequence: "Elara nods slowly.", nextNodeId: "ch1_n6", affectsRelationship: "ally" },
      { id: "c5c", text: "\"Whatever I need to be.\"", consequence: "Elara is quiet for a long moment.", nextNodeId: "ch1_n6" },
    ],
  },
  {
    id: "ch1_n6",
    chapterId: "ch1",
    speakerName: "Elara",
    speakerRole: "Imprisoned Seer",
    dialogue: "There's a crack in the eastern wall. Tonight, the guards change at the third bell. The prophecy they follow — I wrote part of it. I was wrong about the omen. I don't think I was wrong about the goddess.",
    mood: "revelation",
    isChapterEnd: true,
  },
];
