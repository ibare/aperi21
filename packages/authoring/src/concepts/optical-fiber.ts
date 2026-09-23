/**
 * optical-fiber 개념 선언.
 *
 * 전반사 셋 가운데 **여러 되튐과 휨의 한계**를 다루는 쪽이다.
 *   optical-fiber              문턱을 정해 두고 휜 길 위 되튐마다 대 본다 — 급히 휘면 한 번이 못 미쳐 샌다
 *   total-internal-reflection  경계면 하나에서 각을 돌려 문턱을 찾는다 (형제)
 *   mirage                     경계면 없이 층 기울기로 휜다 (형제)
 * 이쪽만 코어 · 클래딩 · 되튐 · 휨의 급함 · 샘 어휘를 갖는다. 각을 돌리는 일도, 되돌아오는 빛의
 * 몫도 쓰지 않는다 — 화면의 줄기는 하나이고 밝기는 주장이 아니다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const opticalFiberConcept: Aperi21ConceptSource = {
  id: 'optical-fiber',
  label: 'Why a Bent Fiber Keeps Its Light, and Where It Loses It',
  canonicalSim: 'aperi21:optical-fiber',

  surface: {
    definition:
      'How light stays inside a bent glass thread: one fixed escape angle is tested at every bounce off the core wall, cleared all along a gentle curve and missed where the curve is sharp.',
    exemplarKeywords: [
      'optical fibre',
      'fibre optic cable',
      'how does a signal travel down a glass thread',
      'core and cladding',
      'bending a fibre too tightly makes it leak',
      'light guided round a corner',
      'bend radius loss',
      'the light guide in an endoscope',
      'light zigzags along the inside of a thread',
      'why the light does not escape through the side of the fibre',
    ],
  },

  briefing: {
    observable: [
      'A thick curved thread runs across the picture: an inner strip is named the core with its index beside it, and the band around it is named the cladding with a slightly smaller index.',
      'A single dark ray enters at one end with an arrowhead at its front and travels along, striking the core wall and turning back each time; a small ring is left at every place it struck.',
      'Below the thread a fan opens from one point. Each bounce adds a line to that fan at the true angle it met the wall, the newest line drawn boldly and the earlier ones faintly; nothing is stretched to make the differences bigger.',
      'A highlighted line across the fan marks the escape angle, with the figure written at its end, and a shaded band lies between that line and the wall direction. Every line the gentle curve produces falls inside that band.',
      'The ray reaches the far end of the thread and leaves through it, and the words below say that it arrived without leaking once.',
      'The light is then cleared and the thread itself is bent much more sharply, the curve tightening while nothing is travelling inside it.',
      'The same ray is sent in again at the same place and in the same direction. Along the straight run it bounces as before, and the fan lines again fall inside the band.',
      'At the tight bend one bounce puts its line outside the band, on the far side of the highlighted escape line. There the ray does not turn back: it crosses the core wall, passes through the cladding and carries on straight out of the thread, with an arrow marking it going away.',
      'The thread is then eased back to the gentle curve and the round begins again, so the same light is shown held and lost under two bends.',
    ],

    screen: {
      affordances: [
        'The bend tightens and relaxes on its own, over and over, with nothing to press.',
        'The place, direction and run-up of the entering light are the same in both bends, which leaves the tightness of the curve as the only thing that can account for the leak.',
        'The fan carries the angles at their true size, so a line lying inside or outside the band is the whole of the test and no number has to be compared.',
        'The ring on the wall and the bold line in the fan mark the same bounce, which ties the place along the thread to the reading below it.',
        'Light is taken away while the thread is changing shape, since a path drawn through a shape that is still moving would be a path through no particular fiber.',
        'Only the escape angle is written as a figure; the angle of each bounce is left as a position in the fan.',
        'The thread is drawn far thicker, and its curve far tighter, than any real one, so that the bounces are far enough apart to be counted.',
        'The screen opens with the light already past the straight run and entering the gentle curve.',
      ],
    },

    useWhen: [
      'The article has said that fibres work by total reflection and the reader takes that as a guarantee. Watching one bounce at the tight bend fall short, and the light walk straight out through the cladding, turns the guarantee into a condition.',
      'The reader is being told that a cable must not be kinked or bent past some radius, and has no idea why a curve should matter to light at all. Here the same thread under two bends gives the reason as a change in how squarely the light meets its wall.',
      'The article wants the two indices of core and cladding to mean something rather than be quoted. They are what sets the single highlighted line that every bounce is judged against.',
    ],

    avoidWhen: [
      'The subject is finding the threshold angle itself, or how the share of light divides between going out and coming back as the angle is varied. One angle is fixed here, and the ray is either turned back whole or lost whole.',
      'The point is that light bends gradually in air whose density changes with height. Everything here happens at a wall between two glasses.',
      'The article is about how far a signal can travel, how much it dims over kilometres, or how much information the fibre carries. Nothing here fades with distance and nothing is being sent.',
      'The subject is colour, since different colours travel differently in glass. One colourless ray is drawn and it is treated as a single thing throughout.',
      'The article is about light being collected or focused by a lens, or about an image being carried. There is no image here, only one ray and the wall it keeps meeting.',
      'The reader is meant to set the bend or choose where the light enters. The two bends and the single entry point run by themselves.',
    ],

    contrastWith: [
      {
        concept: 'total-internal-reflection',
        note: 'One asks at what angle light stops escaping across a single face; the other takes that angle as settled and asks whether a path that bends can keep satisfying it, bounce after bounce.',
      },
      {
        concept: 'snells-law',
        note: 'One is about the light that crosses into a new material and how far it turns; the other is about a design in which crossing is exactly what must never happen, so the light that matters never leaves the first material.',
      },
      {
        concept: 'mirage',
        note: 'Both bring light round a curve, but one does it with a wall it keeps rebounding from, and the other with no wall at all, the path curving because the air itself changes from one height to the next.',
      },
    ],
  },
};
