/**
 * decay-types 개념 선언.
 *
 * 붕괴 넷 가운데 **무엇이 나오느냐** 쪽이다.
 *   radioactive-decay   얼마나 빨리 줄어드는가 — 반감기마다 남은 것의 절반
 *   decay-types         나온 셋이 **무엇에서 멈추는가** — 종이가 α, 알루미늄이 β, 납은 γ 를
 *                       줄일 뿐 일부는 뚫는다
 *   radiometric-dating  남은 비율로 시간을 역산한다
 *   nuclear-fission     맞아서 갈라지는 한 번의 사건
 * 이쪽만 세 줄 · 벽 셋 · 투과 · 멈춘 자리 어휘를 갖는다. 반감기 곡선 · 남은 수 · 붕괴 방정식 ·
 * 자기장 속 휨은 여기 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const decayTypesConcept: Aperi21ConceptSource = {
  id: 'decay-types',
  label: 'Alpha, Beta and Gamma Against Three Barriers',
  canonicalSim: 'aperi21:decay-types',

  surface: {
    definition:
      'How the three kinds of radiation from one source differ in what brings them to a halt: paper stops alpha, a few millimetres of aluminium stop beta, and centimetres of lead only thin gamma out.',
    exemplarKeywords: [
      'alpha beta and gamma radiation',
      'penetrating power',
      'stopped by paper, aluminium or lead',
      'shielding against radiation',
      'which radiation gets through',
      'how thick does the shielding need to be',
      'gamma is reduced but not stopped',
      'range of alpha particles',
      'the three kinds compared',
      'radiation protection',
      'what a few millimetres of metal will stop',
    ],
  },

  briefing: {
    observable: [
      'A block at the left spans three lanes, and each lane carries a stream travelling to the right: large slow dots with short tails in one, small fast dots with long tails in another, short wave packets going fastest in the third. Each stream has its name at its head.',
      'To begin with there is nothing in the way and all three reach the right-hand edge.',
      'A thin sheet is set across the lanes. From then on the large dots arriving at it stop just in front, leave a highlight ring and fade where they stopped. The ones already past it keep going, so the lane beyond the sheet gradually empties.',
      'The small dots and the wave packets pass the sheet without a pause.',
      'A second barrier is set in, thicker and named with a thickness in millimetres. The small dots come to a halt inside it, and not all at the same depth — each one goes a little further or less far than the next.',
      'Beyond that barrier its lane empties in the same way.',
      'A third barrier is set in, named with a thickness in centimetres. Most of the wave packets are taken up at scattered depths inside it, each leaving a highlight ring, but a few come out the other side and go on.',
      'The barriers stay once set, so at the end all three stand together with one lane stopped at each.',
      'The lane beyond the third barrier is not empty but sparse: there are many packets in front of it and only one or two behind.',
      'The barriers then fade away and the round begins again with all three lanes clear.',
      'The three kinds are told apart by their names, by size, by being a dot or a wave, and by the length of their tails; all are in the one ink colour.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The barriers are set in one after another on their own and the round repeats.',
        'The three are put in lanes of their own rather than mixed into one beam, since mixed they could not be told apart once one had stopped; a single block spanning all three lanes keeps them plainly from one source.',
        'The highlight means one thing, a place where something was stopped, and marks the halting of each kind.',
        'What each barrier is made of and how thick it is are written out, because a sheet of paper and two centimetres of lead cannot be drawn at one scale.',
        'The stage with only the first barrier is given time enough for the lane beyond it to empty, so that "these no longer get through" is something that happens rather than something asserted.',
        'Stopped particles fade where they stopped rather than piling up or being wiped out, so halting does not read as vanishing.',
        'How deep each of the small dots gets into the second barrier is varied, since a range is a spread rather than one depth.',
        'What says "most but not all" for the third barrier is the number of packets crowding in front of it against the number going on behind, with no proportion written anywhere.',
        'The speeds are drawn slowed down; only their order, from the large dots up to the packets, is meant to be read.',
        'It opens with the lanes already full and nothing yet in the way.',
      ],
    },

    useWhen: [
      'The article has named the three and the reader needs a reason to care which is which. Each is brought down by a different thickness of a different everyday material.',
      'The point is that the third is reduced rather than stopped. A few packets come through the thickest barrier while the others are taken up inside it.',
      'The reader needs stopping to be about depth rather than about a barrier merely being present: the small dots come to rest inside the metal and at different depths.',
      'The article is about shielding as a practical matter, and the reader should see the same source handled three different ways by three ordinary materials.',
    ],

    avoidWhen: [
      'The subject is how fast a source runs down, how much is left, or how long it lasts.',
      'The article turns on what each kind actually is — a helium nucleus, an electron, a photon — or on writing the equation for what the nucleus becomes.',
      'The point is separating the three by bending them in a magnetic or electric field according to their charge. Everything here goes straight.',
      'The figures wanted are transmitted fractions, attenuation coefficients, half-value thicknesses, or a dose.',
      'The subject is a heavy nucleus broken in two, or neutrons released by one.',
      'The article is about reading a counter or a detector and what its readings mean.',
    ],

    contrastWith: [
      {
        concept: 'radioactive-decay',
        note: 'One is about how quickly a source runs down without ever saying what leaves it; the other is only about what leaves and how far it gets.',
      },
      {
        concept: 'radiometric-dating',
        note: 'One uses what is emitted to sort out three kinds of radiation; the other uses how much of the parent is left to sort out how long it has been.',
      },
      {
        concept: 'nuclear-structure',
        note: 'One is about what a nucleus holds and what that makes it called; the other about what has already left one and what will stop it.',
      },
      {
        concept: 'light-through-materials',
        note: 'Both are about something being taken up on its way through matter, but one turns on visible light and what a material looks like, the other on three kinds of radiation and the thickness that ends each.',
      },
      {
        concept: 'charged-particle-in-magnetic-field',
        note: 'One separates things by how a field curves their paths; the other separates them by what thickness of ordinary matter brings them to a stop.',
      },
    ],
  },
};
