/**
 * relativistic-doppler 개념 선언.
 *
 * 이미 선언된 도플러 둘과 **무엇이 남는가**로 갈랐다.
 *   doppler-effect              앞은 촘촘 · 뒤는 성김 — 옆에서는 아무 일도 없다
 *   doppler-source-vs-observer  같은 빠르기에서 **누가 움직이느냐**로 답이 갈린다
 *   relativistic-doppler        **옆으로 간 빛도 붉다** — 다가오지도 멀어지지도 않는 방향에 남는 것
 * 이쪽만 「옆 · 바로 옆으로 낸 빛 · 나노미터 · 빛의 색 · 앞뒤가 다 있어도 옆이 주장」 어휘를 갖는다.
 * 소리 · 음높이 · 구급차는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const relativisticDopplerConcept: Aperi21ConceptSource = {
  id: 'relativistic-doppler',
  label: 'Doppler Shift of Light with the Sideways Reddening',
  canonicalSim: 'aperi21:relativistic-doppler',

  surface: {
    definition:
      'The colour shift of light from a source in flight — bluer ahead, redder behind — together with a reddening that remains at right angles, where the source is neither closing nor opening the distance.',
    exemplarKeywords: [
      'relativistic Doppler shift',
      'transverse Doppler effect',
      'why is light shifted even sideways',
      'reddening at right angles to the motion',
      'blueshifted approaching starlight and redshifted receding starlight',
      'the colour of light from a fast moving lamp',
      'sound has no sideways shift but light does',
      'measuring how fast a star moves from its colour',
      'a shift that approach and recession cannot account for',
      'wavelength in nanometres received from a moving emitter',
    ],
  },

  briefing: {
    observable: [
      'A round source, painted the colour of the light it makes, runs along a track from left to right, and every front it has sent out is a ring spreading from the spot it was born at.',
      'A single ring is not one colour: it runs violet at its leading edge through blue, green and yellow to red at its trailing edge, so one ring already carries the whole claim about direction.',
      'The rings crowd together ahead of the source and spread apart behind it, which is the same statement made a second way, by spacing instead of by colour.',
      'Three round watchers stand in the picture — one behind, one ahead, and one below the middle of the track — and each is painted with the colour it is receiving at that instant.',
      'The one behind holds red at 720 nm and the one ahead holds violet at 405 nm the whole way through, while the one below the track travels from blue toward blue-green as the source draws level.',
      'The scene then stops at the exact moment the front made directly above the lower watcher reaches it; an empty ring marks the place it was sent from and a dotted line runs from there down to the watcher, named as the light that went sideways.',
      'In that held picture the lower watcher is yellow-green at 562.5 nm while the source, which is drawn in its own light, is green at 540 nm — the sideways light is on the red side of the light the source actually makes.',
      'The figure for the source speed is written once beside it with an arrow, and the wavelengths in nanometres appear only where they are being compared; nothing counts up or down while the source is running.',
    ],

    screen: {
      affordances: [
        'The source runs, the scene freezes at the arrival of the sideways front, the comparison is held for several seconds, and the whole round begins again; nothing has to be pressed.',
        'Everything is drawn from the point of view of the ground the track is laid on, so one and the same account covers all three watchers.',
        'The freeze is what makes the sideways claim readable at all — left running, the lower watcher would slide past the colour worth looking at in an instant.',
        'The fronts and the watchers are painted in the colours of the light itself rather than in colours chosen to label them, because here the colour is the finding.',
        'A speed is chosen at which all three received wavelengths land inside the range the eye can see, so none of the three colours has to be invented.',
        'The picture is already full of fronts when it opens, since the source has been running all along.',
      ],
    },

    useWhen: [
      'The article has said that the shift in light is not simply the shift in sound with light substituted, and needs the one place where the two accounts disagree — a direction in which the sound picture predicts nothing at all and the light picture still predicts a reddening.',
      'The reader is being shown how a speed is read out of starlight, and needs to see that the shift belongs to a direction rather than to the source, with all three directions present in one picture.',
    ],

    avoidWhen: [
      'The subject is sound — a siren, a horn, a pitch rising and falling. Everything here is light and the whole argument is carried by colour.',
      'The article turns on which of the two is moving, or on the two accounts giving different answers at the same closing speed. Only one account is given here, and it never asks who is moving.',
      'The reddening in question comes from gravity, from a source sitting deep in a well, or from the expansion of space. The source here is simply running along a track on level ground.',
      'The point is a numerical factor, a redshift figure, or a formula being worked through. Four wavelengths are written down and nothing else is calculated on screen.',
      'The article needs a very fast source, near the light speed. The speed here is a modest fraction of it, chosen so that the light stays inside the range the eye can see.',
    ],

    contrastWith: [
      {
        concept: 'doppler-effect',
        note: 'One is about fronts crowding ahead and thinning behind, which leaves a listener off to the side with nothing to report; the other rests its whole case on what that listener to the side still finds.',
      },
      {
        concept: 'doppler-source-vs-observer',
        note: 'One shows that the same closing speed gives two different answers depending on which party is moving; the other has a single answer for every direction, and spends it on the direction where the distance is not changing at all.',
      },
      {
        concept: 'gravitational-redshift',
        note: 'One reddens light because the thing that made it was travelling; the other reddens light although nothing travelled, by making it climb out of a deep well.',
      },
      {
        concept: 'relativistic-momentum',
        note: 'One takes the speed as given and follows the light that leaves; the other takes the light aside and follows what it costs to get a body up to such a speed in the first place.',
      },
    ],
  },
};
