/**
 * pair-production 개념 선언.
 *
 * 형제는 `compton-scattering` 이다. 둘 다 광자 하나가 날아와 무언가와 만나지만,
 *   compton-scattering  광자가 **살아남아** 파장이 늘어난다 — 각이 주장이다
 *   pair-production     광자가 **사라지고** 두 입자가 생긴다 — 문턱이 주장이다
 * 이쪽만 문턱 · 쌍 · 양전자 · 휘는 궤적 어휘를 갖는다. 양전자가 나중에 사라지는 것은
 * 이 조각의 몫이 아니라 궤적은 멈춘 자리에서 끝난다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const pairProductionConcept: Aperi21ConceptSource = {
  id: 'pair-production',
  label: 'Pair Production',
  canonicalSim: 'aperi21:pair-production',

  surface: {
    definition:
      'What becomes of a gamma photon carrying more than two rest masses worth of energy: passing near a nucleus it vanishes outright, and an electron and a positron appear in its place.',
    exemplarKeywords: [
      'pair production',
      'energy turning into matter',
      'a gamma ray makes an electron and a positron',
      'mass created out of energy',
      'the 1.022 MeV threshold',
      'a positron is born alongside the electron',
      'paired tracks curving apart in a bubble chamber',
      'why must a nucleus be nearby for it to happen',
      'the photon disappears and two particles appear',
      'antimatter made in the laboratory',
    ],
  },

  briefing: {
    observable: [
      'A nucleus sits at the centre, named while the first shot runs and left unnamed afterwards. The threshold energy is written at the upper left, together with a note that the magnetic field points out of the page.',
      'Three photons come in from the left in turn along one level line, each drawn as a short train of ripples with its energy written beside it. The more energy a photon carries, the closer together its ripples are.',
      'The first photon carries less than the threshold. It reaches the nucleus, passes it and carries on out to the right — nothing appears anywhere.',
      'The second carries more than the threshold. As it reaches the nucleus it is eaten away from the front, and the instant the last of it is gone two tracks leave that same point together.',
      'One track bends upward and the other downward, mirror images of each other about the line the photon came in along; they are drawn in the same colour and told apart only by the marks set beside them.',
      'Both tracks spiral inward as they run, each turn tighter than the last, until they stop.',
      'The third photon carries still more energy and the same thing happens on a larger scale — wider first turns, longer tracks. The pair from the second shot stays faintly behind, sitting inside the new one, so the two sizes stand side by side.',
      'The ripples of the third train are the closest together of the three, and the first train the loosest.',
      'A line of writing below names what each shot does, and changes as each arrives.',
      'The picture fades at the end of the round and the three shots run again.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. Three shots run in a fixed round and repeat on their own.',
        'The photon below the threshold is placed first, so that vanishing has a case of not-vanishing beside it rather than being the only thing ever seen.',
        'The threshold stays written on screen throughout while each photon carries its own energy with it, so the two can be read against each other for every shot.',
        'The pair from the earlier shot is kept faintly in place while the later one is drawn, which is what makes the two sizes comparable instead of remembered.',
        'The two members of a pair are drawn in one colour and distinguished only by which way they bend and by the marks beside them, so the mirror symmetry is what carries the difference in charge.',
        'The tracks stop where the particles have lost their motion rather than running to the edge, so the size of a track stands for the energy it was given.',
        'The radiation is drawn without any colour of light, since it lies far outside what the eye sees.',
        'It opens with the first photon already in flight toward the nucleus.',
      ],
    },

    useWhen: [
      'The article has stated that mass and energy are the same currency and needs the place where the exchange actually happens — the photon is there, then it is not, and two particles are.',
      'The point is that the threshold is a hard threshold rather than a matter of degree. The first shot falls short and produces nothing at all; the second clears it and produces a pair.',
      'The article is introducing antimatter and needs it to appear as something made rather than something found. The positron comes into being in the same instant as the electron and curves the opposite way.',
      'The point is that whatever energy is left over above the threshold goes into motion. The third pair, given four times the surplus, sweeps out visibly wider turns than the second.',
    ],

    avoidWhen: [
      'The subject is annihilation — a positron meeting an electron and the two of them turning back into radiation. The tracks here simply come to a stop and nothing further happens to them.',
      'The article is about a photon that survives its encounter and comes away with an altered wavelength.',
      'The subject is radioactive decay, fission, fusion or any reaction of nuclei with one another. The nucleus here only stands by; nothing happens to it.',
      'The figures wanted are the kinetic energy given to each particle, the radius of a track, or how the energy divides between the two. Nothing but the photon energies and the threshold is written.',
      'The point turns on why a nucleus has to be present at all — on the momentum that something must carry away. The nucleus is drawn but never moves.',
      'The article is about how a detector is built or how particle tracks are read as evidence, rather than about the event itself.',
    ],

    contrastWith: [
      {
        concept: 'compton-scattering',
        note: 'Both are a photon meeting matter; in one it survives and pays part of its energy in wavelength, in the other it is spent entirely and two particles exist that did not before.',
      },
      {
        concept: 'charged-particle-in-magnetic-field',
        note: 'One is about how charges of different speeds circle in a field and what that does and does not depend on; the other takes the circling for granted and reads the two opposite curves as the signature that a pair was made out of nothing.',
      },
      {
        concept: 'stellar-nucleosynthesis',
        note: 'Both are places where matter is made, but one builds heavier nuclei out of lighter ones with the binding energy as the ledger, while the other makes particles out of radiation alone.',
      },
    ],
  },
};
