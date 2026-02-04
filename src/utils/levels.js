/**
 * WORM-3 Level Definitions
 * Progressive topology pedagogy from basic rotations to full RP² mastery
 * Life journey: Daycare → Elementary → Middle → High → College → Job → NASA → Rocket → Moon → Black Hole
 */

export const LEVELS = [
  {
    id: 1,
    name: 'Baby Cube',
    description: 'Learn basic rotations',
    cubeSize: 2,
    chaosLevel: 0,
    mode: 'classic', // 'classic' | 'sudokube' | 'ultimate'
    background: 'daycare', // Soft pastels, building blocks, safe and cozy
    features: {
      rotations: true,
      tunnels: false,
      flips: false,
      chaos: false,
      explode: false,
      parity: false,
      net: false,
    },
    tutorial: {
      title: 'Welcome to Daycare! 🧒',
      text: 'Let\'s play with blocks! This colorful 2×2 cube has 6 faces. Drag to spin the pieces around!',
      tip: 'Match all the colors on each side. You got this!',
    },
    winCondition: 'classic', // Match all face colors
    winMessage: 'Gold star! ⭐ You solved your first puzzle! Ready for elementary school?',
    cutsceneText: 'Learn the colors.',
  },
  {
    id: 2,
    name: 'Twin Paradox',
    description: 'Discover antipodal pairs',
    cubeSize: 2,
    chaosLevel: 0,
    mode: 'classic',
    background: 'elementary', // Chalkboard green, ABCs, gold stars
    features: {
      rotations: true,
      tunnels: true, // NEW: Wormhole tunnels visible
      flips: false,
      chaos: false,
      explode: false,
      parity: false,
      net: false,
    },
    tutorial: {
      title: 'Elementary School 📚',
      text: 'Time to learn something cool! Every sticker has a TWIN on the opposite side. Press T to see the secret tunnels connecting them!',
      tip: 'Opposites are connected - just like in math class!',
    },
    winCondition: 'classic',
    winMessage: 'A+ work! You discovered that opposites are connected! 📝',
    cutsceneText: 'Opposites are ONE.',
  },
  {
    id: 3,
    name: 'Flip Gateway',
    description: 'Master the antipodal flip',
    cubeSize: 3,
    chaosLevel: 0,
    mode: 'classic',
    background: 'middleschool', // Lockers, notebooks, getting serious
    features: {
      rotations: true,
      tunnels: true,
      flips: true, // NEW: Flip mode enabled
      chaos: false,
      explode: false,
      parity: false,
      net: false,
    },
    tutorial: {
      title: 'Middle School 🎒',
      text: 'Things are getting interesting! Click any sticker to FLIP it with its twin. Both colors swap at once - it\'s like magic... or math!',
      tip: 'Use flips wisely - they change BOTH twins!',
    },
    winCondition: 'classic',
    winMessage: 'You\'re getting smarter! Flipping mastered! 🔄',
    cutsceneText: 'Flip the manifold.',
  },
  {
    id: 4,
    name: 'Chaos Ripple',
    description: 'Survive the instability',
    cubeSize: 3,
    chaosLevel: 1,
    mode: 'classic',
    background: 'highschool', // Chaotic hallways, drama, intensity
    features: {
      rotations: true,
      tunnels: true,
      flips: true,
      chaos: true, // NEW: Chaos mode active
      explode: false,
      parity: false,
      net: false,
    },
    tutorial: {
      title: 'High School 🏫',
      text: 'Welcome to the chaos! Just like high school, things can get WILD. Flipped stickers might trigger chain reactions. Stay calm and solve fast!',
      tip: 'Don\'t panic! Solve before the chaos spreads!',
    },
    winCondition: 'classic',
    winMessage: 'You survived high school! Nothing can stop you now! 🎓',
    cutsceneText: 'Chaos spreads...',
  },
  {
    id: 5,
    name: 'Parity Gate',
    description: 'Understand orientation',
    cubeSize: 3,
    chaosLevel: 1,
    mode: 'classic',
    background: 'college', // Lecture halls, equations, late nights
    features: {
      rotations: true,
      tunnels: true,
      flips: true,
      chaos: true,
      explode: false,
      parity: true, // NEW: Parity indicators visible
      net: false,
    },
    tutorial: {
      title: 'College 🎓',
      text: 'Time for advanced concepts! EVEN parity (cyan) = normal. ODD parity (purple) = you crossed a "seam". This is real topology!',
      tip: 'The sledgehammer algorithm fixes parity issues.',
    },
    winCondition: 'classic',
    winMessage: 'Bachelor\'s degree earned! You understand parity! 📜',
    cutsceneText: 'Untwist the quotient.',
  },
  {
    id: 6,
    name: 'Manifold Axes',
    description: 'Explore projective planes',
    cubeSize: 4,
    chaosLevel: 2,
    mode: 'classic',
    background: 'job', // Office, cubicles, adulting
    features: {
      rotations: true,
      tunnels: true,
      flips: true,
      chaos: true,
      explode: true, // NEW: Explode view available
      parity: true,
      net: false,
    },
    tutorial: {
      title: 'First Job 💼',
      text: 'Welcome to the real world! Press X to EXPLODE the cube and see its internal structure. Time to think in 3D like a professional!',
      tip: 'Explode view reveals how the pieces connect.',
    },
    winCondition: 'classic',
    winMessage: 'Promotion earned! You see the bigger picture now! 📊',
    cutsceneText: 'Navigate RP² axes.',
  },
  {
    id: 7,
    name: 'Sudokube Veil',
    description: 'Numbers meet topology',
    cubeSize: 4,
    chaosLevel: 2,
    mode: 'sudokube', // NEW: Sudokube mode
    background: 'nasa', // Control rooms, screens, science
    features: {
      rotations: true,
      tunnels: true,
      flips: true,
      chaos: true,
      explode: true,
      parity: true,
      net: false,
    },
    tutorial: {
      title: 'NASA Lab 🔬',
      text: 'You made it to NASA! Colors become numbers now. Each face needs digits 1-16 with no repeats in any row or column. It\'s Sudoku in SPACE!',
      tip: 'Press V to toggle between colors and numbers.',
    },
    winCondition: 'sudokube',
    winMessage: 'Mission Specialist certified! Sudoku + Topology = Genius! 🧪',
    cutsceneText: 'Numbers on the manifold.',
  },
  {
    id: 8,
    name: 'Ultimate Seam',
    description: 'Dual constraints collide',
    cubeSize: 4,
    chaosLevel: 3,
    mode: 'ultimate', // NEW: Ultimate mode (colors + sudoku)
    background: 'rocket', // Countdown, flames, liftoff
    features: {
      rotations: true,
      tunnels: true,
      flips: true,
      chaos: true,
      explode: true,
      parity: true,
      net: false,
    },
    tutorial: {
      title: 'Rocket Launch 🚀',
      text: '3... 2... 1... LIFTOFF! Colors AND numbers must BOTH be correct! This is the ultimate challenge. You\'re leaving Earth!',
      tip: 'Focus on one constraint first, then adjust.',
    },
    winCondition: 'ultimate',
    winMessage: 'WE HAVE LIFTOFF! Dual mastery achieved! 🔥',
    cutsceneText: 'Dual symmetries collide.',
  },
  {
    id: 9,
    name: 'Quotient Collapse',
    description: 'Full RP² mastery',
    cubeSize: 5,
    chaosLevel: 3,
    mode: 'ultimate',
    background: 'moon', // Lunar surface, Earth in distance
    features: {
      rotations: true,
      tunnels: true,
      flips: true,
      chaos: true,
      explode: true,
      parity: true,
      net: true, // NEW: Net view available
    },
    tutorial: {
      title: 'The Moon 🌙',
      text: 'One small step for cubes... Press N for the NET view - see everything unfolded! You can see Earth from here. One more challenge awaits...',
      tip: 'The net shows all connections at once.',
    },
    winCondition: 'ultimate',
    winMessage: 'MOONWALK COMPLETE! The stars are calling... 🌍',
    cutsceneText: 'Enter the singularity.',
  },
  {
    id: 10,
    name: 'Black Hole',
    description: 'Full antipodal topology',
    cubeSize: 5,
    chaosLevel: 4,
    mode: 'ultimate',
    background: 'blackhole', // Full singularity, event horizon
    features: {
      rotations: true,
      tunnels: true,
      flips: true,
      chaos: true,
      explode: true,
      parity: true,
      net: true,
    },
    tutorial: {
      title: 'The Singularity 🕳️',
      text: 'Maximum chaos. Maximum complexity. You\'re at the edge of a BLACK HOLE. Everything you\'ve learned leads to this moment. Good luck.',
      tip: 'May the topology be with you.',
    },
    winCondition: 'ultimate',
    winMessage: 'YOU ESCAPED THE SINGULARITY! TOPOLOGY MASTER! 🏆',
    cutsceneText: 'Survive the Singularity.',
    hasCutscene: true, // Special epic cutscene
  },
];

