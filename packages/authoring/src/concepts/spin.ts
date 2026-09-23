/**
 * spin 개념 선언.
 *
 * 원자 다섯 곁의 **스핀 자체** 다. 주장은 「고전 대응물이 없다」 이고,
 * 화면이 그것을 세우는 방법은 **이어 재기** 다 —
 *   z 로 걸러 ↑ 만 남긴 것을 다시 z 로 재면 모두 ↑,
 *   그러나 가운데서 한 번 x 를 재고 나면 마지막 z 에서 ↓ 가 반이나 되살아난다.
 * 한 벡터라면 걸러 둔 z 성분이 다른 축을 잰다고 사라질 수 없다 — 그래서 고전 각운동량이 아니다.
 * `pauli-exclusion` 은 스핀이 두 값이라는 것을 **전제로 쓰고**, 이쪽은 그 두 값을 **이어 재서** 다툰다.
 * 이쪽만 「거른 뒤 다시 재기 · 가운데 축을 바꾸기 · 지워진 정보 · 되살아난 ↓」 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const spinConcept: Aperi21ConceptSource = {
  id: 'spin',
  label: 'Spin and Sequential Measurement',
  canonicalSim: 'aperi21:spin',

  surface: {
    definition:
      'Why spin is not the angular momentum of anything turning: atoms filtered to spin up along one axis give spin up again on that axis, yet measuring a crosswise axis in between brings spin down back half the time.',
    exemplarKeywords: [
      'spin',
      'spin is not a spinning ball',
      'sequential spin measurements',
      'measuring x destroys what you knew about z',
      'incompatible measurements',
      'why does spin have no classical counterpart',
      'filtering a beam and measuring again',
      'spin up and spin down along an axis',
      'intrinsic angular momentum',
      'repeating a measurement on the same axis gives the same answer',
      'the earlier result comes back at random',
    ],
  },

  briefing: {
    observable: [
      'A source at the left sends a steady file of particles into a chain of three boxes drawn in a line.',
      'Each box has one way in and two ways out, one leading upward and one downward, and the axis it measures is written on it with a marking beside each of its exits.',
      'The first box\'s lower exit is stopped by a bar, so only what leaves by its upper exit goes on — the file entering the rest of the chain has been filtered.',
      'At the far right stand catch bins, all the same size, which fill from the bottom with a neat line of dots, one dot per particle, so the length of a line counts what arrived.',
      'In the first run all three boxes measure the same axis. Every particle that reaches the second and third boxes leaves by the upper exit, and the upper bin fills with a long line of dots while both lower bins stay completely empty.',
      'The dots are then cleared, the middle box\'s axis changes to a crosswise one, and its exit markings change with it.',
      'In the second run the middle box splits the file in two: half go out the way that leads down into a bin of their own, and half carry on into the last box.',
      'That last box, still measuring the original axis, splits what reaches it in two again, and the bin that stood empty all through the first run now fills with a line of dots exactly as long as the one beside it.',
      'Nothing about the first or the last box was altered between the two runs — only the middle one.',
      'The dots are then cleared, the middle box goes back to its original axis, and the whole thing runs again.',
      'No probabilities, percentages or counts are written; how often something happens is read off the length of a line of dots.',
      'The particles carry no marker of their own — nothing about a particle says which way it will go until it comes out of an exit.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The two runs happen one after the other on a fixed round and repeat.',
        'One chain is used for both runs, with only the middle box changed, so the difference between the two outcomes has exactly one thing it can be laid at the door of.',
        'The last box is present in the first run too, although it does nothing there, which is what makes the empty bin in that run into a promise that the second run breaks.',
        'How often is shown as the length of a line of dots in bins that are all the same size, so two outcomes being equally common is read by laying one length against another.',
        'The numbers that come out of each box are arranged so the split really is exact every time round, and not merely close on average, since the claim is made in words about halves.',
        'The boxes are drawn as plain boxes with their exits marked rather than as magnets with paths bending inside them, because what is at issue is the sequence of measurements and not the mechanism of any one of them.',
        'The crosswise measurement\'s two exits are drawn up and down like the others and told apart by their markings, following the usual schematic convention.',
        'No arrow or direction is drawn on the particles themselves, since showing one would suggest they were already pointing somewhere before being measured.',
        'The dots of the first run are cleared before the second begins, so that the line of dots in the formerly empty bin cannot be mistaken for something left over.',
        'It opens partway through the first run, with particles already going down the chain and the upper bin filling.',
      ],
    },

    useWhen: [
      'The article has said that spin has no classical counterpart and the reader wants to know what rules the ordinary picture out. A property already filtered for comes back undecided after an unrelated measurement.',
      'The point is that measuring is not merely finding out. Nothing was done to the first or last box, yet inserting one measurement in the middle changes what the last one finds.',
      'The article needs it established first that repeating the same measurement is reliable, so that the later failure is startling rather than looking like sloppiness. The first run sends every particle out the same exit, twice over.',
      'The reader should see that what comes back comes back in equal shares rather than in some remembered proportion. The formerly empty bin ends with a line of dots the same length as its neighbour.',
    ],

    avoidWhen: [
      'The subject is a single measurement splitting a beam in two, the magnet that does it, or the marks such a beam leaves on a screen. The boxes here are schematic and never show what happens inside them.',
      'The point is that two electrons in a level must have opposite spins, or how many may occupy a state.',
      'The article is about the magnitude of spin, half-integer values, the factor for a magnetic moment, or spin as a source of magnetism in a material.',
      'The subject is an object rotating, its angular momentum, or how that is conserved. Nothing here turns.',
      'The article needs probabilities as figures, an angle between the axes, or a formula for how the chance depends on it. The axes shown are at right angles and nothing is numbered.',
      'The point is a state made of two parts at once, the way such a state shows itself, or a distribution built up by repeated readings of one prepared state.',
      'The subject is two particles whose results are tied to one another, or correlations between separated measurements. There is one file of particles through one chain.',
    ],

    contrastWith: [
      {
        concept: 'pauli-exclusion',
        note: 'One needs no more of spin than that it has two settings and goes on to ration seats with it; the other puts those two settings to the test and finds that having one of them is not something a particle simply carries.',
      },
      {
        concept: 'measurement-collapse',
        note: 'Both turn on what a measurement does to what is measured, but one shows that an immediate repeat agrees, while the other shows that a crosswise measurement slipped in between destroys the agreement.',
      },
      {
        concept: 'uncertainty-principle',
        note: 'One is about two quantities that cannot both be sharp, stated for place and motion along a continuum; the other makes the same incompatibility out of two axes of a property that has only two values apiece.',
      },
      {
        concept: 'superposition-quantum',
        note: 'One asks what a state made of two at once amounts to; the other never names such a state and argues instead from what a sequence of filters and measurements actually yields.',
      },
      {
        concept: 'angular-momentum',
        note: 'One is the turning of a body, built from how its mass is laid out and how fast it goes round; the other keeps the name but has nothing turning, and behaves in a way no such quantity could.',
      },
      {
        concept: 'magnetic-dipole',
        note: 'One is a small magnet with a definite direction that can be turned and lined up; the other is what a particle has instead of that, and it is not found pointing anywhere until an axis is chosen and measured.',
      },
      {
        concept: 'stern-gerlach',
        note: 'One needs only that a measurement along an axis has two answers and goes on to ask what a measurement on a crosswise axis does to that answer; the other is where the count of two is established in the first place, for a property expected to take any value at all.',
      },
    ],
  },
};
