/**
 * sound-through-materials 개념 선언.
 *
 * 「세기가 줄거나 전달되는」 넷 가운데 하나이면서, 소리 둘 가운데 **지나는 쪽**이다.
 *   sound-source-vibration   내는 쪽 — 떨리는 동안에만 나온다
 *   sound-through-materials  지나는 쪽 — 무엇을 지나느냐가 **도착 순서**와 **건너감 여부**를 정한다
 *   wave-attenuation         길 내내 줄어드는 몫
 *   impedance-mismatch       경계 한 자리에서 되돌아오는 몫
 * 이쪽만 「쇠 · 물 · 공기 · 진공 · 먼저 닿는다 · 알갱이가 없으면」 어휘를 갖는다. **세기는
 * 네 통이 같다** — 「얼마나 크게 전해지나」 는 화면에 없어 avoidWhen 으로 되돌리고 장부에 올렸다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const soundThroughMaterialsConcept: Aperi21ConceptSource = {
  id: 'sound-through-materials',
  label: 'Sound Needs Particles, and They Set Its Pace',
  canonicalSim: 'aperi21:sound-through-materials',

  surface: {
    definition:
      'What sound must pass through in order to arrive: one tap reaches the far end soonest through steel, later through water, later still through air, and never where no particles exist.',
    exemplarKeywords: [
      'sound through different materials',
      'does sound travel in a vacuum',
      'sound travels fastest in solids',
      'why can you hear a train by listening to the rail',
      'there is no sound in space',
      'sound needs a medium',
      'speed of sound in steel, water and air',
      'particles pass the shake from one to the next',
      'bell jar with the air pumped out',
      'hearing underwater',
      'the knock arrives through the wall before the air',
    ],
  },

  briefing: {
    observable: [
      'Four long tubes lie one above the other and all four are fixed to a single plate at their left ends.',
      'The top three are filled with particles at different densities — steel in a close, regular lattice, water looser and scattered, air looser still — and the bottom tube is an empty dotted outline with nothing in it at all.',
      'Each tube carries its name at the right: steel with 5000 m/s, water with 1500 m/s, air with 340 m/s, and the last simply vacuum, with the air removed.',
      'A mallet taps the plate once, so that the same single shake is delivered to all four tubes in the same instant.',
      'The shake crosses each tube as a bright band of particles pushed along and springing back, and the band is the same brightness and the same width in every tube and does not dim as it goes.',
      'At the end of every tube sits an empty circle under the word listener, and it lights up the moment the band arrives: the steel one almost at once, the water one after it, the air one long after that.',
      'In the vacuum tube nothing moves at any point, and its listener stays unlit right to the end of the round.',
      'The whole crossing takes a small fraction of a second in reality and is stretched out across five seconds so it can be followed.',
      'A line of text says in turn that the mallet taps the plate and all four tubes get the same shake, that the shake passes from particle to particle and reaches the end first in steel then water then air, and that it got through three of them but not through the vacuum where there are no particles.',
      'The four tubes are drawn in one colour; what separates them is how the particles are spaced, whether there are any, and the names.',
      'No arrival time and no ratio between the speeds is written; the only figures are the three speeds on the labels.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; one round runs about ten seconds and repeats.',
        'The screen opens just after the tap, with the shake in the steel tube already well down its length and the other two still near the plate.',
        'One plate and one tap is what makes the comparison fair, since nothing but the filling of the tube can then account for a difference.',
        'The result is held still for a few seconds with three listeners lit and one dark before it fades and the mallet returns.',
        'What is compared is the order in which the listeners light, not a reading taken off any scale.',
      ],
    },

    useWhen: [
      'The article has stated that sound cannot cross a vacuum and the reader takes it as a rule to memorise. A tube that is identical to its neighbours except for being empty, whose listener simply never lights while the others do, turns the rule into the outcome of a trial.',
      'The point is that sound is handed along from particle to particle, and the article needs that handing-along shown for a young reader without graphs or equations — the bright band moving down a line of particles is it.',
      'The reader knows that a knock travels through a table or a rail faster than through the air and the article wants the three cases lined up so the order is seen rather than asserted.',
    ],

    avoidWhen: [
      'The point is how loud the sound is when it arrives, or that some materials carry it better than others. The band keeps the same brightness in all three filled tubes and nothing here is louder or softer.',
      'The article explains why the speeds differ — stiffness, density, how tightly the particles are held. The tubes differ in how closely their particles are drawn, but nothing on the screen claims that is the cause.',
      'The subject is what happens where one material meets another and part of the sound is sent back. Each tube holds one material from end to end.',
      'The article is about the source and whether it is still making sound. The plate is tapped once and the question is only what happens afterwards along the tubes.',
      'A travel time, or how many times faster one is than another, is needed. Only the three speeds appear, and nothing counts or compares them on the screen.',
      'The subject is pitch, or sounds of different frequency behaving differently. One tap is given and it is the same tap everywhere.',
    ],

    contrastWith: [
      {
        concept: 'sound-source-vibration',
        note: 'The two halves of the same journey: one is about what has to keep happening where the sound is made, the other about what has to be present between there and the listener.',
      },
      {
        concept: 'impedance-mismatch',
        note: 'Both turn on materials being unlike one another. One keeps each material whole and asks how fast it carries the disturbance along; the other puts two of them against each other and asks what share never gets across the seam.',
      },
      {
        concept: 'thermal-conduction',
        note: 'Both have something handed along by contact with nothing travelling bodily, and both come out differently for different materials — but one is measured by when it arrives and the other by how much gets through and how far.',
      },
      {
        concept: 'wave-attenuation',
        note: 'One is about whether and how soon a disturbance arrives at all; the other takes arrival for granted and asks what height is left of it by then.',
      },
    ],
  },
};
