/**
 * loudspeaker-and-microphone 개념 선언.
 *
 * 힘 · 유도의 이웃들과 **무엇이 주장인가**로 갈랐다. 이쪽은 **한 장치의 왕복**이다.
 *   loudspeaker-and-microphone 전류가 진동이 되고 진동이 전류가 된다 — **같은 장치를 거꾸로**
 *   force-on-current-wire      장 속의 전류가 옆으로 **밀린다** (방향 · 크기)
 *   motional-emf               움직이는 도체 **속에서 전하가 갈린다**
 *   faradays-law               유도 전압의 **크기**가 빠르기 · 감은 수를 따른다
 *   sound-source-vibration     떠는 동안에만 **소리가 난다**
 * 힘 화살표 · 전압 크기 · 감은 수 어휘는 두지 않는다. 이쪽만 변환 · 왕복 · 거꾸로 쓴다
 * 어휘를 갖고, 증거는 두 띠의 파형이 서로를 따라간다는 것이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const loudspeakerAndMicrophoneConcept: Aperi21ConceptSource = {
  id: 'loudspeaker-and-microphone',
  label: 'One Device Run Both Ways',
  canonicalSim: 'aperi21:loudspeaker-and-microphone',

  surface: {
    definition:
      'That a coil hung in a magnet gap and fixed to a cone works either way round: current fed in becomes shaking that pushes air, and air arriving becomes shaking that gives back a current.',
    exemplarKeywords: [
      'how a loudspeaker works',
      'moving coil microphone',
      'using a speaker as a microphone',
      'dynamic microphone',
      'voice coil in the gap of a magnet',
      'cone pushing the air',
      'turning an electrical signal into sound',
      'turning sound into an electrical signal',
      'the same device run backwards',
      'transducer both ways',
      'headphone driver',
      'why a loudspeaker and a microphone look alike inside',
    ],
  },

  briefing: {
    observable: [
      'The device is cut open lengthways and shown from the side: a magnet with a narrow gap, a coil sitting in that gap, and a cone joined to the coil, with arrows in the gap showing which way the magnetism points.',
      'To the left two strips record side by side, the upper one a solid trace for the current and the lower one a dotted trace for how far the cone has moved, each with its own name.',
      'To the right a field of grains stands for the air.',
      'In the first half a name above the device says it is being used to make sound.',
      'The two marks on the cut coil keep swapping between a cross and a dot as the current alternates, and the coil, its former and the cone all move together, in and out.',
      'Both strips write at once and in step, and a bright arrow between them points from the current strip down to the movement strip.',
      'In front of the cone the grains bunch up and thin out in bands, and the bands set off to the right; a bright arrow over the air points that way too.',
      'Then the trace dies away to nothing, the coil marks go, and the last band of crowding leaves the far end, so the air is left even.',
      'The name above the device changes to say it is now being used to pick up sound, the old recording is taken away, and two flat traces begin.',
      'A band of crowded air comes in from the far end towards the cone, with the bright arrow over the air now pointing left.',
      'The moment it reaches the cone, the cone begins to shake, the dotted trace swells first, and then the solid current trace rises and falls with it at the same rate.',
      'The bright arrow between the strips has turned about and now points from the movement strip up to the current strip, and the cross and dot marks are back on the coil.',
      'The two traces in this second half have their peaks a little out of step with each other, unlike the first half where they were together.',
      'Nothing anywhere carries a number: not a current, not a voltage, not a distance, not a frequency.',
      'Both traces are drawn in the same ink and told apart by one being solid and the other dotted.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the device is driven, the sound is let leave, the air comes back at it, and the run repeats.',
        'One and the same cut-open device is used for both halves, and what changes between them is the name above it and which way the arrow between the strips points.',
        'A quiet stretch is put between the two halves so that the outgoing sound has cleared the air before the incoming one arrives, and the two are never in the air together.',
        'The recordings are taken away and started afresh at the changeover, so the two halves are never set against each other for size.',
        'The accent colour is spent entirely on which way the energy is going — the arrow between the strips and the arrow over the air; the device, the traces and the air stay in ink or grey.',
        'The sound is started and stopped gently rather than switched on, so nothing in the traces jumps.',
        'The air grains move only along the direction the sound travels, and the crowding is what makes the bands.',
        'The movement of the cone is drawn much larger, and its shaking much slower, than it would really be; no figure is offered anywhere that would let the exaggeration be read off.',
      ],
    },

    useWhen: [
      'The article says a loudspeaker and a microphone are the same device used in opposite directions, and the reader takes it as a curiosity rather than a claim. One cut-open device driven and then listened to, with the arrow between the two recordings turning about, is what makes the sameness the thing being shown.',
      'The prose needs the two conversions joined as one story — the current becoming movement becoming bands in the air, and then bands in the air becoming movement becoming current — without two separate devices to compare.',
    ],

    avoidWhen: [
      'The subject is the force on a current-carrying wire in a field, its direction or how it grows with the current. No force arrow is drawn here and the coil is only ever seen moving.',
      'The article is about how large an induced voltage is, or what makes it larger — speed, turns, the strength of the magnet. Nothing here is measured, and the two halves are drawn to different sizes on purpose.',
      'The point is charges being separated along a conductor carried across a field. What is shown here is a coil already wound and joined to a cone.',
      'The article is about sound only lasting while its source shakes, or about stilling a source. The shaking here is the middle term between an electrical signal and the air, not the subject.',
      'The subject is the making of a longitudinal wave, or how crowding travels through a medium. The air here is where the sound goes and comes from, and only a short stretch of it is shown.',
      'Amplification, recording, the quality of the sound or what the signal carries is at issue. Nothing here is amplified, and no sound is played.',
      'The reader is meant to choose a note or drive the device themselves. Both halves run on their own at one rate.',
    ],

    contrastWith: [
      {
        concept: 'force-on-current-wire',
        note: 'One takes it as settled that a current in a field is pushed, and asks what can be built by having that push and its reverse in one object; the other asks what the push itself depends on.',
      },
      {
        concept: 'motional-emf',
        note: 'One has a coil already fixed to a cone and asks what a whole device does in both directions; the other takes a bare conductor across a field and looks at what happens to the charges inside it.',
      },
      {
        concept: 'faradays-law',
        note: 'One asserts only that a movement gives back a current at all, so that the device may be run backwards; the other asks how large that induced voltage comes out.',
      },
      {
        concept: 'sound-source-vibration',
        note: 'One is about what the shaking of a cone is converted from and into; the other is about the tie between any shaking object and the sound that lasts only as long as it.',
      },
      {
        concept: 'longitudinal-wave',
        note: 'One uses crowded and thinned air as what a device delivers into and receives out of; the other makes that crowding and thinning its whole subject.',
      },
      {
        concept: 'lenzs-law',
        note: 'Both have a movement giving rise to a current, but one is about a device converting back and forth, and the other about which way that current must run.',
      },
      {
        concept: 'motor',
        note: 'Both put a current in a field to get motion, but one is about a to-and-fro movement that carries a signal and can be reversed into a source, and the other about keeping a turning going one way round.',
      },
    ],
  },
};
