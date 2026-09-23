/**
 * snells-law 개념 선언.
 *
 * 이 묶음에서 유일하게 **되튀지 않고 건너가는** 빛이다. 거울 여섯과는 그 한 가지로 갈린다.
 *   law-of-reflection  면에서 **돌아 나온다** — 나간 각이 들어온 각과 같다
 *   snells-law         면을 **지나간다** — 나간 각이 들어온 각과 다르고, 얼마나 다른지를 매질이 정한다
 * 이쪽만 매질 · 굴절률 · 법선 쪽으로 꺾임 · 물 → 유리 → 다이아몬드 어휘를 갖는다.
 * 들어오는 각(45°)은 한 주기 내내 움직이지 않는다 — 주장은 **바뀌는 것이 매질 하나**라는 것이다.
 *
 * `total-internal-reflection` 은 뒤늦게 이었다 — 매질을 고정하고 각을 여는 쪽이라 변수가
 * 이 조각과 정확히 맞바뀐다. 파동 묶음(`refraction-of-waves`)은 avoidWhen 으로 되돌린다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const snellsLawConcept: Aperi21ConceptSource = {
  id: 'snells-law',
  label: 'How Much the Medium Bends the Incoming Light',
  canonicalSim: 'aperi21:snells-law',

  surface: {
    definition:
      'How far a beam turns toward the line square to a surface as it crosses into a new material: from one unchanging angle of arrival, water, glass and diamond each bend it by steadily more.',
    exemplarKeywords: [
      'Snell’s law',
      'refraction of light',
      'a straw looks broken in a glass of water',
      'light bends as it enters glass',
      'refractive index',
      'diamond bends light more than glass does',
      'bending toward the normal',
      'a denser material turns the beam further',
      'n1 sin theta1 equals n2 sin theta2',
      'the same beam entering three different materials',
      'why a pool looks shallower than it is',
    ],
  },

  briefing: {
    observable: [
      'A flat boundary runs across the picture with air above it and a shaded material below; a dashed line stands square to the boundary at the point where the light arrives.',
      'A beam comes down from the upper left at forty-five degrees to that dashed line, and below the boundary it carries on at a shallower angle, turned toward the dashed line.',
      'A circle is drawn around the arrival point, and short bars run from the circle to the dashed line — one for the incoming beam, one for the beam below. The incoming bar’s length is carried across as a dashed mark at the height of the lower bar, so the two can be compared without arithmetic.',
      'On the right a short stack names the materials with their index beside each. Only the one in force is written boldly; the others are faint.',
      'While the picture is still, the turned angle is written beside the dashed line: thirty-two point one for water.',
      'The material below then changes to glass. The incoming beam does not stir at all — only the beam below swings further toward the dashed line, its bar shortens against the dashed mark, and the reading becomes twenty-eight point one.',
      'The material changes again to diamond and the beam below swings further still, to seventeen point zero, with its bar now less than half the dashed mark.',
      'Each beam that is left behind stays on as a faint dashed line, so by the last setting three lower beams are spread like a fan from the one arrival point.',
      'The figure beside the dashed line disappears whenever the beam is swinging and returns once it has settled; the picture then goes back to water and the round begins again.',
    ],

    screen: {
      affordances: [
        'The material below changes in two steps, holds at each, and resets, over and over, with nothing to press.',
        'The incoming beam is fixed for the whole round, which leaves the material as the one thing that can account for the change below.',
        'The bars and the carried-across dashed mark are ruled to the same circle, so how much shorter the lower bar has become is read directly as how much further the beam has turned.',
        'Every beam that has already been shown stays as a faint dashed line, so the last setting holds all three side by side in one picture.',
        'The three materials are shaded alike, and it is the names and the indices on the right that tell them apart rather than colour.',
        'The figures written are the arrival angle, the three indices and the three turned angles, and they appear only while the beam is at rest.',
        'The screen opens with the beam already bent into water.',
      ],
    },

    useWhen: [
      'The article has given the reader the refraction formula and the reader can work it but cannot see it. Here the arrival angle is nailed down and only the material moves, so what the index does is the only thing left on screen to look at.',
      'The point being made is that some materials bend light more than others — that diamond is extreme and water mild — and the article wants a comparison rather than three separate numbers. The three beams end up fanned out from one arrival point.',
      'The reader has been told that light bends toward the line square to the surface when it enters a denser material and would like to see what "toward" buys them across a range of materials.',
    ],

    avoidWhen: [
      'The article explains refraction by what happens to the wave — crests slowing and the front swinging round. Nothing wavelike is drawn here; there is one beam and it changes direction at the boundary.',
      'The light in the article is leaving a dense material for a thinner one, or the subject is the angle past which none of it gets out. Every beam here goes from air inward and none is turned back.',
      'The subject is reflection — light returning from the surface at a matching angle. Only the light that carries on across the boundary is drawn.',
      'The article is about colours parting company, a prism or a rainbow. One beam of one colour is shown and each material bends it by a single amount.',
      'The point is that a submerged object looks shallower or displaced. There is nothing in the material below — no object, no eye, and no image.',
      'Arrival angles other than forty-five are wanted, or the speed of light in each material, or a reading while the beam is swinging. Only the three settled turns are written.',
    ],

    contrastWith: [
      {
        concept: 'law-of-reflection',
        note: 'One has light cross a surface and leave at an angle the new material decides; the other has light come back from a surface at the angle it arrived, which nothing about the surface can alter.',
      },
      {
        concept: 'rectilinear-propagation',
        note: 'One has light go dead straight from end to end in a single medium; the other has it go straight within each of two and change direction only at the face between them.',
      },
      {
        concept: 'convex-mirror',
        note: 'Both turn a beam away from the path it arrived on, but one does it at the boundary between two materials, and the other by the shape of a surface the light never enters.',
      },
      {
        concept: 'total-internal-reflection',
        note: 'One holds the angle of arrival fixed and changes the material, so light always crosses and only how much it turns is at issue; the other holds the materials fixed and opens the angle, reaching a point past which nothing crosses at all and the bending has no answer left to give.',
      },
      {
        concept: 'thin-lens',
        note: 'One takes a single flat boundary and asks how far one beam turns as it crosses; the other stacks two curved boundaries and asks what they do together to a whole family of beams leaving one point, taking the turning at each face for granted and never naming it.',
      },
    ],
  },
};
