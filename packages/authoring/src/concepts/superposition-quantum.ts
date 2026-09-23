/**
 * superposition-quantum 개념 선언.
 *
 * 양자 상태 넷 가운데 **겹침 그 자체**를 주장한다.
 *   wave-function          부호 있는 진폭과 제곱 — 점이 쌓여 분포가 된다
 *   superposition-quantum  둘을 겹친 상태는 **출렁인다** — 「모를 뿐 사실은 하나」 라면 멈춰 있어야 한다
 *   measurement-collapse   재면 한 자리가 나온다
 *   particle-in-a-box      벽이 에너지를 띄엄띄엄하게 만든다
 * 이쪽만 정상 상태의 멈춤 · 위상 어긋남 · 「둘 중 하나였다면」 의 대조 어휘를 갖는다.
 * 이미 선언된 `superposition` 은 매질 속 두 물결이 지나쳐 가는 그림이라 대상이 다르다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const superpositionQuantumConcept: Aperi21ConceptSource = {
  id: 'superposition-quantum',
  label: 'Being Two States at Once',
  canonicalSim: 'aperi21:superposition-quantum',

  surface: {
    definition:
      'What separates a state that is genuinely both of two possibilities from one that is secretly just one of them: half of each makes a distribution that moves, which neither alone can do.',
    exemplarKeywords: [
      'quantum superposition',
      'in two states at once',
      'Schrödinger’s cat',
      'is it not simply that we do not know which',
      'a state made from two states',
      'superposition of two energy levels',
      'the cross term between two components',
      'coherence between components',
      'the phase difference between two parts of a state',
      'a mixture is not the same as a superposition',
      'what does it mean to be in both states',
    ],
  },

  briefing: {
    observable: [
      'Along a single row stand two small boxes, one large box, and a dial.',
      'Each small box holds the distribution belonging to one standing level, numbered, and each of those two distributions stays perfectly still for the whole round.',
      'The dial carries two arrows, one for each level, both turning the same way round. The arrow of the upper level turns four times as fast, and the angle opened between the two is filled in.',
      'The large box holds the state made of both levels in equal share. Its distribution leans to the left and then to the right and back, once every few seconds, without pause.',
      'Beneath the large box a bar runs from a centre mark out to wherever the balance point of the distribution presently lies, so the lean is read as a length to one side or the other.',
      'At the start the large box stands back faintly and the two small ones and the dial are in front; then the large box comes forward and its movement is what is watched.',
      'A dashed curve afterwards rises inside the large box: the distribution one would get if the state were only ever one level or the other, share unknown. It is symmetric about the centre and it does not move at all.',
      'The solid distribution keeps swinging above and below that dashed curve, so the two are plainly not the same thing.',
      'The two arrows lie together when the distribution is at one extreme of its swing and point opposite ways when it is at the other.',
      'The dashed curve is then withdrawn, the large box fades back, and the round begins again.',
      'No quantities are written anywhere besides the numbers naming the two levels, and there is no energy scale.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The round moves through the single levels, the combined state, and the comparison on its own.',
        'The two single levels are kept on screen throughout and never move, which is what stops the movement of the combined state being read as "the phase is turning" — a single level has a turning phase too and holds perfectly still.',
        'The dashed curve is brought in only after the movement has been watched for a while, so the reader first sees the thing and then is asked what the alternative account would look like.',
        'The dashed curve and the moving distribution are drawn in the same box and on the same scale, so one can be seen crossing over and under the other rather than being compared from memory.',
        'The dial makes the cause available: the swing follows how far apart the two arrows have drifted, not how fast either one turns.',
        'The two arrows are told apart by their speed and by the level numbers at their tips rather than by colour, since they belong to one and the same state.',
        'The colour set aside for the lean is used only for the balance bar and its point.',
        'The swinging keeps its own time throughout, so it never jumps when the round comes back to the beginning.',
        'It opens with the combined distribution already in mid-swing.',
      ],
    },

    useWhen: [
      'The article has said a system is in two states at once and the reader\'s first objection is that it must really be in one and we simply do not know which. That exact alternative is drawn as the dashed curve, and it fails to move.',
      'The point is that the effect belongs to both components being present together rather than to either of them. The single levels are on screen beside the combination, stubbornly still.',
      'The article needs a mixture and a superposition to be distinguishable rather than a matter of interpretation. The distinction here is whether something moves.',
      'The reader should see where the movement comes from. The two parts of the state drift apart in phase at a steady rate, and the swing follows that drift.',
    ],

    avoidWhen: [
      'The subject is measuring such a state, what result comes out, or what the state is afterwards. Nothing is measured here and no result is ever taken.',
      'The article is about results or landings accumulating into a distribution. No individual outcomes are marked.',
      'The point turns on why the levels are spaced as they are, on the energy of a level, or on what confinement does. The level numbers appear but no energies are drawn.',
      'The subject is two waves crossing on a string or on water and passing through one another.',
      'The article is about entanglement, about two separated particles, or about qubits and quantum computing. One particle in one box is drawn.',
      'The figures wanted are the shares of the two components, the rate of the swing, or the position of the balance point. Nothing but the level numbers is written.',
    ],

    contrastWith: [
      {
        concept: 'superposition',
        note: 'One is two waves meeting in a medium, adding where they overlap and each carrying on unchanged; the other is one particle whose single state is a sum of two, where the difference from "one or the other, unknown" is the entire claim.',
      },
      {
        concept: 'measurement-collapse',
        note: 'One is about what such a state is while untouched; the other is about what measuring does to it, and each is silent on the other question.',
      },
      {
        concept: 'particle-in-a-box',
        note: 'One takes the levels of a confined particle for granted and combines two of them; the other is about why those levels exist and how far apart they sit.',
      },
      {
        concept: 'wave-function',
        note: 'One asks how a fixed state is read as a distribution, sign and all; the other asks what a state built from two states does that neither could do alone.',
      },
      {
        concept: 'beats',
        note: 'Both are a slow rhythm born of two rates that differ, but one is a loudness rising and falling in a medium while the other is where a single particle is likely to be, sliding back and forth.',
      },
    ],
  },
};
