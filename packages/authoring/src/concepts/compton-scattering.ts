/**
 * compton-scattering 개념 선언.
 *
 * 이 묶음의 빛–물질 형제는 `pair-production` 이다. 둘 다 광자 하나가 날아와 무언가와
 * 만나는 그림이라 주어를 갈랐다.
 *   compton-scattering  광자가 **살아남아** 값을 치른다 — 꺾인 만큼 파장이 늘어난다
 *   pair-production     광자가 **사라지고** 그 자리에 두 입자가 생긴다
 * 이쪽만 파장 늘어남 · 산란각 · 되튄 전자 어휘를 갖고, 저쪽만 문턱 · 쌍 · 반물질 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const comptonScatteringConcept: Aperi21ConceptSource = {
  id: 'compton-scattering',
  label: 'Compton Scattering',
  canonicalSim: 'aperi21:compton-scattering',

  surface: {
    definition:
      'What an X-ray photon comes away with after bouncing off a free electron: a longer wavelength than it arrived with, stretched further the sharper the bounce, while the electron is knocked aside.',
    exemplarKeywords: [
      'Compton scattering',
      'Compton shift',
      'the wavelength changes when X-rays scatter',
      'X-ray bounced off an electron',
      'evidence that light carries momentum',
      'photon recoil against an electron',
      'why does scattered radiation come back softer',
      'light behaving like a billiard ball',
      'scattering angle decides the shift',
      'the electron is knocked out sideways by a photon',
    ],
  },

  briefing: {
    observable: [
      'A single electron sits at the centre of the picture with a mark beside it, and the wavelength of the incoming radiation is written at the lower left.',
      'A photon is drawn as a short train of five ripples. It flies in from the left along a level line, is swallowed at the electron, and comes away at a set angle.',
      'The scattered train does not fly off — it stops and stays where it is, so the shots pile up into a fan spreading over the upper half.',
      'Five shots run in turn: straight through, a small angle, sideways, sharper still, and straight back the way it came.',
      'Every train has the same number of ripples and begins at the same distance from the electron, so the length of a train is its wavelength and the trains can be compared end to end.',
      'A dashed arc marks where a train would end if its wavelength were unchanged. The straight-through train ends exactly on the arc; each sharper one overruns it further, and the one turned right around is longest of all.',
      'Beside each parked train a label gives that angle and the picometres added to the wavelength.',
      'The ripples within a train are visibly further apart in the sharply turned shots than in the straight-through one.',
      'After each bounce the electron is pushed away, trailing a tail behind it: not at all for the straight-through shot, slowly and downward for the small angle, faster and further round for the sideways one, and straight forward and fastest when the photon is turned right around.',
      'A line of writing below names what the shot now running did, and changes with each shot.',
      'At the end all five stand together in the fan, after which the picture fades and the round starts over.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. Five shots run in a fixed round and repeat on their own.',
        'The angles come in increasing order, so the stretching happens as a sequence in time as well as standing side by side in the finished fan.',
        'The scattered photons are left standing rather than allowed to fly away, which is what lets all five wavelengths be compared at once at the end instead of remembered.',
        'Every train carries the same count of ripples and starts from the same radius, which is what makes its drawn length stand for its wavelength.',
        'The incoming radiation is hard enough that the stretch is a large fraction of the wavelength, so it is drawn at true proportion with nothing exaggerated to make it visible.',
        'The photon keeps one colour whether coming or going and the electron another, so the stretching is carried by ripple spacing and train length rather than by colour.',
        'The dashed arc is kept from the unstretched case as a standing comparison, so "longer than it was" is read off the picture.',
        'The mark for the electron follows the shot now running; the electrons pushed away by earlier shots fade out behind it.',
        'It opens with the first photon already in flight toward the electron.',
      ],
    },

    useWhen: [
      'The article has claimed that light carries momentum and needs the place where the photon actually pays for it. Here the payment is visible as length: the train that bounced back is half again as long as the one that went straight through.',
      'The point is that the shift depends on the angle rather than on the brightness or the kind of source. Five angles are laid out in one fan with the added picometres written on each.',
      'The reader is likely to think that scattering merely sends light off in another direction without altering it. The dashed arc holds the unaltered case in place for the scattered trains to overrun.',
    ],

    avoidWhen: [
      'The article is about a photon handing over all its energy at once and knocking an electron out of a metal, or about a threshold frequency below which nothing happens. No metal, no lamp and no colour of light are drawn, and the photon survives every encounter.',
      'The subject is how the size of the scattering particles decides which colours go where — a sky, a cloud, a haze. One free electron is drawn and the radiation has no colour.',
      'The figures wanted are photon energies in keV, the kinetic energy handed to the electron, or how the scattered intensity is distributed over angle. None of these appears.',
      'The point turns on the momentum bookkeeping drawn out as vectors — the incoming, outgoing and electron momenta forming a triangle. No such arrows are drawn; the electron simply moves.',
      'The article treats light as a spreading wave, or is about interference, fringes and path differences. What is drawn is a train that arrives whole and leaves whole.',
      'The subject is a photon disappearing altogether and matter appearing in its place.',
    ],

    contrastWith: [
      {
        concept: 'pair-production',
        note: 'Both are a photon meeting matter and coming off worse for it; in one the photon survives and pays in wavelength, in the other it ceases to exist and its whole energy becomes two particles.',
      },
      {
        concept: 'scattering',
        note: 'One asks what the size of the scattering particles does to the colours that come out; the other asks what a single bounce off one electron does to the wavelength of the light itself.',
      },
      {
        concept: 'elastic-collision',
        note: 'One is two bodies of matter meeting head on and handing a speed over whole; the other borrows that picture for something with no rest mass, where the carrier survives but comes away stretched.',
      },
      {
        concept: 'conservation-of-momentum',
        note: 'One is the principle that a group keeps its total however the shares move; the other is the particular case that made light a claimant on that total.',
      },
    ],
  },
};
