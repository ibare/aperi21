/**
 * seeing-requires-light 개념 선언.
 *
 * 주어를 **눈에 닿는 빛**으로 잡았다. 주장은 「등 → 사과 → 눈」 의 사슬이 끊기면
 * 물체가 그 자리에 있어도 보이지 않는다 하나이고, **왜 빨간가**(겉면이 되쏠 것을
 * 고른다)는 `object-color` 의 몫이라 여기서 말하지 않는다.
 *
 * 이미 선언된 `rectilinear-propagation` 이 이웃의 경계를 이미 그어 두었다 — 저쪽은
 * 빛이 **곧게 간다**는 기하(그림자 크기), 이쪽은 빛이 **닿아야 보인다**는 사슬이다.
 * 그래서 「빛은 직진한다 · 광선 모형」 어휘는 exemplarKeywords 에서 뺐다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const seeingRequiresLightConcept: Aperi21ConceptSource = {
  id: 'seeing-requires-light',
  label: 'Seeing as Light Arriving at the Eye',
  canonicalSim: 'aperi21:seeing-requires-light',

  surface: {
    definition:
      'An object is seen because light from a source lands on it and some of it travels on to the eye; with the source off nothing arrives and the object, still there, is not seen.',
    exemplarKeywords: [
      'seeing needs light',
      'why can you see nothing in a completely dark room',
      'light bounces off an object into your eye',
      'most things do not give off light of their own',
      'luminous and non-luminous objects',
      'what happens the moment the lamp is switched off',
      'how we see things that are not themselves glowing',
      'the eye receives light rather than sending it out',
      'the chain from lamp to object to eye',
      'an object is still there in the dark',
    ],
  },

  briefing: {
    observable: [
      'A lightless room holds a table, a lamp and an apple, with an eye drawn at the right as a lid, an iris and a pupil.',
      'While the lamp is lit, three white beams run from it to the apple, and from the apple red beams leave in several directions at once — up, to the right, down to the left — one of which arrives at the pupil.',
      'Small chevrons ride along every beam and all of them point the same way down the chain, from the lamp to the apple and from the apple to the eye.',
      'A square outside the room, named as the light at the eye, is filled with the colour of the beam that reaches the pupil, so it stands red while the lamp is on.',
      'When the lamp goes off, the bulb, the beams, the lit face of the apple and that square all dim together over the same short stretch and in step with one another.',
      'With the lamp off there are no beams at all, and the apple takes the same black as the room, so that nothing of it can be picked out; a grey dotted outline marks where it still stands, and the square beside the eye is black inside its border.',
      'The lamp comes back on and everything brightens together again in the same order reversed.',
      'The face of the apple, the beam that leaves it and the square beside the eye all come out of one calculation, so the three go to nothing at the same instant and return together.',
    ],

    screen: {
      affordances: [
        'The lamp goes off and comes back on by itself, over and over, with nothing to press.',
        'The room is laid down as lightless so that the apple losing its light reads the same way whether the page is light or dark — it merges into the room rather than standing out against it.',
        'Direction along a beam is carried by chevrons that drift along the line, which mark which way the light goes and say nothing about how fast it goes.',
        'Everything goes dark at the same instant rather than the beams emptying from one end, so the switching says nothing about the speed of light.',
        'The grey dotted outline holds the apple’s place while the lamp is off, which is what separates "cannot be seen" from "has been taken away".',
        'The square beside the eye sits outside the room with a border round it, so an empty square still reads as a square.',
        'The lamp, the apple and the eye are left unlabelled and are told apart by their shapes; the running text names them as the round goes on.',
      ],
    },

    useWhen: [
      'The article has claimed that seeing is something that happens when light arrives, and the reader still half-believes that objects are simply visible. Watching the apple vanish into the room the moment the lamp goes off, and come back when it returns, is the whole argument in one round.',
      'The point being made is the chain — a source, an object that sends light on, and an eye that receives it — and the article wants each link named in order. The three links are drawn as three stages of one path with the direction marked along it.',
      'The reader is being taken through the dark-room thought experiment and needs it carried out rather than described.',
    ],

    avoidWhen: [
      'The question is why the apple is red rather than some other colour, or what a surface does with the light it does not send on. The apple here simply sends back its own colour and nothing accounts for the choice.',
      'The subject is the geometry of light — straight lines, ray diagrams, how large a shadow comes out. The beams here are drawn to show where light goes, not to be measured against anything.',
      'The article is about the eye itself — the lens, the retina, focusing, how the image is formed inside. The beam ends at the pupil and the eye is drawn only as far as that.',
      'The point is how fast light travels, or that it takes time to arrive. Everything on screen changes in the same instant.',
      'The subject is a material letting light through or holding it back, or what is left on a screen behind it. Nothing stands between the lamp and the apple.',
      'The article needs a measure of brightness, or how much of the light sent out is caught. The square beside the eye carries colour and nothing else.',
    ],

    contrastWith: [
      {
        concept: 'object-color',
        note: 'One asks whether any light reaches the eye at all, and answers with the object disappearing; the other takes arrival for granted and asks which part of the light is what arrives.',
      },
      {
        concept: 'rectilinear-propagation',
        note: 'Both follow light from a source to what it meets, but one is about whether it gets there, and the other about the straight path it takes and what that path fixes on the far side.',
      },
      {
        concept: 'specular-diffuse-reflection',
        note: 'Both have light leave a surface in many directions; one uses that only to get one beam to an eye, the other asks what the surface’s roughness does to the whole sheaf.',
      },
      {
        concept: 'light-through-materials',
        note: 'One turns on the source being there or not, the other on what stands in the way once it is.',
      },
    ],
  },
};
