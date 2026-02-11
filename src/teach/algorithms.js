// src/teach/algorithms.js
// Standard cube notation → internal engine rotation mapping and algorithm library
//
// Notation reference (Home Grip orientation):
//   F=PZ(Red)  B=NZ(Orange)  R=PX(Blue)  L=NX(Green)  U=PY(White)  D=NY(Yellow)

import { namedMoveToRotation, expandMove } from '../game/handsInput.js';

// ---------------------------------------------------------------------------
// Parse a notation string like "R U R' U'" into engine moves
// ---------------------------------------------------------------------------
export function parseAlgorithm(notation, size = 3) {
  const tokens = notation.trim().split(/\s+/);
  const moves = [];

  for (const token of tokens) {
    if (token.endsWith('2')) {
      const expanded = expandMove(token, size);
      for (const rot of expanded) {
        moves.push({ ...rot, notation: token });
      }
    } else {
      const rot = namedMoveToRotation(token, size);
      if (rot) {
        moves.push({ ...rot, notation: token });
      }
    }
  }

  return moves;
}

// ---------------------------------------------------------------------------
// Face name helpers for user-friendly descriptions
// ---------------------------------------------------------------------------
export const FACE_NAMES = {
  'col': { 0: 'Left (L)', last: 'Right (R)' },
  'row': { 0: 'Down (D)', last: 'Up (U)' },
  'depth': { 0: 'Back (B)', last: 'Front (F)' },
};

export function describeMove(move, size = 3) {
  const last = size - 1;
  const axisNames = FACE_NAMES[move.axis];
  const faceName = move.sliceIndex === 0 ? axisNames[0] : move.sliceIndex === last ? axisNames.last : 'Middle';
  const direction = move.dir === 1 ? 'counter-clockwise' : 'clockwise';
  return `Rotate the ${faceName} layer ${direction}`;
}

// ---------------------------------------------------------------------------
// Beginner's Method stages for 3x3
// ---------------------------------------------------------------------------
// Each stage has: name, goal (what it achieves), explanation, and algorithms
// used to handle common cases in that stage.

