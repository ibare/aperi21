/**
 * stern-gerlach 개념 선언.
 *
 * 자기 갈림 둘 가운데 **빔 쪽**이다.
 *   stern-gerlach  자리가 고르지 않은 자기장이 **중성 원자 빔**을 지나가게 하고, 닿은 자리가
 *                  띠가 아니라 **두 점**이라는 것 — 답이 몇 개냐를 묻는다
 *   zeeman-effect  **고른** 자기장 속에 원자를 그대로 두고, 그 원자가 내는 **빛의 선**이 셋이
 *                  된다는 것 — 준위가 갈리는 것을 색으로 읽는다
 * 이쪽만 가마 · 빔 · 스크린 · 예상한 띠 ↔ 실제 두 점의 어휘를 갖는다. 스펙트럼 · 준위 · 파장은
 * 여기 없고, 저쪽에는 날아가는 원자와 닿은 자리가 없다.
 * 이미 선언된 `spin` 을 가리키지 않는다 — 다른 묶음이 쓰는 중이라 내용으로만 갈라 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const sternGerlachConcept: Aperi21ConceptSource = {
  id: 'stern-gerlach',
  label: 'A Beam Split into Two Spots by an Uneven Magnetic Field',
  canonicalSim: 'aperi21:stern-gerlach',

  surface: {
    definition:
      'What a beam of neutral atoms does in a magnetic field that is stronger at one end: instead of smearing into a continuous band, it arrives on the screen as two separate spots.',
    exemplarKeywords: [
      'the Stern-Gerlach experiment',
      'a silver atom beam',
      'an inhomogeneous magnetic field',
      'space quantization',
      'why did the beam split into two',
      'a smear was expected but two marks appeared',
      'only two orientations are allowed',
      'sorting atoms by a magnet',
      'the classical prediction failed',
      'a measurement with only two possible answers',
      'deflection up or down and nothing between',
    ],
  },

  briefing: {
    observable: [
      'Seen from the side: an oven at the left, two magnet pieces facing each other with a gap between them, and a screen at the far right. A second, face-on plate stands beside the screen at the same heights, so a horizontal line carries a path across to where it lands.',
      'The first run is the guess. Each atom leaves the oven carrying a small needle, and every needle points a different way. Inside the gap the atoms curve, outside it they run straight, and how far each one bends follows how much of its needle points upward.',
      'Those paths open out into a fan, and on the face-on plate hollow rings appear scattered evenly from the top of the fan to the bottom, filling in a tall band.',
      'The band and the fan then draw back into a faint trace, and a name for them appears beside the plate.',
      'The second run is what really happens. The atoms carry no needles now, and in the gap every one of them bends either up or down and by the same amount, so the paths make a two-pronged fork rather than a fan.',
      'On the plate, filled dots pile up only at the very top and the very bottom of the faint band — the two heights the fork reaches.',
      'When they have all landed, an up mark and a down mark appear beside the two clumps. Across the middle of the faint band, where most of the hollow rings had been, there is not one filled dot.',
      'The two clumps are not always the same size; from one run to the next one of them has a few more dots than the other.',
      'The guessed atoms and the real ones are told apart by shape alone — a needle and a hollow ring for the first, a bare dot and a filled mark for the second.',
      'Nothing is ruled, counted or numbered; what is read is a band against two clumps.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The guessed run and the real run follow one another on their own and the round repeats.',
        'Both runs land on one and the same plate rather than on two plates set side by side, and the first is kept as a faint trace while the second lands, so that "only the two ends of what was expected" is one thing to look at.',
        'The bend of a guessed atom is set by how its needle lies, so the fan is the direct consequence of needles pointing every which way rather than a separately drawn prediction.',
        'The real atoms carry no needle at all, because drawing one before the magnet would say the atom was already pointing that way.',
        'The needles of the guessed atoms do not turn as they fly, since what decides the bend does not change along the way.',
        'The directions of the guessed needles are spread deliberately rather than drawn at random, because a few clumps of them would read as a patchy band instead of an even one.',
        'Which way each real atom goes is settled separately for each one, which is why the two clumps come out slightly uneven.',
        'The split on the plate is drawn far larger than it is in the apparatus, since at the true ratio the two clumps would be one dot.',
        'Everything is in a single ink colour, with the apparatus and the writing in grey, so nothing is told apart by colour.',
        'It opens partway through the first run, with the needled atoms in flight and the band half filled.',
      ],
    },

    useWhen: [
      'The article has set out what one would expect of little magnets pointing every which way and needs the expectation to fail in front of the reader. The even band is actually filled in first and then only its two ends receive anything.',
      'The point is that "two values and nothing between" is a result rather than a rule laid down in advance. Nothing about the atoms is marked as up or down until after they have landed.',
      'The article needs the gap in the middle to carry weight. The centre of the band, which is where most of the guessed atoms went, stays completely bare.',
      'The reader should see that the answer does not come out the same every time in every respect: the two clumps differ a little in size from one run to the next even though their positions never move.',
    ],

    avoidWhen: [
      'The subject is passing one of the two outgoing beams through a second magnet, or what repeated measurements along different directions give. Each atom here goes through the field once and lands.',
      'The point is a charged particle curving because it is moving through a field. These atoms are neutral and are pushed because the field is stronger at one end than the other.',
      'The subject is separating a beam by mass or by charge, or identifying what a sample is made of from where things land.',
      'The article is about spectral lines, energy levels, or light given off by an atom. No light and no levels appear here.',
      'The point is what a measurement leaves the system in afterwards, or that reading it again gives the same answer.',
      'The figures wanted are the size of the magnetic moment, the steepness of the field, or how many atoms went each way. Nothing is numbered.',
    ],

    contrastWith: [
      {
        concept: 'zeeman-effect',
        note: 'One sends atoms through a field that changes from place to place and reads the answer off where they land; the other leaves atoms sitting in an even field and reads the answer off the light they give out.',
      },
      {
        concept: 'charged-particle-in-magnetic-field',
        note: 'One is about neutral atoms pushed because a field is uneven; the other about charged particles bent because they are moving through a field at all.',
      },
      {
        concept: 'mass-spectrometer',
        note: 'Both sort a beam into places on a detector, but one sorts a mixture by what each piece weighs, while the other finds that a single property of one kind of atom has only two values.',
      },
      {
        concept: 'magnetic-dipole',
        note: 'One treats the way a small magnet lies in a field as freely adjustable and works out the turning effect and energy that follow; the other finds that the way it lies is not free at all.',
      },
      {
        concept: 'measurement-collapse',
        note: 'One is about how many different answers a measurement can possibly give; the other about what the measurement does to the thing measured once an answer has been given.',
      },
      {
        concept: 'spin',
        note: 'One settles how many answers a measurement of this property can give and stops there; the other takes the two answers as settled and finds that having one of them is not a direction the particle carries about with it.',
      },
    ],
  },
};
