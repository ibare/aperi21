/**
 * meissner-effect 개념 선언.
 *
 * 초전도 둘의 갈림 — **무엇을 주장하는가**. 이웃 `superconductivity` 는 저항이 사라지는
 * 것(저항 곡선)을 주장한다. 이쪽은 저항을 한마디도 말하지 않는다 — **이미 시료를 꿰뚫고
 * 있던 자기장이 식히는 순간 밖으로 밀려나고 자석이 떠오른다.** 저항 · 저항 0 · 전류라는
 * 말을 definition 과 exemplarKeywords 에 쓰지 않는다.
 *
 * 선언된 이웃과도 갈랐다 — `lenzs-law` · `eddy-current` 는 **자석이 움직여서** 생기는
 * 맞섬이고, 여기서 움직인 것은 온도다. `electrostatic-shielding` 은 전기장을 안으로
 * 들이지 않는 것이고, 여기는 이미 들어와 있던 자기장이 쫓겨난다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const meissnerEffectConcept: Aperi21ConceptSource = {
  id: 'meissner-effect',
  label: 'Magnetic Field Driven Out on Cooling, and the Magnet That Rises',
  canonicalSim: 'aperi21:meissner-effect',

  surface: {
    definition:
      'A sample cooled past its critical temperature drives out the magnetic field already threading it, the lines bending around it instead, and the magnet lying on top rises free.',
    exemplarKeywords: [
      'Meissner effect',
      'magnetic levitation over a cooled sample',
      'why does the magnet float above the disc in liquid nitrogen',
      'expulsion of magnetic flux',
      'perfect diamagnetism',
      'the field is pushed out, not merely kept out',
      'cooling with the magnet already sitting on top',
      'field lines bending around a cooled sample',
      'a superconductor is more than a perfect conductor',
      'the magnet drops back down when it warms up',
    ],
  },

  briefing: {
    observable: [
      'The picture is a slice seen from the side: a flat sample lies across the middle, and a bar magnet rests on top of it with its north end facing down, marked N below and S above.',
      'Eighteen field lines fan out of the magnet’s lower end face, and at the start many of them run straight down through the sample and out below it.',
      'A label beside the sample reads that the temperature is above the critical one; the sample itself is drawn as the same grey material throughout and its colour never changes.',
      'The label then swaps for one saying the temperature is below the critical one, and for that whole moment the lines do not move at all — the cooling has been said before anything happens.',
      'Then the lines start leaving. One at a time, a line that had been crossing the sample pulls free, rides along the sample’s upper face and curls away over one end or the other.',
      'As they go, the magnet lifts clear of the sample and a gap opens between them.',
      'At the far point of the cycle not a single line is left inside the sample, two of them skim its top face and bend down past its ends, and the magnet hangs in the gap.',
      'The label swaps back to the warmer one, the lines return through the sample and the magnet settles down onto it, ending exactly as the picture began.',
      'Every line is drawn in the same colour throughout: a line that passes through and a line that curls around are the same line, and only its route has changed.',
      'A short caption under the picture names what is happening at that moment and nothing more.',
      'Nothing on the picture is given a figure — not the strength of the field, not the temperature, not the height of the gap.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The cooling, the expulsion, the lift, the warming and the settling run in that order by themselves and the whole round repeats.',
        'It opens part way through the warm part of the round, with the lines already threading the sample, so that the starting point is a field that is inside and not a field being brought up to it.',
        'The lines are computed from the magnet and the sample rather than drawn by hand, which is why the count crossing the sample thins out one line at a time instead of all of them fading together.',
        'Only the lines leaving the magnet’s lower face are drawn; those that loop away above it have nothing to do with the sample and would crowd the ones that do.',
        'The magnet is drawn long, so that its two ends are far enough apart for several lines to reach the sample before curving back.',
        'The state of the sample is told by whether lines go into it and by the two temperature labels, never by a change of colour, since it is the same material hot or cold.',
        'The magnet’s two ends are told apart by their lightness and by the letters beside them, so they stay distinguishable in either theme.',
        'The lift of the magnet grows with how much of the field has been driven out; how high it settles is not worked out from a weight.',
      ],
    },

    useWhen: [
      'The article has introduced superconductors as materials that have lost all resistance, and the reader assumes that is the whole of it. A second thing happens at the same temperature, and it happens to the magnetic field.',
      'The reader has seen a photograph or a demonstration of a magnet hovering over a cooled block and wants the reason it hovers rather than the reason it is cold.',
      'The point turns on the order of events: the field is put in first and the cooling comes second, so what is seen is expulsion rather than mere exclusion.',
      'The article needs the effect shown to be reversible and tied to the temperature alone — warming brings the lines and the weight of the magnet straight back.',
    ],

    avoidWhen: [
      'The subject is how resistance falls away, what a resistance-against-temperature reading looks like, or a current that keeps running of its own accord.',
      'The article explains why a material becomes superconducting at all — pairing of electrons, the microscopic mechanism, or which materials do it at which temperature.',
      'The point is a magnet held locked in place or hanging beneath the sample. What is shown is a plain push upward, not flux caught and pinned.',
      'The subject is what happens when a magnet is moved near ordinary metal — currents stirred up by the motion, braking, or a magnet falling slowly down a tube. Here nothing moves until the temperature does.',
      'The article is about ordinary magnetic materials being drawn to or pushed from a magnet by their own nature.',
      'A figure is wanted: a critical temperature, a field strength, a levitation height or the weight supported. None is written.',
    ],

    contrastWith: [
      {
        concept: 'magnetic-field-lines',
        note: 'One establishes what a field line is and that it never simply stops; the other takes those lines as given and makes their being forced out of a body the whole claim.',
      },
      {
        concept: 'electrostatic-shielding',
        note: 'Both end with a field absent inside a body, but one is about an electric field never getting in and the other about a magnetic field that was already in being driven out.',
      },
      {
        concept: 'lenzs-law',
        note: 'Both give a body that opposes a magnetic field, but there the opposition answers a change in the field and dies with it, while here a steady field is refused as long as the body stays cold.',
      },
      {
        concept: 'eddy-current',
        note: 'One is about a moving magnet stirring currents in metal and being slowed by them; the other holds the magnet still and changes the temperature instead.',
      },
      {
        concept: 'magnetic-materials',
        note: 'Both sort a body by how it answers a magnet, but one ranges over the ordinary degrees of attraction and weak repulsion, while the other is a complete refusal that switches on at a temperature.',
      },
      {
        concept: 'superconductivity',
        note: 'Both mark the same critical temperature, but one makes the refusal of a magnetic field the whole claim, while the other never mentions a field and has the electrical resistance drop outright to nothing.',
      },
    ],
  },
};