export const BEGINNER_METHOD_3x3 = {
  name: "Beginner's Method (Layer by Layer)",
  description: "The most common method for learning to solve a Rubik's cube. Build one layer at a time from top to bottom.",
  stages: [
    {
      id: 'white-cross',
      name: 'Step 1: White Cross',
      goal: 'Form a white cross on the top face with edges matching center colors',
      explanation: 'Start by making a plus sign (+) with white edges on the top face. Each white edge must also match the center color of its adjacent side face. This is mostly intuitive — look for white edge pieces and bring them to the top.',
      tips: [
        'Find a white edge piece in the bottom or middle layer',
        'Rotate the bottom/side to align it under its target position',
        'Bring it up to the top face',
        'If an edge is in the top layer but flipped wrong, use: F U\' R U',
      ],
      algorithms: [
        {
          name: 'Edge flip (in top, wrong orientation)',
          notation: "F U' R U",
          when: 'A white edge is on top but the white sticker faces sideways instead of up',
        },
        {
          name: 'Edge from bottom',
          notation: "F2",
          when: 'A white edge is on the bottom directly below its target',
        },
      ],
    },
    {
      id: 'white-corners',
      name: 'Step 2: White Corners',
      goal: 'Complete the entire white face by placing corners correctly',
      explanation: 'Now place the four white corner pieces to complete the top layer. Find a white corner in the bottom layer, position it below where it needs to go, then use the algorithm to insert it.',
      tips: [
        'Find a corner with a white sticker in the bottom layer',
        'Use D moves to position it below its target slot',
        'Apply the insert algorithm (may need 1-3 repetitions)',
        'If the corner is stuck in the top layer in the wrong spot, use the algorithm once to pop it out, then reinsert',
      ],
      algorithms: [
        {
          name: 'Right insert',
          notation: "R' D' R D",
          when: 'Corner is below-right of its target position. Repeat 1-3 times until the corner is correctly placed.',
        },
        {
          name: 'Left insert',
          notation: "L D L' D'",
          when: 'Corner is below-left of its target position. Repeat 1-3 times.',
        },
      ],
    },
    {
      id: 'second-layer',
      name: 'Step 3: Middle Layer Edges',
      goal: 'Solve the middle layer by inserting edge pieces',
      explanation: 'Flip the cube upside down (white on bottom, yellow on top). Now find edge pieces in the top layer that do NOT have yellow on them, and insert them into the middle layer using one of two algorithms.',
      tips: [
        'Hold the cube with white on bottom, yellow on top',
        'Find a non-yellow edge in the top layer',
        'Rotate U to match the edge\'s front color with the front center',
        'Determine if the edge needs to go left or right',
        'Apply the corresponding algorithm',
      ],
      algorithms: [
        {
          name: 'Insert edge RIGHT',
          notation: "U R U' R' U' F' U F",
          when: 'The edge needs to go to the right side of the front face',
        },
        {
          name: 'Insert edge LEFT',
          notation: "U' L' U L U F U' F'",
          when: 'The edge needs to go to the left side of the front face',
        },
      ],
    },
    {
      id: 'yellow-cross',
      name: 'Step 4: Yellow Cross',
      goal: 'Form a yellow cross on the top face',
      explanation: 'With yellow on top, create a cross. You may start with a dot (no edges), an L-shape (two adjacent edges), or a line (two opposite edges). Apply the algorithm to progress: dot → L → line → cross.',
      tips: [
        'Look at the top face for yellow edges',
        'Dot: Apply algorithm once to get an L',
        'L-shape: Hold the L in the back-left corner, apply once to get a line',
        'Line: Hold it horizontal, apply once to get the cross',
      ],
      algorithms: [
        {
          name: 'Yellow cross builder',
          notation: "F R U R' U' F'",
          when: 'Dot → L-shape → Line → Cross. Apply repeatedly (with correct orientation each time)',
        },
      ],
    },
    {
      id: 'yellow-edges',
      name: 'Step 5: Position Yellow Edges',
      goal: 'Move yellow edges so their side colors match the center colors',
      explanation: 'The yellow cross is done, but the side colors of the edges might not match their centers. Rotate the top to get as many matching as possible (at least one pair of adjacent matching edges). Hold the solved edges at the back and left, then apply the algorithm.',
      tips: [
        'Rotate U to find a position where at least 2 edges match',
        'If 2 adjacent edges match: hold them at back and left',
        'If 2 opposite edges match: do the algorithm once, then reposition',
        'If all 4 already match: skip this step!',
      ],
      algorithms: [
        {
          name: 'Cycle 3 edges',
          notation: "R U R' U R U2 R' U",
          when: 'Two adjacent edges are correct (back & left). This cycles the other three.',
        },
      ],
    },
    {
      id: 'yellow-corners-position',
      name: 'Step 6: Position Yellow Corners',
      goal: 'Get all four corners in the right positions (colors may be twisted)',
      explanation: 'Now position the yellow corners so each corner is between the three faces whose colors it contains. The corner colors may not be oriented correctly yet — that\'s the next step. Find one correctly positioned corner and hold it in the front-right. If none are correct, do the algorithm once from any angle.',
      tips: [
        'Check each corner: does it sit between its 3 colors?',
        'One correct corner: hold it front-right, apply algorithm',
        'No correct corners: apply once from any position, then check again',
      ],
      algorithms: [
        {
          name: 'Cycle 3 corners',
          notation: "U R U' L' U R' U' L",
          when: 'One corner is in the correct position (front-right). This cycles the other three.',
        },
      ],
    },
    {
      id: 'yellow-corners-orient',
      name: 'Step 7: Orient Yellow Corners',
      goal: 'Twist the corners so all yellow stickers face up — cube solved!',
      explanation: 'The final step! All corners are in the right spots but may be twisted. Use R\' D\' R D repeatedly on each corner until it\'s oriented, then move to the next corner with U. The cube will look scrambled during this step — trust the process!',
      tips: [
        'Hold the corner to orient in the front-right position',
        'Repeat R\' D\' R D until the yellow sticker faces up (2 or 4 times)',
        'DO NOT rotate the whole cube — only use U to bring the next corner to front-right',
        'The cube looks broken during this step — that\'s normal!',
        'After all corners are done, you may need U turns to align the top layer',
      ],
      algorithms: [
        {
          name: 'Orient corner',
          notation: "R' D' R D",
          when: 'Repeat 2 or 4 times until the front-right corner\'s yellow faces up. Then use U to bring the next unoriented corner to front-right.',
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// All available teaching methods
// ---------------------------------------------------------------------------
export const TEACHING_METHODS = {
  'beginner-3x3': BEGINNER_METHOD_3x3,
};
