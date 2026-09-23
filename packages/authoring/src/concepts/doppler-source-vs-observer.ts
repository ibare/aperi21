/**
 * doppler-source-vs-observer 개념 선언.
 *
 * 「움직이는 음원」 세 형제 중 **누가 움직이는가의 비대칭**을 맡는다.
 *   doppler-source-vs-observer  주어 = **움직이는 쪽이 누구인가**. 주장 = 같은 빠르기로
 *                               가까워져도 **결과가 다르다** — 한쪽은 파장 자체가 짧아지고
 *                               한쪽은 파장 그대로 만나는 **횟수**만 는다
 *   doppler-effect              주어 = 이미 나간 파면들. 주장 = 앞 촘촘 · 뒤 성김
 *   shock-wave                  주어 = 소리를 앞지른 음원. 주장 = 원뿔 하나에 모인다
 *
 * 이쪽만 「누가 · 두 칸 · 같은 빠르기 · 만난 횟수 · 파장은 그대로」 어휘를 갖는다.
 * 앞뒤 비대칭 · 방출점 · 구급차는 쓰지 않는다 — 그것은 `doppler-effect` 의 그림이고,
 * 여기서는 음원 뒤쪽 이야기를 아예 하지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const dopplerSourceVsObserverConcept: Aperi21ConceptSource = {
  id: 'doppler-source-vs-observer',
  label: 'Same Closing Speed, Different Result Depending on Who Moves',
  canonicalSim: 'aperi21:doppler-source-vs-observer',

  surface: {
    definition:
      'Why closing the gap at one and the same speed gives two different answers: a travelling source shortens the wave itself, while a travelling listener leaves the wave alone and merely runs into more of them.',
    exemplarKeywords: [
      'moving source versus moving observer',
      'is it the same if the listener moves instead',
      'why are the two Doppler formulas different',
      'the asymmetry of the Doppler effect',
      'source approaching at the same speed as the listener approaching',
      'the wavelength itself gets shorter',
      'running towards the sound meets more crests',
      'who is moving matters',
      'only relative motion should matter but it does not',
      'the medium breaks the symmetry',
      'two ways of closing the same gap',
    ],
  },

  briefing: {
    observable: [
      'Two lanes are stacked one above the other, each holding a source at the left and a listener at the right, each titled with which of the two moves in it.',
      'In both lanes the source puts out rings at one and the same beat, and while nothing moves the two lanes are identical pictures of evenly spaced circles.',
      'At one moment both lanes start. In the upper lane the source sets off to the right; in the lower lane the listener sets off to the left. Above whichever party is moving rides an arrow, and the two arrows are of equal length and carry the same written speed, so the equality of the two cases is stated rather than assumed.',
      'In the upper lane the rings ahead of the travelling source close in on one another. In the lower lane the rings stay exactly as they were and the listener runs in towards them.',
      'Under each lane lies a strip covering one and the same stretch of time. Every time the leading edge of a ring reaches that lane’s listener, a tick is cut into the strip.',
      'The upper strip fills with more ticks than the lower one over the same stretch — eight against six — and the difference is a matter of counting rather than of impression.',
      'Everything then stops. In each lane a measured span is drawn across the two rings nearest that listener, and the two spans are named: the upper one by a symbol marked as altered, the lower one by the plain symbol, and the upper span is visibly the shorter.',
      'The ticks stay on the strips through that stopped picture, so the shortened spacing above and the crowded ticks above are on view together.',
      'A small ring blooms at a listener each time a front reaches it, and while nothing is moving the two lanes bloom in the same rhythm; once they start, the upper one blooms faster.',
      'A line of text below states in the end that above the wave itself grew shorter while below the wave was unchanged and only the rate of meeting rose.',
    ],

    screen: {
      affordances: [
        'The whole comparison runs by itself and repeats; nothing is pressed. The two lanes are laid out from the start rather than reached by altering one case into the other, so the difference sits in one frame instead of in a memory.',
        'Both lanes are given the same source beat, the same starting places and the same speed at the same instant, so the one thing that differs between them is which party is the one that moves.',
        'The moving party in each lane, and its arrow, carry the accent colour; everything else — rings, ticks, measured spans — is drawn alike in both lanes, so the lanes are told apart by their titles rather than by colour.',
        'What is heard is given as a count of ticks on a strip of fixed width, not as a figure, so the two results are compared by looking at two rows.',
        'The measured spans are drawn only in the stopped picture, since while the rings are still spreading the pair being measured would change every beat.',
        'The stretch of time before the counting begins is long enough for the first fronts made after the start to have reached the upper listener, so neither lane is counting fronts left over from before.',
        'The only figures written are the source beat and the one shared speed, both given as they were set.',
        'On arriving, the rings already fill both lanes and both parties are at rest.',
      ],
    },

    useWhen: [
      'The article has given the reader two different expressions for the shift and the reader is treating the difference as bookkeeping. Two lanes closing at one speed and filling their strips with different numbers of ticks is what makes the difference physical.',
      'The point being made is that the medium is a party to the matter, so that only the motion of each side relative to it counts, and a case is wanted where relative motion alone would predict one answer and the picture gives two.',
      'What is to be separated is a shortened wave from a faster arrival, and a stopped picture is wanted in which the two spacings can be laid against each other.',
    ],

    avoidWhen: [
      'The point is the contrast between the front and the back of one travelling source. Nothing here is said about what lies behind either source; both lanes look only forward.',
      'The article is about a source going faster than its own waves, or about a cone or a bang. Both movers here travel at half the speed of the waves.',
      'Figures are wanted for the shifted pitch, or the two expressions are to be worked through. No result is written as a number; what is written is the one speed and the source’s own beat.',
      'The subject is light, where there is no medium to move with respect to and the asymmetry does not arise.',
      'The article needs only the plain statement that approaching raises a pitch, with no interest in which party moves. Two lanes will then be answering a question that has not been asked.',
      'The reader is to explore other speeds, or the case where the two speeds differ. One shared speed is fixed throughout and nothing can be altered.',
    ],

    contrastWith: [
      {
        concept: 'doppler-effect',
        note: 'One asks whether it matters which party moves and holds two cases against each other; the other takes a single travelling source and shows the whole asymmetry around it, crowded ahead and thinned behind.',
      },
      {
        concept: 'shock-wave',
        note: 'Both follow a source among the fronts it has sent, but one keeps it at half the wave speed to compare it with a moving listener, while the other pushes it past the wave speed and gets a shape no listener is needed to see.',
      },
      {
        concept: 'relative-velocity',
        note: 'One is a case where taking only the difference of the two velocities gives the wrong answer, because the medium is a third party; the other is the ordinary case where that difference is the whole of it.',
      },
      {
        concept: 'reference-frame',
        note: 'Both turn on who is taken to be moving, but one has a medium that settles the question from outside, so the two descriptions are not interchangeable.',
      },
    ],
  },
};
