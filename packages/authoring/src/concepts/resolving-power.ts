/**
 * resolving-power 개념 선언.
 *
 * 회절 넷과 어휘가 닿지만 **주어가 둘**이다 — 한 무늬의 모양이 아니라 **두 무늬가 갈리느냐**다.
 *   resolving-power          주어 = 두 점. 주장 = 사이의 골이 사라지면 하나로 보이고,
 *                            구멍을 키우면 다시 갈린다
 *   single-slit-diffraction  주어 = 한 틈. 주장 = 가운데 띠가 어디서 끝나는가
 * 이쪽만 「두 점 · 갈린다 · 뭉친다 · 한계 · 구멍 지름 · 망원경」 어휘를 갖고, 틈 폭 · 띠 넓어짐 ·
 * 짝 짓기는 쓰지 않는다.
 *
 * 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const resolvingPowerConcept: Aperi21ConceptSource = {
  id: 'resolving-power',
  label: 'The Limit at Which Two Points Become One',
  canonicalSim: 'aperi21:resolving-power',

  surface: {
    definition:
      'The limit at which two separate points stop being seen as two: the dip between their patterns disappears once each peak has closed inside the other’s first dark ring, and a wider opening parts them again.',
    exemplarKeywords: [
      'resolving power',
      'Rayleigh criterion',
      'when do two stars look like a single one',
      'two distant headlights merging into one light',
      'telescope resolution',
      'a bigger mirror separates closer objects',
      'airy disc',
      'diffraction limit of an instrument',
      'aperture and the finest detail you can make out',
      'the two blobs have just barely come apart',
      'why a larger lens sees finer detail',
    ],
  },

  briefing: {
    observable: [
      'The upper half shows what lands on the screen: two round patches of light, each marked with the point it came from, inside a frame.',
      'The lower half plots brightness across the same horizontal positions, on the same axis as the picture above, so a dark place in the picture lies directly over a dip in the curve.',
      'Three curves are drawn there — one faint curve for each point on its own, and the strong curve of their sum. A strong-coloured bar stands at the middle of the sum and measures how deep the dip between the peaks is.',
      'Two marks sit on the axis at the first dark place of each single pattern, and a dashed line drops from each peak, so the peaks and the dark marks can be compared directly.',
      'The two points then move toward one another. The patches close in, the dip fills, and the bar measuring it grows shorter.',
      'At one moment each dashed peak line lands exactly on the other pattern’s dark mark. The patches are touching, the middle is only slightly darker than the rest, and a shallow dip and a short bar survive.',
      'They close further, the dashed lines pass inside the marks, and then the picture is a single blob of light and the sum has one peak — the bar is gone because there is no dip left to measure.',
      'The separation is then left alone and the opening on the left, drawn as a circle filled with light with its diameter marked, grows from two millimetres to five.',
      'As it grows the patches and the curves narrow, the dark marks retreat toward the peaks, the middle of the sum sinks, and the two patches come apart again with the dip and the bar standing once more.',
      'The point markers stay two throughout, even when the light has merged into one blob, and the opening then returns to its first size and the points part again.',
    ],

    screen: {
      affordances: [
        'The round runs by itself — points closing, merging, then the opening widening until they part — and repeats, with nothing to press.',
        'The picture and the curve share one horizontal axis, so the moment the blob looks single can be checked against the moment the dip disappears.',
        'The single-point curves are kept beneath the sum, which is what shows the dip as something built out of two overlapping patterns rather than a property of a blob.',
        'The strong colour is spent on the depth of the dip alone, so its shrinking to nothing is the claim being made, and the bar is simply not drawn once the dip is too shallow to count.',
        'The dark marks and the dashed peak lines meeting is the criterion itself, put on screen as two marks crossing rather than as a condition to be applied.',
        'The markers for the two points remain on the picture after the light has merged, which keeps it clear that what merged was the pattern and not the objects.',
        'The separations and the two opening diameters are fixed, and the diameters are the only figures given.',
      ],
    },

    useWhen: [
      'The article has stated a resolution criterion and the reader has no sense of what it looks like to be at it. The moment the peak line crosses the dark mark is shown together with the patches touching, so the criterion is watched being met.',
      'The point being made is that instruments are limited by the size of their opening rather than by magnification. Leaving the separation alone and widening the opening until the two come apart again is that argument in one stretch.',
      'The reader believes two things look single because they are too small, when the trouble is that each one is already spread into a patch. The single-point curves under the sum are what make that visible.',
    ],

    avoidWhen: [
      'The subject is one opening and how wide the pattern it leaves is. There are two point sources here throughout, and the opening is varied only to change how far each one spreads.',
      'The article is about magnifying power, focal length, eyepieces, or making an image bigger. Nothing here is magnified; what changes is the separation and the diameter of the opening.',
      'The point is that a real telescope is limited by the air, by tracking, or by how much light it gathers. Only the spreading of light through the opening limits anything here.',
      'The article needs the criterion as a formula, with the wavelength and the diameter in it, or wants an angle worked out. No formula and no angle appear; what is on screen is whether a dip is there.',
      'The two sources in question are producing a pattern together, with quiet places from their waves adding. The two patterns here simply add their brightnesses and never cancel.',
      'The subject is colour, or how resolution differs across wavelengths. One colour of light is used throughout.',
    ],

    contrastWith: [
      {
        concept: 'single-slit-diffraction',
        note: 'Both turn on the first dark place of the pattern an opening produces, and use it for opposite ends — one to bound a single pattern, the other to say when two patterns are still two.',
      },
      {
        concept: 'diffraction',
        note: 'One says light spreads past an opening at all; the other takes that spreading as the very thing that sets a limit on what can be told apart.',
      },
      {
        concept: 'pinhole-camera',
        note: 'Both relate the size of an opening to the sharpness of what is formed, in opposite directions — one has a smaller opening sharpen the picture by geometry, the other has it blur the picture by spreading.',
      },
      {
        concept: 'apparent-brightness',
        note: 'One asks whether two distant sources can be told apart at all; the other asks how much light one source delivers at a distance, whatever its size on the sky.',
      },
    ],
  },
};
