/**
 * mirage 개념 선언.
 *
 * 전반사 셋 가운데 **경계면이 없는** 쪽이다. 형제와 갈리는 자리는 「무엇이 빛을 돌려세우는가」.
 *   mirage                     쌓인 층의 **기울기**가 조금씩 눕혀 돌려세운다 — 결과는 길바닥 아래 하늘
 *   total-internal-reflection  면 하나 · 문턱 하나 (형제)
 *   optical-fiber              벽 · 되튐 여러 번 (형제)
 * apparent-depth 와는 **보이는 자리의 방향**이 반대다 — 저쪽은 물체가 위로 떠 보이고,
 * 이쪽은 하늘이 땅 아래로 보인다. 각 · 굴절률의 수를 쓰지 않는다(화면에도 없다).
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const mirageConcept: Aperi21ConceptSource = {
  id: 'mirage',
  label: 'Sky Seen Below a Hot Road',
  canonicalSim: 'aperi21:mirage',

  surface: {
    definition:
      'Light bent by air that thins toward hot ground rather than at any one face: a ray slanting down curves back up to an eye, which traces it to sky beneath the road.',
    exemplarKeywords: [
      'mirage',
      'why does a hot road look wet up ahead',
      'a puddle on the motorway that is never there',
      'inferior mirage',
      'a temperature gradient bends light',
      'desert mirage of a lake',
      'looming and bending in layered air',
      'hot air is thinner than cool air',
      'the sky appearing on the tarmac',
      'shimmering air above sun-baked asphalt',
    ],
  },

  briefing: {
    observable: [
      'A road runs along the bottom of a side view. The air just above it is divided into stacked layers, each shaded a little darker as it gets nearer the road, and the layers are named as hot thin air below and cool air above.',
      'A patch of sky stands high on one side and an eye on the other. A bright speck sets off from the patch dragging a dark ray behind it, coming down at a slant.',
      'Once the ray is inside the layers it tilts a little flatter at every boundary it crosses, so that its path is a chain of small turns rather than one bend.',
      'Before it can touch the road the ray turns over and starts climbing again, crossing the same boundaries in reverse, and it comes up into the eye.',
      'A highlighted dashed line then grows out of the eye, straight, along the direction the light arrived from. It does not follow the curve; it runs on past it and goes through the road surface.',
      'At the far end of that dashed line, below the road, a patch of the same colour as the real sky appears, named as where the sky is seen.',
      'The curved path and the straight dashed line are on screen at the same time, parting from each other just beside the eye, so what the light did and what the eye assumes are side by side.',
      'The layers, the road, the eye and the patch of sky stay put through the whole round; the ray and the dashed line are cleared away and the round starts again.',
      'No angle and no index is written anywhere: what changes across the layers is shown by how much darker each one is drawn and by how much flatter the ray runs.',
    ],

    screen: {
      affordances: [
        'One ray sets off, curves, reaches the eye and is traced back, over and over, with nothing to press.',
        'The bending is drawn far stronger than it is over a real road, because at its true strength the whole path would look straight; what is kept faithful is the direction of the bending and where it puts the sky.',
        'The air is drawn as a stack of separate layers rather than a smooth change, so that each small turn can be seen happening at a place.',
        'Hot and cool are told apart by how dark one shade is drawn, not by warm and cool colours, so nothing in the picture invites the reader to read temperature off a hue.',
        'The real patch of sky and the patch seen below the road are drawn in the same colour, as two showings of one thing, while the highlighted colour is kept for the line the eye traces.',
        'The picture stops at the single ray and does not turn the sky patch upside down or spread it into a shimmering pool.',
        'The screen opens with the layers in place and the light just coming down.',
      ],
    },

    useWhen: [
      'The article has explained that a mirage is not water but sky, and the reader still pictures the road reflecting like a wet surface. Here the light never touches the road; it turns over above it, and that is the whole difference.',
      'The reader has been given refraction as something that happens at a boundary and is now asked to accept bending in open air. The stacked layers make the open air into many small boundaries, and the same small turn at each one adds up to a curve.',
      'The article is about why we place things where our line of sight points, whether or not the light came along it. The curved path and the straight traced line sit next to each other here and part company right at the eye.',
    ],

    avoidWhen: [
      'The article is about light crossing one flat surface between two materials, or about how many degrees it turns there. No single face does the work here.',
      'The subject is the angle at which light stops leaving a dense material. Nothing here is inside glass or water, and no threshold is written or marked.',
      'The article is about something under water looking raised, or about depth being read wrongly through a flat surface. The apparition here is put below the ground, not lifted toward the viewer.',
      'The point is that mirages of the distant kind show things upside down, or that several images stack above one another. One ray is followed and the patch it produces is the right way up.',
      'The subject is the shimmer and wobble over a hot surface, or convection carrying heat upward. The air here is still and the layers do not move.',
      'The article is about the sky being blue, about haze, or about light scattering off particles. Nothing here is scattered; one ray keeps its direction except where a layer turns it.',
    ],

    contrastWith: [
      {
        concept: 'snells-law',
        note: 'One sets out what a single face does to a ray and measures the turn there; the other has no face to point at, the turn being the sum of many tiny ones through air that changes as it goes.',
      },
      {
        concept: 'apparent-depth',
        note: 'Both end with the eye assigning light to the place its arriving direction points to, but one lifts a real object toward the viewer while the other puts a real patch of sky under the ground, where nothing is.',
      },
      {
        concept: 'total-internal-reflection',
        note: 'Both have light turned back instead of getting through, but one names a definite angle at a definite surface, and the other has the return happen gradually, with no surface and no angle to name.',
      },
    ],
  },
};
