/**
 * WORM-3 Level Definitions
 * Progressive topology pedagogy from basic rotations to full RP² mastery
 */

export const LEVELS = [
  {
    id: 1,
    name: 'Baby Cube',
    description: 'Learn basic rotations',
    cubeSize: 2,
    chaosLevel: 0,
    mode: 'classic', // 'classic' | 'sudokube' | 'ultimate'
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
      title: 'Welcome to WORM³',
      text: 'Let\'s start simple! This 2×2 cube has 6 faces with 4 stickers each. Drag on the cube to rotate slices, or use WASD keys.',
      tip: 'Each face should be one solid color when solved.',
    },
    winCondition: 'classic', // Match all face colors
    winMessage: 'You solved your first cube! Ready to explore the manifold?',
    cutsceneText: 'Learn the cube.',
  },
  {
    id: 2,
    name: 'Twin Paradox',
    description: 'Discover antipodal pairs',
    cubeSize: 2,
    chaosLevel: 0,
    mode: 'classic',
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
      title: 'The Antipodal Secret',
      text: 'Every sticker has a TWIN on the opposite side! Press T to see the wormhole tunnels connecting them. In topology, these pairs are identified — they\'re the SAME point!',
      tip: 'Hover over stickers to see their antipodal twin glow.',
    },
    winCondition: 'classic',
    winMessage: 'You\'ve discovered antipodality! Opposites are ONE on this manifold.',
    cutsceneText: 'Opposites are ONE.',
  },
  {
    id: 3,
    name: 'Flip Gateway',
    description: 'Master the antipodal flip',
    cubeSize: 3,
    chaosLevel: 0,
    mode: 'classic',
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
      title: 'The Flip Mechanic',
      text: 'Click any sticker to FLIP it with its antipodal twin! This is a ℤ₂ action — the fundamental symmetry of projective space. Both stickers swap colors simultaneously.',
      tip: 'Use flips strategically — they affect BOTH twins at once!',
    },
    winCondition: 'classic',
    winMessage: 'You\'ve mastered the flip! This is the heart of RP² topology.',
    cutsceneText: 'Flip the manifold.',
  },
  {
    id: 4,
    name: 'Chaos Ripple',
    description: 'Survive the instability',
    cubeSize: 3,
    chaosLevel: 1,
    mode: 'classic',
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
      title: 'Chaos Awakens',
      text: 'The manifold is unstable! Flipped stickers can trigger chain reactions through their antipodal connections. Watch the entropy meter — high values mean incoming chaos waves!',
      tip: 'Solve quickly before chaos spreads!',
    },
    winCondition: 'classic',
    winMessage: 'You survived the chaos! Instability is just another seam to navigate.',
    cutsceneText: 'Chaos spreads...',
  },
  {
    id: 5,
    name: 'Parity Gate',
    description: 'Understand orientation',
    cubeSize: 3,
    chaosLevel: 1,
    mode: 'classic',
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
      title: 'The Parity Problem',
      text: 'On a non-orientable surface, paths can reverse your handedness! EVEN parity (cyan glow) = solvable normally. ODD parity (purple) = you\'ve crossed a "seam" and need special algorithms.',
      tip: 'The sledgehammer (R\' F R F\') fixes parity issues.',
    },
    winCondition: 'classic',
    winMessage: 'Parity mastered! You can now detect orientation reversals.',
    cutsceneText: 'Untwist the quotient.',
  },
  {
    id: 6,
    name: 'Manifold Axes',
    description: 'Explore projective planes',
    cubeSize: 4,
    chaosLevel: 2,
    mode: 'classic',
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
      title: 'Three Projective Planes',
      text: 'Press X to EXPLODE the cube! See how the 3 manifold axes work: Z-axis (Red-Orange), X-axis (Blue-Green), Y-axis (White-Yellow). Each axis defines an RP² slice through the cube.',
      tip: 'Explode view reveals the wormhole network structure.',
    },
    winCondition: 'classic',
    winMessage: 'You\'ve mapped the manifold axes! The projective structure is clear.',
    cutsceneText: 'Navigate RP² axes.',
  },
  {
    id: 7,
    name: 'Sudokube Veil',
    description: 'Numbers meet topology',
    cubeSize: 4,
    chaosLevel: 2,
    mode: 'sudokube', // NEW: Sudokube mode
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
      title: 'Sudoku on a Manifold',
      text: 'Colors become numbers! Each face must contain digits 1-9 (or 1-16 for 4×4) with no repeats in any row or column. The antipodal constraint still applies — twin stickers share fate!',
      tip: 'Press V to toggle between color and number views.',
    },
    winCondition: 'sudokube',
    winMessage: 'Sudokube solved! Latin squares on non-orientable surfaces — impressive!',
    cutsceneText: 'Numbers on the manifold.',
  },
  {
    id: 8,
    name: 'Ultimate Seam',
    description: 'Dual constraints collide',
    cubeSize: 4,
    chaosLevel: 3,
    mode: 'ultimate', // NEW: Ultimate mode (colors + sudoku)
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
      title: 'The Ultimate Challenge',
      text: 'Colors AND numbers must both be correct! This is the full RP² puzzle — solve the Rubik\'s cube AND the Sudoku simultaneously. Chaos waves affect both constraints.',
      tip: 'Focus on one constraint first, then adjust for the other.',
    },
    winCondition: 'ultimate',
    winMessage: 'ULTIMATE victory! You\'ve mastered dual-constraint topology!',
    cutsceneText: 'Dual symmetries collide.',
  },
  {
    id: 9,
    name: 'Quotient Collapse',
    description: 'Full RP² mastery',
    cubeSize: 5,
    chaosLevel: 3,
    mode: 'ultimate',
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
      title: 'The Quotient Space',
      text: 'Press N for the NET view — see the cube unfolded with all antipodal connections. This is ℂⁿ/ℤ₂ = RP^{n-1} in action. High chaos, 5×5 complexity, all features unlocked. You\'re ready for the Singularity!',
      tip: 'k* = 0.721 — Detect the symmetry breaks!',
    },
    winCondition: 'ultimate',
    winMessage: 'QUOTIENT MASTERED! You understand the manifold. The Singularity awaits...',
    cutsceneText: 'Enter the singularity.',
  },
  {
    id: 10,
    name: 'Black Hole',
    description: 'Full antipodal topology',
    cubeSize: 5,
    chaosLevel: 4,
    mode: 'ultimate',
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
      title: 'The Singularity',
      text: 'Maximum chaos. Maximum complexity. All constraints active. This is the full WORM³ experience — survive the black hole and master the manifold!',
      tip: 'May the topology be with you.',
    },
    winCondition: 'ultimate',
    winMessage: 'YOU SURVIVED THE SINGULARITY! True topology master!',
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
