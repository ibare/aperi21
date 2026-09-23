/**
 * impedance-mismatch 개념 선언.
 *
 * 「세기가 줄거나 전달되는」 넷 가운데 하나. 이쪽의 주어는 **경계 한 자리**다.
 *   wave-energy              진폭이 정한다
 *   wave-attenuation         거리가 정한다 — 길 내내 조금씩
 *   impedance-mismatch       경계가 정한다 — 한 자리에서 **되돌아오는 몫**과 뒤집힘
 *   sound-through-materials  매질 종류가 정한다 — 빠르기와 건너감 여부
 * 이쪽만 「나뉜다 · 되돌아온다 · 뒤집혀 · 다를수록」 어휘를 갖는다. 꺾임(방향)은
 * `refraction-of-waves` 몫이라 쓰지 않고, 화면의 펄스는 정면으로 온다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const impedanceMismatchConcept: Aperi21ConceptSource = {
  id: 'impedance-mismatch',
  label: 'How Much Turns Back at a Join',
  canonicalSim: 'aperi21:impedance-mismatch',

  surface: {
    definition:
      'What a wave does where two media of unlike impedance join: it divides, more of it turning back the more they differ, and turning back inverted when the far side is heavier.',
    exemplarKeywords: [
      'impedance mismatch',
      'how much reflects at a boundary',
      'reflection and transmission at a junction',
      'acoustic impedance',
      'why ultrasound needs gel on the skin',
      'a pulse splits where two ropes are tied together',
      'reflection off a heavier rope comes back upside down',
      'echo where the medium changes',
      'partial reflection',
      'matched impedance means nothing comes back',
      'the bigger the mismatch the bigger the echo',
    ],
  },

  briefing: {
    observable: [
      'Three strings lie one above the other. The left half of every one of them is identical, and beyond a dotted line marking the join the attached half differs: labelled Z₂ = Z₁, Z₂ = 3 Z₁ and Z₂ = 9 Z₁, and drawn thicker the larger that number.',
      'Headings across the top name the left half the incoming string, the dotted line the join, and the right half the attached string.',
      'The same upward pulse, the same height and the same width, runs along all three at once and meets all three joins together.',
      'While the pulses are sitting on the joins, everything slows right down, so the dividing is watched rather than glimpsed.',
      'A dashed outline then appears just left of each join, marking where a pulse that had come back whole and upside down would be.',
      'What actually comes back fills that outline by different amounts: on the top string nothing at all comes back and only the outline is left over flat rope, on the middle string the returning dip reaches about halfway up it, and on the bottom string it very nearly fills it.',
      'Everything that comes back dips downward, the opposite way from the pulse that arrived.',
      'What crosses over behaves differently too: on the top string the pulse goes on unchanged, while on the lower strings it crawls away narrower, lower and slower the larger the ratio.',
      'Because those crossed pulses are slow, one or two earlier ones are still creeping along the attached halves when a new pulse arrives.',
      'Nothing is ever given as a number except the three ratios; no fraction, no percentage and no formula appears.',
      'A line of text says in turn that the same pulse is running at all three joins, that at the join it splits with part crossing and part turning back, and that nothing comes back on the uniform string while the heavier the join the more the flipped pulse fills the outline.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; one round runs about five and a half seconds and repeats.',
        'The screen opens with the three pulses already running toward their joins.',
        'All three cases stand at the same instant, so the comparison never rests on remembering an earlier picture.',
        'The three strings are drawn in one colour; what tells them apart is the label, the thickness of the attached half, and how much of the outline gets filled.',
        'The outline is only shown from the moment the returning pulse is leaving the join, so it is a target to be filled rather than a shadow under the arriving pulse.',
        'Only joins onto a heavier medium are shown; all three ratios are one or greater.',
      ],
    },

    useWhen: [
      'The article has given reflection and transmission as coefficients and the reader cannot picture what a coefficient of point five looks like. Three joins at once, each with the full return drawn as an outline to be filled, turn the coefficient into a fraction of a shape.',
      'The point is that a fully reflecting end is not a separate rule but the limit of this one — the outline that nothing ever quite fills is exactly that case — and the article wants the two joined up rather than taught apart.',
      'The reader needs to see why the return is upside down when the far side is heavier, and all three returns dipping the opposite way from the arriving pulse is the evidence.',
    ],

    avoidWhen: [
      'The article is about a wave changing direction when it enters a new medium. The pulses here arrive square on and nothing on the screen turns a corner.',
      'The subject is a wave getting weaker all along its path. Both halves of every string carry their pulses without loss; everything that changes, changes at the one place.',
      'The point is a returning wave meeting the incoming one and standing still. The returning pulses here simply run off the left end.',
      'The article deals with impedance in electrical terms — matching a source to a load, a transmission line, a transformer. Everything here is ropes, and nothing carries a circuit meaning.',
      'The case that matters is a join onto a lighter, faster medium where the return comes back the same way up. All three joins here are onto something heavier.',
      'Numbers are wanted — what fraction returns, how much energy crosses. Only the three impedance ratios are written.',
    ],

    contrastWith: [
      {
        concept: 'refraction-of-waves',
        note: 'Both happen at a boundary between two media. One accounts for the part that never crosses; the other ignores that entirely and follows where the part that did cross is now heading.',
      },
      {
        concept: 'wave-attenuation',
        note: 'Both leave a wave carrying less than it set out with — one all at once at a single place, the other gradually over the whole path, which is why they are told apart by where the loss is, not by how big it is.',
      },
      {
        concept: 'sound-through-materials',
        note: 'Both turn on two materials being unlike. One asks what that difference does to the share that gets across a boundary between them; the other holds the difference inside each material and asks how quickly it carries the wave along.',
      },
      {
        concept: 'elastic-collision',
        note: 'The same arithmetic in another dress: matched impedances hand the whole disturbance on and leave nothing behind, exactly as equal masses pass a speed across whole and leave the striker at rest.',
      },
    ],
  },
};