/**
 * Get level by ID
 */
export const getLevel = (id) => LEVELS.find(l => l.id === id);

/**
 * Get next level
 */
export const getNextLevel = (currentId) => LEVELS.find(l => l.id === currentId + 1);

/**
 * Check if level is unlocked based on completed levels
 */
export const isLevelUnlocked = (levelId, completedLevels) => {
  if (levelId === 1) return true; // Level 1 always unlocked
  if (levelId === 10) return true; // Level 10 always unlocked (for now, as demo)
  return completedLevels.includes(levelId - 1); // Previous level must be completed
};

/**
 * Load progress from localStorage
 */
export const loadProgress = () => {
  try {
    const saved = localStorage.getItem('worm3_completed_levels');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

/**
 * Save progress to localStorage
 */
export const saveProgress = (completedLevels) => {
  try {
    localStorage.setItem('worm3_completed_levels', JSON.stringify(completedLevels));
  } catch {
    // Ignore storage errors
  }
};

/**
 * Mark level as completed
 */
export const completeLevel = (levelId) => {
  const completed = loadProgress();
  if (!completed.includes(levelId)) {
    completed.push(levelId);
    saveProgress(completed);
  }
  return completed;
};

/**
 * Get feature unlock description for a level
 */
export const getNewFeatures = (levelId) => {
  const level = getLevel(levelId);
  if (!level || levelId === 1) return [];

  const prevLevel = getLevel(levelId - 1);
  if (!prevLevel) return [];

  const newFeatures = [];
  const features = level.features;
  const prevFeatures = prevLevel.features;

  if (features.tunnels && !prevFeatures.tunnels) newFeatures.push('Wormhole Tunnels (T)');
  if (features.flips && !prevFeatures.flips) newFeatures.push('Antipodal Flip (Click)');
  if (features.chaos && !prevFeatures.chaos) newFeatures.push('Chaos Mode (C)');
  if (features.explode && !prevFeatures.explode) newFeatures.push('Explode View (X)');
  if (features.parity && !prevFeatures.parity) newFeatures.push('Parity Indicators');
  if (features.net && !prevFeatures.net) newFeatures.push('Net View (N)');
  if (level.mode !== prevLevel.mode) {
    if (level.mode === 'sudokube') newFeatures.push('Sudokube Mode');
    if (level.mode === 'ultimate') newFeatures.push('Ultimate Mode');
  }

  return newFeatures;
};
