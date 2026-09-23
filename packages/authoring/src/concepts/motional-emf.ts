/**
 * motional-emf 개념 선언.
 *
 * 유도 다섯 가운데 이쪽은 **기작**이다 — 움직이는 도체 속 전하가 도체를 따라 밀려
 * 양 끝이 + 와 − 로 갈라진다.
 *   motional-emf     도체 **속**에서 전하가 갈라진다 (양 끝 · 두 배 빠르면 두 배)
 *   faradays-law     유도 전압의 크기 (빠르기 · 감은 수)
 *   lenzs-law        유도의 방향 — 힘은 늘 움직임을 거스른다
 *   eddy-current     덩어리 도체 속 저절로 도는 전류가 움직임을 막는다
 *   self-inductance  코일이 자기 자신의 전류 변화에 맞선다
 * 이쪽만 「도체 속 전하 · 밀린다 · 양 끝이 + 와 − · 갈라짐」 어휘를 갖고, 회로 · 전류 ·
 * 제동 어휘를 하나도 갖지 않는다 — 레일 한쪽 끝이 열려 있어 전류가 흐르지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const motionalEmfConcept: Aperi21ConceptSource = {
  id: 'motional-emf',
  label: 'Charge Separation Inside a Moving Conductor',
  canonicalSim: 'aperi21:motional-emf',

  surface: {
    definition:
      'That a conductor carried across a magnetic field has the charges within it pushed along its length, so that its two ends separate into plus and minus, twice the speed giving twice the separation.',
    exemplarKeywords: [
      'motional EMF',
      'a rod sliding along rails in a magnetic field',
      'why does moving a wire across a field make a voltage',
      'the magnetic force on the electrons inside a moving conductor',
      'charge piling up at the ends of a moving rod',
      'one end becomes positive and the other negative',
      'a conductor cutting across field lines',
      'the sliding bar with an open circuit',
      'voltage across a moving wire',
      'faster motion separates more charge',
    ],
  },

  briefing: {
    observable: [
      'A field pointing into the page is drawn as a grid of crossed circles, and a metal rod lies across two rails inside it, seen from above.',
      'Along the rod eight fixed positive ions are drawn in a column, and beside each one sits an electron dot, so at rest every ion has its partner and the rod is uniform end to end.',
      'When the rod begins to slide it carries an arrow for its motion, and alongside it, in the accent colour, a second arrow for the push each electron feels — a push directed along the rod, across its direction of travel.',
      'The whole set of electrons shifts a couple of rows down the rod, so the middle stays paired up and neutral while the topmost ions are left without partners and the displaced electrons gather at the bottom end.',
      'Marks for plus and minus appear at the two ends of the rod, and a bracket spanning the rod from end to end darkens with a name for the voltage across it.',
      'At the end of the rails the rod stops; the arrows disappear, the electrons spread back to their partners, and the end marks and bracket vanish with them.',
      'The same rod then sets off at twice the speed, with a motion arrow twice as long and a push arrow twice as long, and this time four rows of electrons move down instead of two.',
      'Four bare ions are left at the top and four electrons gather at the bottom in two rows of two, and the bracket now carries a name saying twice the voltage.',
      'How much charge has separated is therefore countable — two against four — and the numbers of exposed ions and gathered electrons are what carry the doubling.',
      'The rails have no source and no meter, and the left end of the track is left open, so nothing runs round anywhere.',
      'Plus and minus are told by their marks, not by colour, and the accent colour belongs to the push on the electrons alone.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the rod slides at one speed, stops and relaxes, and then slides again at twice the speed.',
        'The electrons are shifted as a body rather than sent flying from one end to the other, which keeps the middle of the rod visibly paired and neutral while only the ends are charged.',
        'The gathered electrons sit two to a row at the far end so that they can be counted rather than merging into a blob.',
        'Only the magnetic push on the electrons is drawn, and it stands throughout the slide, so nothing suggests that a second, opposing force is being balanced against it.',
        'The track is left open and no meter is attached, which keeps a current and any braking out of the picture entirely.',
        'The names on the arrows and on the bracket carry the multiple itself, so the doubling is stated by the labels and counted in the dots at once.',
        'The names are placed on the blank rows between the rows of field marks, so that a rod travelling across the field never has its labels sitting on top of them.',
      ],
    },

    useWhen: [
      'The article has given the voltage of a moving conductor as a product of field, length and speed, and the reader has no picture of what is happening inside the metal. Electrons sliding down the rod and leaving bare ions at the top is that picture.',
      'The prose needs induction to have a cause that is ordinary — a force on moving charges — before any law about flux is invoked.',
      'The article needs the doubling to be countable rather than read off a scale: two bare ions become four when the speed is doubled.',
    ],

    avoidWhen: [
      'The circuit is closed and a current flows, or a lamp lights, or the rod is resisted as it slides. The track is open here and nothing circulates.',
      'The subject is flux through a changing area, or the sweeping rod described as changing the area of a loop. No loop and no flux are drawn.',
      'Which way the induced effect opposes the motion is the point, or the force on the rod itself. The only force drawn is the one on the electrons inside it.',
      'A voltage is wanted in volts, or the field, length and speed are to be put into an expression. Nothing carries a number; the bracket carries only a symbol and a multiple.',
      'The article needs a coil, a magnet moving instead of the conductor, or a rotating loop in a generator. Here a straight rod moves in a field that is fixed and uniform.',
      'The balance that stops the charges piling up further — the electric field they build turning back the magnetic push — is the subject. Only one push is drawn and it stands the whole time.',
      'The reader is meant to vary the speed themselves. The two runs are fixed and go by in turn.',
    ],

    contrastWith: [
      {
        concept: 'faradays-law',
        note: 'One opens a conductor up and shows the charges that the voltage consists of; the other treats the voltage as a single quantity and asks only what makes it bigger.',
      },
      {
        concept: 'lenzs-law',
        note: 'One is about charges separating, which happens before any current exists and has nothing to push back with; the other is about the current that follows and the resistance it brings.',
      },
      {
        concept: 'charge-in-uniform-field',
        note: 'Both have a magnetic or electric push acting on charge, but one has a free charge that simply goes where it is pushed, while the other has charges trapped in metal that can only crowd to one end and stop.',
      },
      {
        concept: 'eddy-current',
        note: 'One keeps the circuit open so that charge separates and stays separated; the other has a conductor so solid that the charge has nowhere to stop and simply circulates.',
      },
    ],
  },
};
