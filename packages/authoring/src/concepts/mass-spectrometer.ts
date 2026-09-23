/**
 * mass-spectrometer 개념 선언.
 *
 * 힘 다섯 가운데 이쪽은 **질량이 반지름을 가른다**이다 — 속력과 전하를 묶어 두고 질량만 푼다.
 *   mass-spectrometer                  같은 속력 · 같은 전하, **질량만** 달라 떨어지는 자리가 갈린다
 *   velocity-selector                  그 「같은 속력」 을 **만드는** 앞단 — 두 힘의 경쟁
 *   charged-particle-in-magnetic-field **속력**을 풀어도 한 바퀴 시간은 같다
 *   lorentz-force                      힘의 방향 자체
 *   force-on-current-wire              도선 전체가 튄다
 * 이쪽만 「동위원소 · 질량수 · 판에 떨어진 자리 · 반원」 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const massSpectrometerConcept: Aperi21ConceptSource = {
  id: 'mass-spectrometer',
  label: 'Separating Ions by Mass',
  canonicalSim: 'aperi21:mass-spectrometer',

  surface: {
    definition:
      'How ions alike in charge and in speed are told apart by mass: entering one magnetic field through one slit, the heavier sweeps the wider half circle and comes down on the plate further from where it went in.',
    exemplarKeywords: [
      'mass spectrometer',
      'separating isotopes',
      'heavier ions sweep a wider arc',
      'radius grows with mass',
      'neon 20 and neon 22',
      'ions landing at different places on a plate',
      'how isotopes are told apart',
      'half circle in a magnetic field onto a detector',
      'sorting particles by mass with a magnet',
      'measuring which isotopes a sample holds',
    ],
  },

  briefing: {
    observable: [
      'A plate runs across the top with a slit in it; below sits an ion source, and above the plate the whole area is filled with a pattern of circled dots for a field coming out of the page.',
      'Two ions, each marked with its mass number, rise together along one beam and pass through the slit as a single point.',
      'Inside the field both curve the same way, and because they carry the same speed they sweep the same length of arc while their widths differ, so the two paths open apart.',
      'The lighter keeps to the inner, tighter circle and the heavier to the outer, wider one.',
      'The lighter finishes its half circle first and marks the plate with a short coloured bar; the heavier carries on round and marks the plate beyond it.',
      'Each ion carries its mass number beside it as it flies, set outward from its own circle so the two never sit on one another, and the marks drop below the plate once the ions have landed.',
      'Both half circles and both marks on the plate are then held together, the heavier arc plainly the wider and its mark the further from the slit.',
      'The two ions are drawn in the same tone with a plus cut into each, so only the mass number and the width of the arc tell them apart.',
      'No radius, mass, speed or field value is written; the mass numbers beside the ions are the only figures in the picture.',
      'The finished picture fades and the two are fired again.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the two are fired together and the finished picture is held before the run repeats.',
        'They are fired at the same instant rather than one after the other, so the separating happens once, in front of the reader, instead of being a comparison between two runs.',
        'The accent colour marks only where an ion landed, so what the picture points at is the two places rather than the two paths.',
        'The two widths come out of the declared masses, speed, charge and field rather than being drawn in a chosen ratio.',
        'Two ions are used rather than three, because at this size three labels would sit on one another below the plate.',
        'The stage that brings the two to the same speed is not drawn, and the reader is told only that they arrive alike in speed and in charge.',
        'The field is shown by a pattern laid over the area rather than by an arrow, because it runs out of the plane of the drawing.',
      ],
    },

    useWhen: [
      'The article has given the radius as mass times speed over charge times field, and the reader cannot see how that becomes a measurement. Two arcs of different widths ending at two separate marks on a plate is where the formula turns into a reading.',
      'The prose is about isotopes and needs a picture in which two things indistinguishable by chemistry end up at two different places because of mass alone.',
    ],

    avoidWhen: [
      'The article is about how a beam is brought to a single speed before it enters. That stage is taken for granted here and never drawn.',
      'The particles differ in speed or in charge. These two differ in mass alone.',
      'The subject is a lap time, a full circle, or how many turns are made. Each ion here sweeps half a circle and stops at the plate.',
      'A number is wanted — a radius, a mass in kilograms, a field, or how far apart the two marks are. The mass numbers beside the ions are the only figures.',
      'The article is about relative abundance, peak heights or a spectrum read off as a chart. Two ions arrive here and each leaves one mark.',
      'The reader is meant to choose the two masses. They are fixed and the run repeats unchanged.',
    ],

    contrastWith: [
      {
        concept: 'velocity-selector',
        note: 'One takes the speed as already settled and separates by mass; the other is how a speed comes to be settled at all, by setting two forces against each other.',
      },
      {
        concept: 'charged-particle-in-magnetic-field',
        note: 'One varies the mass, and the widths that result are what does the separating; the other varies the speed and finds that differing widths leave the timing untouched.',
      },
      {
        concept: 'lorentz-force',
        note: 'One uses the magnetic force only as a means of bending paths by amounts that can be relied on; the other is about the direction of that force itself.',
      },
      {
        concept: 'force-on-current-wire',
        note: 'One follows free ions through a field and reads the paths they take; the other has the same force acting on all the carriers of a wire at once, so what moves is the wire.',
      },
    ],
  },
};
