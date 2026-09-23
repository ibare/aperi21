/**
 * bohr-model 개념 선언.
 *
 * 원자 다섯 가운데 **전자 하나의 기하와 한 번의 도약** 이다.
 *   hydrogen-spectrum       많은 낙차가 띠의 몇 자리에만 쌓인다 (결과의 모음)
 *   bohr-model              허용된 반지름 1·4·9 와 **건너뜀**, 낙차 하나 = 빛 하나
 *   atomic-orbital          전자는 길을 돌지 않는다 — 잴 때마다 한 자리
 *   pauli-exclusion         자리 나눠 갖기의 규칙
 *   electron-configuration  채우는 순서가 표의 모양이 된다
 * 이쪽만 「궤도 반지름 n² · 사이를 지나가지 않음 · 두 준위의 차만큼의 빛 하나」 어휘를 갖는다.
 * 띠 · 선 목록 · 여러 전자 · 확률 구름은 두지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const bohrModelConcept: Aperi21ConceptSource = {
  id: 'bohr-model',
  label: 'Bohr Model of the Atom',
  canonicalSim: 'aperi21:bohr-model',

  surface: {
    definition:
      'The picture in which an atom\'s electron may circle only on particular orbits, whose sizes go as one, four, nine, and moves between them by jumping, giving out one photon worth the difference.',
    exemplarKeywords: [
      'Bohr model',
      'quantum jump between orbits',
      'allowed orbits of the electron',
      'orbit radius proportional to n squared',
      'quantum leap',
      'why does the electron not spiral into the nucleus',
      'energy level diagram of hydrogen',
      'one photon per transition',
      'emitting light when an electron drops a level',
      'the electron does not pass through the space between orbits',
      'planetary model of the atom',
    ],
  },

  briefing: {
    observable: [
      'A nucleus sits in the middle with three rings drawn around it. Their sizes are not evenly stepped — the second is four times the first across and the third nine times — and each is labelled outside with its number and its size in units of the innermost.',
      'A single electron travels on one of the rings, the outermost to begin with, and it moves more slowly the further out it is. The space between the rings holds nothing at all.',
      'To the left stands a ladder of energies, drawn to scale, with the electron\'s present level marked on it. The top two rungs are close together and the bottom one lies far below them.',
      'When the jump comes, the electron stops advancing. The one on the old ring fades while one on the new ring, at the very same angle around, comes up in its place, with only a dotted line joining the two — nothing slides along it.',
      'At that moment a ring of light spreads from the place where it jumped, and a train of ripples grows out of that same place and travels off to the right.',
      'On the ladder, a thick mark appears spanning the two levels of that jump, and the marker for the electron moves down to the lower one.',
      'The mark on the ladder and the ripples that leave are drawn in the same colour, and once the ripples are clear of the atom a label appears beside them giving an energy and a wavelength.',
      'The second jump goes to the innermost ring. Its mark on the ladder is far longer, the ripples that leave are far more tightly packed, and both are grey rather than coloured, with the word for light beyond the violet.',
      'Once the electron is on the innermost ring nothing further is given out — there is nowhere lower to go — and after a pause the picture fades and starts again with the electron on the outermost ring.',
      'The light always leaves toward the right, whichever jump made it.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The two jumps happen on a fixed round and repeat.',
        'The jump is shown as one electron fading out and another coming up at the same angle on the next ring, never as something travelling between them, so "it does not pass through the space between" is a thing seen rather than a thing said.',
        'The rings are drawn to their true relative sizes, so that one, four and nine are read off the picture and the squaring is available to the eye.',
        'The ladder on the left is drawn true to energy, which is why the first fall is short and the second enormous, and why the two lights they produce are so unlike.',
        'The mark left on the ladder and the light that leaves share one colour, which binds the size of the fall to the light it makes without a word being needed.',
        'The energy and the wavelength on the label are given as stated quantities rather than worked out from the levels on screen, and the label only appears once the light is clear of the atom so it does not sit across the rings.',
        'The second emission is left grey and named as lying beyond the violet, rather than being given a colour it has no business having.',
        'Only two jumps are made, both downward, so the picture stays about one jump making one light rather than becoming a survey of every transition.',
        'The electron circles more slowly on the outer rings, and the ripples of the two emissions differ in how tightly packed they are — the second far more so than the first.',
        'It opens with the electron already circling the outermost ring, shortly before the first jump.',
      ],
    },

    useWhen: [
      'The article has said that an atom\'s electron may only be in certain places and the reader needs that made concrete. Three rings are drawn at their true relative sizes and nothing exists between them.',
      'The point is that the change of level is a jump and not a journey. The electron is never anywhere in between; it goes out on one ring and comes up on the next at the same angle.',
      'The article needs one fall tied to one emission. Each jump produces exactly one train of ripples, and the mark it leaves on the energy ladder is the same colour as that light.',
      'The reader should see why a small fall and a large fall give such different light. The second jump\'s drop on the ladder is far longer, and what leaves is far more tightly packed and no longer visible.',
    ],

    avoidWhen: [
      'The subject is many atoms, a spectrum built up over time, or why light collects at only certain places on a wavelength band. There is one electron here and two jumps.',
      'The point is that the electron has no path at all, or that its place is a distribution rather than a ring. The rings here are drawn as paths and the electron travels along them.',
      'The article is about absorbing light and being raised to a higher level. Only falls are shown; the return to the outer ring is not presented as caused by anything.',
      'The subject is how electrons of an atom with many of them share out the levels, or the order in which shells fill.',
      'The article needs the spacing of a ladder of levels for a particle in a well, or energies in some other pattern than an atom\'s.',
      'The point turns on the model\'s own shortcomings, on angular momentum coming in whole units, or on why a circling charge should radiate. None of that is on screen.',
    ],

    contrastWith: [
      {
        concept: 'hydrogen-spectrum',
        note: 'One follows a single electron through a single jump and shows where the allowed places are; the other lets many falls happen and asks what they add up to on a band of wavelengths.',
      },
      {
        concept: 'atomic-orbital',
        note: 'One keeps the electron on a definite path of a definite radius, which is exactly what the other denies — there the electron has no path, only a place found afresh at each measurement.',
      },
      {
        concept: 'de-broglie-wavelength',
        note: 'One takes the allowed orbits as given and asks what happens when the electron moves between them; the other offers a reason why only certain orbits should be allowed in the first place.',
      },
      {
        concept: 'particle-in-a-box',
        note: 'Both have a ladder of permitted energies, but one is about walls deciding which shapes fit, while the other is about circular orbits around a nucleus and the light released in moving between them.',
      },
      {
        concept: 'electromagnetic-wave',
        note: 'One is about what makes a single quantity of light and how much it carries; the other is about what light is as it travels, regardless of where it came from.',
      },
    ],
  },
};
