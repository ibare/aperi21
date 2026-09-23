/**
 * star-radiation-gravity-balance 개념 선언.
 *
 * 별의 일생 넷 중 하나. 이쪽만 **왜 제 크기를 지키는가**를 주장한다 — 시간이 흐르지 않는다.
 *   star-radiation-gravity-balance  층마다 **두 화살표가 같다**. 흐트러뜨리면 **되돌아간다**
 *   star-life-cycle                 질량이 가르는 **경로와 빠르기**
 *   stellar-nucleosynthesis         중심에서 **무엇이 만들어지나**
 *   supernova-and-neutron-star      받침을 **잃은** 뒤의 1 초
 * 이쪽만 층 · 맞선 화살표 · 「더 큰 크기에서 다시 멈춘다」 어휘를 갖는다. 원소 · 곡선 ·
 * 충격파 · 나이라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const starRadiationGravityBalanceConcept: Aperi21ConceptSource = {
  id: 'star-radiation-gravity-balance',
  label: 'Hydrostatic Balance and Its Return in a Star',
  canonicalSim: 'aperi21:star-radiation-gravity-balance',

  surface: {
    definition:
      'Why a star keeps its size: at every layer the inward pull matches the outward push, and upsetting the match makes it expand or contract until the two agree again.',
    exemplarKeywords: [
      'hydrostatic equilibrium in a star',
      'why does a star not collapse under its own weight',
      'radiation pressure against gravity',
      'what holds a star up',
      'the star puffs up when the core burns hotter',
      'a star is a balancing act',
      'self-regulating stellar core',
      'inward pull and outward push in balance',
      'why stars are stable for billions of years',
      'squeeze it and it heats up and pushes back',
    ],
  },

  briefing: {
    observable: [
      'A star is drawn in cross-section, and at six places on it — three on the rim and three on an inner shell — a pair of arrows springs from one and the same point, one aimed at the centre and one aimed outward.',
      'Because both arrows of a pair share a tail, their lengths can be set beside each other without measuring anything, and at rest every pair is dead even.',
      'The inner arrows are shorter than the rim arrows by the same proportion on both sides of each pair, so the evenness is seen to hold at more than one depth.',
      'A disc at the centre grows, and in the same moments every outward arrow lengthens past its partner while the star is still its old size.',
      'The rim then moves out past a dashed ring left at the original size, and as it moves the outward arrows shorten faster than the inward ones until the pairs are even again and the motion stops.',
      'The arrows are drawn at the sizes the forces actually take, so the swollen star ends up with short arrows and the shrunken one with long ones.',
      'The central disc then shrinks, the inward arrows come out longer than their partners, and the rim draws in past the dashed ring until the pairs match once more at a smaller size.',
      'The shading of the star tracks how hot it is inside — the swollen star is paler and the small one deepest — so cooling and heating accompany the change of size.',
      'Only the topmost pair is named, one word at the head of the outward arrow and one alongside the inward one, in the colours of their own arrows.',
      'Restoring the central disc to its first size pushes the rim back out and it stops on the dashed ring, where it began.',
      'The motion is quick while the two arrows differ a lot and slows as they close, and it never overshoots the size where they agree.',
    ],

    screen: {
      affordances: [
        'The raising, the swelling, the cutting, the shrinking and the return run in that order on their own and then begin again.',
        'The picture opens on the balanced star with a moment to take it in before the central disc starts to grow.',
        'No number appears anywhere — not for the central output, not for the size, not for either force — because the claim is a matter of matching lengths.',
        'The second colour carries one meaning, the centre and the push it produces, so the growing disc and the lengthening arrow read as the same event.',
        'The arrow pairs are staggered between rim and inner shell so that the inward arrows of a small star do not tangle near the centre.',
        'Heat is shown as the depth of one shade rather than as a change of hue, so that colour is not asked to say two things at once.',
      ],
    },

    useWhen: [
      'The reader has been told a star is in balance and pictures a lucky coincidence that could fail at any moment. Watching the star pushed out of balance and settle at a new size shows the balance to be something the star recovers.',
      'The article claims that a star swells when its core burns harder, and a picture is needed where the swelling visibly stops rather than running away.',
    ],

    avoidWhen: [
      'The point is what a star becomes over time, or the order of the stages it passes through. Nothing here ages; the star returns to exactly where it started.',
      'The article is about a star that genuinely collapses or is torn apart. Every disturbance here is recovered from, and the picture never shows the recovery failing.',
      'Which nuclei the core is fusing, or why the fusing must end, is the subject. The central output is a handle to turn and no material is named.',
      'The two kinds of outward push are to be told apart, or one of them is being singled out. A single outward arrow stands for the whole of it.',
      'A star that beats or pulses is meant. The size here settles without ever swinging past the point of balance.',
      'Figures are needed — a pressure, a temperature, an output, a radius. Nothing on screen is numbered and no equation appears.',
    ],

    contrastWith: [
      {
        concept: 'star-life-cycle',
        note: 'One asks why a star holds any size at all and returns it to where it began; the other takes the holding for granted and follows the succession of sizes across a whole lifetime.',
      },
      {
        concept: 'supernova-and-neutron-star',
        note: 'Both turn on the same balance — one shows it recovering from every nudge, the other begins at the moment the outward side is gone and there is nothing to recover with.',
      },
      {
        concept: 'equilibrium-of-forces',
        note: 'Both are about opposing influences coming out even, one on a body treated as a single object and one at every depth inside a continuous mass whose size is itself the unknown.',
      },
      {
        concept: 'equilibrium-points',
        note: 'Both distinguish a balance that is merely present from one that pulls itself back, and here the returning is shown by moving the object away and letting it settle.',
      },
    ],
  },
};
