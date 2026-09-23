/**
 * finite-well 개념 선언.
 *
 * 갇힌 상태 셋을 **벽이 무엇을 정하는가** 로 갈랐다.
 *   particle-in-a-box          끝없이 높은 벽 — 허용되는 모양과 1·4·9·16 의 에너지
 *   finite-well                벽 높이가 유한하면 — ψ 가 벽 속으로 새고 준위가 가라앉는다
 *   quantum-harmonic-oscillator 포물선 우물 — 등간격 준위와 반 칸 떠 있는 바닥
 * 이쪽만 「벽 면에서 0 이 아니다 · 벽 속 꼬리 · 무한 우물 준위에서 내려앉은 거리」 어휘를 갖는다.
 * 꿰뚫기(`quantum-tunneling`)와도 갈린다 — 여기 ψ 는 정상 상태라 벽 속에서 줄어들 뿐 떠나지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const finiteWellConcept: Aperi21ConceptSource = {
  id: 'finite-well',
  label: 'Bound States in a Well of Finite Depth',
  canonicalSim: 'aperi21:finite-well',

  surface: {
    definition:
      'What changes when the walls holding a particle are only finitely high: the bound shape no longer dies at the wall but decays into it, and each level sits lower than it would with unbreachable walls.',
    exemplarKeywords: [
      'finite square well',
      'finite potential well',
      'wave function inside the wall',
      'exponential tail in the classically forbidden region',
      'penetration depth into a barrier wall',
      'why the wave function is not zero at the edge',
      'bound state of a shallow well',
      'levels lower than the infinite well',
      'the particle is a little bit outside the well',
      'a well that is not infinitely deep',
      'how wall height changes the bound state',
    ],
  },

  briefing: {
    observable: [
      'One well stands in the middle, its two walls drawn as pale bodies of definite thickness with an outline running around the well and up their inner faces.',
      'Two bound shapes sit inside, each resting on its own level line — the lower one a single hump, the upper one crossing the line in the middle so that one hump goes up and the other down.',
      'At first the walls run off the top of the picture. Both shapes come to exactly nothing where they meet the wall faces, and the pale wall bodies hold no curve at all.',
      'Each level line lies on top of a dotted line of its own, drawn where that level would be if the walls went up forever.',
      'The walls then begin to come down. From the first moment the shapes stop reaching zero at the faces, and curve creeps into the pale wall bodies from both sides and keeps growing.',
      'At the same time the level lines part from their dotted lines and slide downward, and a coloured measure grows on the right from each dotted line down to where its level now sits.',
      'Near the end of that descent the tops of the walls drop into view and settle, and a marking for the wall height appears there.',
      'The picture then holds: both shapes carry tails that shrink away inside the wall bodies, the upper shape has by far the longer tail, and its measure of how far it sank is several times the lower one\'s.',
      'The walls then rise back out of sight, the tails are drawn in, the levels climb back onto their dotted lines, and the round begins again.',
      'The only writing is the level numbering, the mark for the wall height, and a name for the dotted lines. No energy value and no length is given.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The lowering and the raising of the walls run on a fixed round and repeat.',
        'It opens with the walls still running off the top, so the reader first sees shapes that vanish exactly at the faces and only then sees tails appear.',
        'The tails grow out of nothing rather than being there from the start, which is what turns the leaking into something that happens rather than something to be told.',
        'Each tail is drawn only as far as it is still worth seeing, so its length reads as how deep the shape has got into the wall instead of running flat to the far edge.',
        'The shapes are drawn with their sign, so the upper one dips below its level line, and the tail on the left approaches the line from below — the value at the face carries straight on into the wall.',
        'Both humps are drawn to the same height inside the well, so what is compared between the two shapes is the tail and not the size of the hump.',
        'The dotted lines stay where the levels began, which is what the coloured measures are measured against.',
        'Two levels are shown rather than a whole ladder, because what is being followed is one level changing rather than how levels space out.',
        'The colour set aside for how far a level has sunk is used for those measures and for nothing else; the shapes and their tails are all one colour, as one thing.',
      ],
    },

    useWhen: [
      'The article has granted that a particle can be found where it has too little energy to be, and the reader needs that stated about a bound state rather than about something passing by. The shape is carried on into the wall and dies away there.',
      'The point is that a wall of ordinary height is not the same idealisation as a perfect one. The walls come down from being endless, and what the reader has already accepted about perfect walls visibly stops holding.',
      'The article needs leaking and lower energy tied together rather than mentioned side by side. The tails grow and the levels slide down in the same movement.',
      'The reader should see that the higher level is the looser one. The upper shape\'s tail is plainly the longer and its drop from where it started is plainly the larger.',
    ],

    avoidWhen: [
      'The subject is a particle going through a wall and coming out the other side, or how much gets across. Both shapes here stay put; the tails die inside the wall bodies and nothing leaves.',
      'The point is the spacing of a ladder of levels, or energies in a definite ratio such as one, four, nine. Only two levels are drawn and no scale of energy is marked.',
      'The article turns on how many bound states a well of a given depth can hold, or on a particle escaping once the well is shallow enough.',
      'The subject is where the particle is likely to be found, or squaring the shape into a distribution. The shapes here keep their sign and dip below their lines.',
      'The article needs a depth in electronvolts, a penetration length in nanometres, or any worked figure. Nothing on screen is numbered.',
      'The point is a state that changes with time, or one made of more than one level at once. Each shape sits still on its own line.',
    ],

    contrastWith: [
      {
        concept: 'particle-in-a-box',
        note: 'One takes the walls as perfect and asks what energies follow; the other keeps the same well but lets the walls be beatable, so the shapes reach beyond them and every energy comes out lower.',
      },
      {
        concept: 'quantum-harmonic-oscillator',
        note: 'Both are about a particle held in a well, but one asks what the softness of the containing wall does to a level, while the other asks how levels of a spring-like well are spaced and where the lowest one sits.',
      },
      {
        concept: 'quantum-tunneling',
        note: 'Both have a shape that reaches into a region it has too little energy for; one is a settled state whose tail simply dies away there, the other is a thing in transit that comes out the far side.',
      },
      {
        concept: 'wave-function',
        note: 'One asks which shapes a given confinement allows and what they cost; the other takes a shape as given and asks how it tells you where the particle may be found.',
      },
    ],
  },
};
