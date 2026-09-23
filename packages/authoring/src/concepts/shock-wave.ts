/**
 * shock-wave 개념 선언.
 *
 * 「움직이는 음원」 세 형제 중 **소리를 앞지른 뒤**를 맡는다.
 *   shock-wave                  주어 = 제 소리보다 **빨라진** 음원. 주장 = 제가 낸 파면을
 *                               앞질러, 모든 파면이 **원뿔 하나**에 모인다
 *   doppler-effect              주어 = 이미 나간 파면들. 주장 = 앞 촘촘 · 뒤 성김 (언제나 안쪽)
 *   doppler-source-vs-observer  주어 = 누가 움직이는가. 주장 = 같은 빠르기라도 결과가 다르다
 *
 * 이쪽만 「앞지른다 · 벽 · 원뿔 · 접한다 · 직각삼각형 · θ」 어휘를 갖는다. 앞뒤 간격의
 * 견줌(아음속 화면)은 아예 하지 않고, 관측자 · 쾅 소리 · 들리는 순간도 화면에 없어
 * avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const shockWaveConcept: Aperi21ConceptSource = {
  id: 'shock-wave',
  label: 'Once a Source Outruns Its Own Fronts They Gather on One Cone',
  canonicalSim: 'aperi21:shock-wave',

  surface: {
    definition:
      'What becomes of the fronts a source has sent out once it travels faster than they spread: it passes them all, and every one of them comes to touch a single cone trailing back from its nose.',
    exemplarKeywords: [
      'shock wave',
      'what happens when something goes faster than sound',
      'Mach cone',
      'breaking the sound barrier',
      'the aircraft outruns its own sound',
      'cone of wavefronts behind a supersonic body',
      'the fronts pile up at the nose at exactly the speed of sound',
      'sonic boom cone',
      'Mach angle',
      'supersonic source',
      'the circles all touch one line',
    ],
  },

  briefing: {
    observable: [
      'A slim pointed body, drawn in the accent colour with its nose at the very front, travels from left to right across a panel. An arrow rides above it whose length grows with its speed, and a small label gives that speed as it was set.',
      'At the start it travels at exactly the speed the rings spread. Every ring it has ever sent touches its nose, so they are stacked on one another into a dense upright wall standing at the nose, and ahead of that wall the panel is empty.',
      'Its speed then rises smoothly, the arrow lengthening as it goes, and the nose pushes out through the wall so that the two or three newest rings are left behind it.',
      'Once it is well past, every new ring falls behind, and the outer edges of the whole set line up along two straight lines running back from the nose. Those lines are not drawn — the rings themselves make them by touching.',
      'Further back sits the bunched remnant of the wall from the earlier stretch, so the dense pile and the opened-out cone are in one picture.',
      'The motion then stops. Only now are the two lines drawn in, as dashed strokes laid over where the rings touch, and the rings are dimmed so the geometry stands in front.',
      'On one ring a right-angled triangle is put up: from that ring’s centre out to where it touches the line, named for the distance the front has spread, and from that same centre forward to the nose, named for the distance the source has gone. A small square marks the right angle at the touching point.',
      'At the nose a shaded wedge marks the angle between the line and the path, named with a single letter, and the triangle makes plain why the cone opens by that much.',
      'The two lines run back only as far as the oldest ring made at the higher speed; the older rings behind them do not touch the cone and no line is carried past them.',
      'A line of text below says which of the four states is on view — the wall, the breaking through, the gathered cone, or the frozen geometry.',
    ],

    screen: {
      affordances: [
        'The round runs by itself and repeats; nothing is pressed. It begins at the matching speed rather than below it, so the wall is the first thing on view and the opening-out of the cone is the change.',
        'The cone lines are withheld while anything is moving and put in only once it stops, so what is seen first is rings coming to touch and not a shape drawn over them.',
        'The accent colour is kept for one meaning only — the source — while the rings, the cone lines and the triangle are drawn alike, so the shape is carried by geometry rather than by colour.',
        'Speeds are written only where they are exactly what was set; through the stretch where the speed is climbing, the label drops out and the arrow’s length alone carries the change.',
        'The angle is left as a letter and the sides as symbols, so what is read off is a triangle and not a computed value.',
        'The rings are dimmed in the frozen picture so that the triangle and the two lines read in front of them.',
        'On arriving, the body is already running at the matching speed with the wall already standing at its nose.',
      ],
    },

    useWhen: [
      'The article has said that a body passing the speed of sound leaves a cone behind it, and the reader has taken the cone as a thing the body emits. Watching ordinary rings, each spreading as it always did, come to touch one line is what turns the cone into a consequence.',
      'The case being made is that the matching speed is a threshold rather than a barrier in the material, and the picture is wanted where the fronts first pile at the nose and then are simply left behind.',
      'The reason the cone opens by the angle it does is to be given without an expression, and a right-angled triangle standing between the distance a front has spread and the distance the source has gone is what carries it.',
    ],

    avoidWhen: [
      'The subject is a source travelling slower than its sound, or the contrast between crowded fronts ahead and thinned fronts behind. Nothing here is below the threshold; the picture starts at the matching speed.',
      'The article is about what a bystander hears and when — the bang arriving, the cone sweeping past the ground. No listener stands anywhere in this picture and nothing is heard.',
      'The point is that a faster body gives a narrower cone. One speed past the threshold is shown and it cannot be altered.',
      'Figures are wanted — an angle in degrees, a Mach number, a relation between the angle and the speeds. The angle is a letter and the sides are symbols.',
      'The article concerns what the pile-up does to the air — pressure jumping across the front, heating, drag. Only the geometry of where the fronts lie is drawn.',
      'The subject is a pitch being raised or lowered. Nothing here is received and no pitch is spoken of.',
    ],

    contrastWith: [
      {
        concept: 'doppler-effect',
        note: 'Both follow a source among the fronts it has already sent, on the two sides of one threshold: below it the source stays inside its own rings and merely crowds them ahead, above it the rings are all behind and touch a single cone.',
      },
      {
        concept: 'doppler-source-vs-observer',
        note: 'One is about a source past the threshold, where the shape exists whether or not anyone is there to receive it; the other keeps the source well below it and asks which of two parties is the one that moves.',
      },
      {
        concept: 'standing-wave',
        note: 'Both are many waves adding to a shape that holds together, but one has fronts that stay behind one travelling body and line up along it, while the other has two opposite waves on one line pinning certain places still.',
      },
    ],
  },
};
