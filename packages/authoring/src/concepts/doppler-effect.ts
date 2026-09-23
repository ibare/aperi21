/**
 * doppler-effect 개념 선언.
 *
 * 「움직이는 음원」 세 형제 중 **한 음원 둘레의 앞뒤 비대칭**을 맡는다.
 *   doppler-effect              주어 = 이미 나간 **파면들과 방출점**. 주장 = 파면은 그대로
 *                               퍼지고 **방출점만 밀려** 앞이 촘촘 · 뒤가 성기다
 *   doppler-source-vs-observer  주어 = **누가** 움직이는가. 주장 = 같은 빠르기라도 결과가 다르다
 *   shock-wave                  주어 = 소리를 **앞지른** 음원. 주장 = 파면이 원뿔 하나에 모인다
 *
 * 이쪽만 「앞쪽 촘촘 · 뒤쪽 성김 · 방출점 · 구급차 · 파면은 그대로」 어휘를 갖는다.
 * 관찰자 · 듣는 쪽 · 비대칭의 누가 · 원뿔 · 음속 넘기는 쓰지 않는다. 화면에 관찰자도
 * 진동수 값도 없어 「높아진 소리」 는 avoidWhen 으로 되돌린다(간극 장부 참조).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const dopplerEffectConcept: Aperi21ConceptSource = {
  id: 'doppler-effect',
  label: 'The Fronts Are Unchanged — Only Their Birthplaces Moved',
  canonicalSim: 'aperi21:doppler-effect',

  surface: {
    definition:
      'What a travelling source does to the fronts it has already sent out: each keeps spreading at the same speed from the place it was born, so they crowd ahead of the source and thin out behind it.',
    exemplarKeywords: [
      'Doppler effect',
      'why an ambulance siren changes as it passes',
      'wavefronts bunch up in front of a moving source',
      'the fronts spread out behind a moving source',
      'does sound travel faster forwards from a moving source',
      'moving source of waves',
      'circles drawn from different centres',
      'wavelength squeezed in front',
      'a passing train horn',
      'the source catches up with its own sound',
      'spacing of the waves ahead and behind',
    ],
  },

  briefing: {
    observable: [
      'An ambulance, drawn in the accent colour with a lit bar on its roof and a window cut clean through it, sits on a line across the middle of the picture.',
      'Rings spread outward from it at an even beat. Each ring carries at its centre a small dot marking the place the ring came from, and ring and dot are drawn in the same ink and fade together as they age.',
      'For the first stretch the ambulance stands still. All the centre dots lie on top of one another and the rings are a plain set of circles about a single point, evenly spaced all the way round — ahead of the ambulance and behind it alike.',
      'Then the ambulance sets off to the right. The newest rings are born further and further along the line, and the centre dots pull apart into a row trailing behind it.',
      'From that moment on, the rings ahead of the ambulance sit close together while those behind sit far apart, and the gap between the two sides widens over the first few rings.',
      'The older, wider rings made while it was standing still stay on view for a while as plain circles, so the crowded new ones and the even old ones are in the same picture at once.',
      'No ring is ever deformed or flattened: every one of them stays a complete circle growing at the same rate as all the others, and the ambulance can be seen sitting off-centre inside them.',
      'A line of text below says whether the ambulance is standing, has just set off, or is running, and states that the fronts are unchanged and only their birthplaces moved.',
    ],

    screen: {
      affordances: [
        'A control at the upper right sets how fast the ambulance travels, given as a fraction of the speed at which the rings spread, from nothing up to well under one.',
        'Setting it to nothing brings the centre dots back onto one another and the rings back to an even set of circles, so the reader can undo the effect and see what it is an effect against.',
        'Taking it to its top makes the crowding at the front extreme, with the forward spacing a small fraction of the rearward one, so the reader can push the case rather than accept one setting of it.',
        'While the control is not being held, it follows the picture’s own movement, and it takes over the instant it is taken hold of, so the reader never sees a control that disagrees with what is drawn.',
        'On arriving, several rings from the standing stretch are already spread out, which gives the even spacing as a starting point to measure the later crowding against.',
        'The accent colour is kept for one meaning only — the source — while the rings and their centre dots are drawn in one ink as two parts of one event.',
        'No grid and no distance scale are drawn, since what is being compared is the spacing of the rings against each other and nothing outside them.',
      ],
    },

    useWhen: [
      'The article has raised the idea that the sound sent forward somehow travels faster, or is somehow squeezed as it goes. Rings that stay perfect circles growing at one rate, with only their centres displaced, is what refutes it.',
      'The point being made is that the crowding is a matter of where each front started and not of anything happening to the fronts themselves, and the row of birthplaces trailing behind the source is wanted as the evidence.',
      'The reader is to be given the standing case and the travelling case in one picture, since the crowding means nothing without the even set of circles to hold it against.',
    ],

    avoidWhen: [
      'The point is that a moving listener and a moving source do not give the same result. There is no listener here at all, and only the source ever moves.',
      'The article states what pitch is actually heard, or needs a rise and fall as something passes. Nothing here receives the sound and no pitch is named or shown.',
      'The subject is a source going faster than its own waves, a cone, or a bang. The source here always stays well inside its own rings.',
      'Figures are wanted — a frequency, a shift, a wavelength. Only a speed as a fraction is written, on the control.',
      'The article is about light from a receding galaxy, a spectral line sliding, or a measurement of speed from a returned signal. What is drawn is a source in a medium with the fronts themselves on view.',
      'The claim to be carried is that the sound is louder in front. Nothing here says anything about strength; every ring is drawn alike.',
    ],

    contrastWith: [
      {
        concept: 'doppler-source-vs-observer',
        note: 'One shows the whole asymmetry around a single travelling source, front against back; the other asks a different question of the same phenomenon — whether it matters which of the two parties is the one that moves.',
      },
      {
        concept: 'shock-wave',
        note: 'Both follow a source among the fronts it has sent out, on the two sides of one threshold: in one the source always stays inside its own rings, in the other it has passed them and they gather on a cone behind it.',
      },
      {
        concept: 'beats',
        note: 'Both end in a pitch that is not the one sent, but one alters a single tone by the source travelling, while the other leaves two tones alone and lets their sliding apart do the work.',
      },
      {
        concept: 'relative-velocity',
        note: 'Both turn on motion between two parties changing what is recorded, but one is about the spacing of waves already released into a medium, which the medium then fixes regardless of the source.',
      },
    ],
  },
};
