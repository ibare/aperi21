/**
 * transverse-wave 개념 선언.
 *
 * 「파동이 무엇인가」 넷 중 하나이자 `longitudinal-wave` 의 짝. 이쪽만 **각**을 주장한다.
 *   transverse-wave   흔들림 자취가 세로선 · 마루 자취가 가로선 — **직각**
 *   longitudinal-wave 흔들림과 나아감이 같은 축 — 빽빽한 띠가 절로 생긴다
 * 둘은 「매질은 제자리」 를 함께 보이므로 definition 에서 그 말을 주어로 쓰지 않는다.
 * 이쪽 주어는 **두 자취가 이루는 각**, 저쪽 주어는 **몰림**이다.
 *
 * `wavefront-and-ray` 도 직각을 말한다 — 저쪽 직각은 **같은 위상의 면과 진행선** 사이이고
 * 이쪽 직각은 **매질의 흔들림과 진행** 사이다. avoidWhen 과 contrastWith 로 갈랐다.
 *
 * 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const transverseWaveConcept: Aperi21ConceptSource = {
  id: 'transverse-wave',
  label: 'Transverse Wave — Shaking Across the Travel',
  canonicalSim: 'aperi21:transverse-wave',

  surface: {
    definition:
      'A wave in which each part of the medium is confined to a line lying square across the direction of advance, so that the shaking and the travelling stand at right angles to one another.',
    exemplarKeywords: [
      'transverse wave',
      'perpendicular to the direction of travel',
      'waves on a string',
      'it goes up and down while the wave goes sideways',
      'light is a transverse wave',
      'which way does the medium move in a wave',
      'shaking across the line of travel',
      'a crest running along a rope',
      'right angle between vibration and propagation',
      'S waves in an earthquake',
    ],
  },

  briefing: {
    observable: [
      'A rope strung with many beads waves to the right, and three of the beads are marked out and followed.',
      'Each marked bead draws the path it has actually taken since the round began, and because its horizontal place never changes, that path grows as a vertical line and nothing else.',
      'One crest is marked and followed in the same way, and because a crest is always at the same height, its path grows as a horizontal line.',
      'The horizontal path runs at crest height straight through the tops of the three vertical ones.',
      'At each place where the crest’s path crosses a bead’s path, a small right-angle corner appears and stays — the squareness is a shape at a crossing rather than a word.',
      'The two paths are drawn at the same weight and the same darkness, so the only thing telling them apart is which way they run.',
      'In the holding part of the round the two paths sit side by side while the beads keep bobbing on their own vertical lines, and then the paths fade and regrow from short vertical stubs as the next round begins.',
      'Nothing is measured here — no dimension line, no value for how long, how high or how fast.',
      'Only the marked beads and the followed crest are picked out; the rest of the rope and its beads are drawn plainly.',
    ],

    screen: {
      affordances: [
        'The round runs by itself — the crest crosses the rope, the paths are held side by side, they fade, and the drawing starts over; nothing has to be pressed.',
        'The paths are sampled from the real positions rather than ruled in beforehand, which is why they grow as short stubs at the start of each round and why they can be read as evidence.',
        'The right-angle corners are placed where a crest meets a bead, so they arrive one after another as the crest crosses rather than all at once.',
        'The paths are laid under the rope, so the rope and its beads are seen passing over them.',
        'No direction is named in words anywhere on the picture; the one line of text says what is happening at that moment.',
      ],
    },

    useWhen: [
      'The article has said that in this kind of wave the vibration is perpendicular to the propagation, and the reader has taken it as a definition to memorise. Two paths crossing at a corner, drawn by the motion itself, is what makes the perpendicularity something seen.',
      'The reader needs the two motions separated before a second kind of wave can be set beside it, and the vertical path against the horizontal one gives the pair of directions cleanly, with no quantity in the way.',
    ],

    avoidWhen: [
      'The article is about sound, about air being squeezed, or about a wave whose medium moves along the travel. Nothing here crowds together, and the claim would be borrowed for its opposite.',
      'Wavelength, period, amplitude or speed are at issue. Nothing on the picture is measured, and the one thing being compared is a pair of directions.',
      'The claim to be carried is that a wave delivers energy while the medium stays put. There is nothing at the far end of this rope to receive anything.',
      'The right angle in the article is between a surface of equal phase and the line along which the wave advances. That angle lives on a map of the wave, not in the motion of the medium, and the rope here has no fronts drawn on it.',
      'Two waves meet in the article. One wave runs along this rope and nothing is added to it.',
    ],

    contrastWith: [
      {
        concept: 'longitudinal-wave',
        note: 'The two sort waves by one question — does the medium move across the travel or along it — and give the opposite answers, which is why they read as a pair rather than as a repetition.',
      },
      {
        concept: 'wave-basics',
        note: 'One answers which way; the other answers how long and how quickly. A wave has both answers at once and neither can be got from the other.',
      },
      {
        concept: 'wave-vs-particle-transport',
        note: 'Both rest on the medium going nowhere, but one uses it to fix a direction and the other uses it to ask what did travel instead.',
      },
      {
        concept: 'wavefront-and-ray',
        note: 'Both end at a right angle, between different pairs — here between the medium’s motion and the wave’s advance, there between a surface of equal phase and the line the wave runs along, which is geometry on a map rather than motion of matter.',
      },
      {
        concept: 'standing-wave',
        note: 'One sorts waves by which way the medium moves relative to the travel; the other asks whether the shape travels at all, which can be asked of either sort and is answered by what two opposite waves make together.',
      },
    ],
  },
};
