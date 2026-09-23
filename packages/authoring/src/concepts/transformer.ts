/**
 * transformer 개념 선언.
 *
 * 코일 넷 가운데 이쪽은 **「얼마나 — 감은 수의 비가 정한다」** 다.
 *   transformer         철심을 함께 꿰는 선속 → **한 바퀴 몫이 같다** → 비만큼 전압이 달라진다
 *   mutual-inductance   이웃에 전압이 서는 **때**(바뀌는 동안에만)
 *   energy-in-inductor  코일 하나에 쌓이는 **에너지**
 *   ac-generation       그 교류 파형의 **출처**
 * 이쪽만 「감은 수 · 비 · 한 바퀴 몫 · 전압이 오르면 전류가 내린다」 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const transformerConcept: Aperi21ConceptSource = {
  id: 'transformer',
  label: 'Turns Ratio and the Voltage It Sets',
  canonicalSim: 'aperi21:transformer',

  surface: {
    definition:
      'Two coils wound on one iron core are threaded by the same changing flux, so every turn on either side earns the same voltage and the output swing is the input’s scaled by the ratio of the turn counts.',
    exemplarKeywords: [
      'transformer',
      'turns ratio',
      'stepping a voltage up and stepping it down',
      'why more turns on the second coil gives a higher voltage',
      'V2 over V1 equals N2 over N1',
      'two windings sharing one iron core',
      'the current goes down when the voltage goes up',
      'power line voltage conversion',
      'primary and secondary windings',
      'counting turns to set the output',
      'a charger that brings the mains down to a few volts',
    ],
  },

  briefing: {
    observable: [
      'A rectangular iron core stands on the left with a coil wound on each upright, the left one fed from an alternating supply and the right one feeding a load; to the right sit two recording strips, one above the other on a shared time axis and, crucially, on the same voltage scale.',
      'Faint horizontal rules cross both strips at one spacing, and that spacing is the voltage earned by a single turn — so a peak can be read as a count of rules rather than as a measurement.',
      'With two turns on the left and four on the right, a pen writes both waves at once: the upper peak reaches the second rule and the lower peak the fourth, matching the turns that can be counted on each coil.',
      'Arrows on the top and bottom limbs of the core swell, shrink and reverse with the flux going round it, and a dotted path inside the core shows the way it runs.',
      'An arrow for the current on each side sits over the upper connecting wire, and while the output voltage is the higher one the output current arrow is visibly the shorter — about half the length of the input’s.',
      'The right-hand winding is then faded away and replaced by a single turn, its label changing to match, while the left-hand coil, the supply and the flux arrows are left exactly as they were.',
      'A new record is written: the upper peak reaches the same second rule as before, while the lower peak only reaches the first — below the input rather than above it.',
      'With the output voltage now the lower one, the output current arrow becomes about twice the length of the input’s, filling most of the wire it sits on.',
      'The two waves are drawn in the same ink and told apart by the names on their axes; the only figures anywhere are the two turn counts, which change when the winding is changed.',
    ],

    screen: {
      affordances: [
        'Nothing is offered to wind or set; the two arrangements are shown one after the other and begin again, and the reader arrives with more than a cycle of the first arrangement already recorded.',
        'The left-hand side is held fixed across both arrangements, so the only thing that could account for the change in the output is the count of turns on the right.',
        'The horizontal rules are there to be counted rather than to decorate, and no voltage figure is attached to them, which keeps the question at how many turns’ worth rather than how many volts.',
        'The change of winding is made in two moves, the old turns and old label fading before the new label arrives, so the two counts are never legible on top of one another.',
        'The flux is drawn only inside the core, with no stray lines outside it, so the two coils are seen to share one and the same thing.',
        'The whole thing runs far slower than a real supply and does not say so, since the ratio does not depend on how fast it swings.',
      ],
    },

    useWhen: [
      'The article has given the turns ratio as a formula and the reader takes it as a rule with no reason behind it. The rules spaced one turn’s worth apart let the peak be counted off against the turns that can be counted on the coil, which is where the ratio comes from.',
      'The prose needs the reader to see that raising the voltage is not getting something for nothing — the shortening and lengthening of the current arrow puts the cost on screen alongside the gain.',
      'A piece explains why a supply is carried at one voltage and used at another, and needs the device that makes the change to be more than a black box with a ratio written on it.',
    ],

    avoidWhen: [
      'The article is about whether a neighbouring coil responds at all, or about why a steady current induces nothing. The supply here alternates throughout and the response is never in question.',
      'The subject is losses, heating, eddy currents or why a real transformer falls short of its ratio. Everything here is drawn as though nothing escapes the core.',
      'The point is that a transformer will not work on a steady supply. Only an alternating supply is ever shown and no steady case is offered for comparison.',
      'What is wanted is values — volts in and volts out, a current in amps, or a power calculation. Only the two turn counts are written, and the strips are gradated in turns rather than in volts.',
      'The article turns on the timing between the flux and the voltage, or on the quarter-cycle by which they differ. That offset is present on the screen but is never what any part of it is about.',
      'The subject is a coil being tapped or the ratio being changed while running. The winding is swapped between two fixed arrangements and nothing is adjustable.',
    ],

    contrastWith: [
      {
        concept: 'mutual-inductance',
        note: 'One asks only whether and when a coil that is not wired to another responds at all; the other assumes the response and asks what fixes its size, which is the count of turns on each side.',
      },
      {
        concept: 'ac-generation',
        note: 'Both depend on a flux that keeps changing, but one makes that flux by turning a coil in a fixed field, while the other starts from an alternating supply and only rescales the swing it already has.',
      },
      {
        concept: 'energy-in-inductor',
        note: 'One follows the amount a single coil banks and returns; the other never weighs anything, and treats the coils purely as a pair of counts that set a ratio.',
      },
      {
        concept: 'mechanical-advantage',
        note: 'Both are trades in which one quantity is multiplied and its partner divided by the same factor so that nothing is gained overall, but one trades force against distance moved and the other voltage against current.',
      },
    ],
  },
};
