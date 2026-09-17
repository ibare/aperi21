/**
 * 자동 생성 파일 — 직접 편집하지 말 것.
 *
 * 생성: pnpm catalog:gen  (scripts/gen-aperi21-catalog.mts)
 * 출처: 각 sim 의 schema(label/operation/category) + registerAperi21Bundles 의 loader id.
 *
 * 이 배열은 순수 데이터라 sim 의 무거운 시각화 chunk 를 참조하지 않는다.
 * 따라서 호스트는 이 카탈로그를 읽어도 sim 모듈을 로드하지 않는다 (lazy 보존).
 */

import type { Aperi21CatalogEntry } from './catalog-types.js';

export const APERI21_CATALOG: readonly Aperi21CatalogEntry[] = [
  {"id":"aperi21:apparent-brightness","title":{"ko":"겉보기 밝기","en":"Apparent brightness"},"description":{"ko":"같은 빛이 넓은 면에 나뉜다","en":"The same light divides over a wider area"},"domain":"astro"},
  {"id":"aperi21:dc-circuit","title":{"ko":"DC 회로","en":"DC Circuit"},"description":{"ko":"배터리·저항으로 단순·직렬·병렬 회로를 구성해 전압·전류를 확인.","en":"Build simple/series/parallel DC circuits with batteries and resistors; inspect V/I."},"domain":"electromagnetism"},
  {"id":"aperi21:current-magnetic-field","title":{"ko":"전류가 만드는 자기장","en":"The field a current makes"},"description":{"ko":"전선을 감아 도는 쪽으로 돌아서고, 멀수록 덜 돌아선다","en":"Needles turn along the loop, and less so farther out"},"domain":"em"},
  {"id":"aperi21:lenz-law","title":{"ko":"렌츠 법칙","en":"Lenz's law"},"description":{"ko":"전류는 뒤집혀도 힘은 늘 움직임을 거스른다","en":"The current flips, the force never does"},"domain":"em"},
  {"id":"aperi21:archimedes-principle","title":{"ko":"아르키메데스 원리 — 부력의 크기","en":"Archimedes principle — the size of the buoyant force"},"description":{"ko":"2.0 kg · 1.0 L 물체를 주둥이까지 가득 찬 물에 천천히 담근다. 밀려난 물이 주둥이로 넘쳐 컵에 모이고, 물체 쪽 저울이 줄어드는 만큼 넘친 물 쪽 저울이 늘어난다.","en":"A 2.0 kg, 1.0 L object is lowered into a can filled to its spout. The displaced water pours into the cup, and the scale holding the water gains exactly what the scale holding the object loses."},"domain":"fluids"},
  {"id":"aperi21:laminar-vs-turbulent","title":{"ko":"층류와 난류","en":"Laminar and turbulent flow"},"description":{"ko":"흐름이 갑자기 흐트러지는 지점","en":"Where flow suddenly breaks up"},"domain":"fluids"},
  {"id":"aperi21:pressure-and-container-shape","title":{"ko":"그릇 모양과 바닥 압력","en":"Container shape and bottom pressure"},"description":{"ko":"수면 높이를 옮겨 세 그릇을 다시 채운다","en":"Move the water level and refill all three"},"domain":"fluids"},
  {"id":"aperi21:pressure-isotropy","title":{"ko":"압력의 등방성","en":"Pressure isotropy"},"description":{"ko":"판이 저절로 반 바퀴 돌아 자취를 원으로 닫고, 그다음 독자가 다이얼로 직접 돌린다","en":"the plate turns half a revolution to close the trail into a circle, then the reader turns it by hand"},"domain":"fluids"},
  {"id":"aperi21:torricellis-law","title":{"ko":"토리첼리 법칙","en":"Torricelli's law"},"description":{"ko":"깊은 구멍일수록 더 빠르게 뿜는다","en":"The deeper the hole, the faster the jet"},"domain":"fluids"},
  {"id":"aperi21:acceleration-time-graph","title":{"ko":"가속도-시간 그래프","en":"Acceleration-time graph"},"description":{"ko":"넓이가 속도 변화인 표현","en":"The area under the graph is the change in velocity"},"domain":"kinematics"},
  {"id":"aperi21:angular-acceleration","title":{"ko":"각가속도","en":"Angular acceleration"},"description":{"ko":"같은 0.5초에 도는 각이 매번 더 커진다","en":"Each half-second sweeps a wider angle than the last"},"domain":"kinematics"},
  {"id":"aperi21:average-acceleration","title":{"ko":"평균 가속도","en":"Average acceleration"},"description":{"ko":"속도 변화의 비율","en":"Rate of change of velocity"},"domain":"kinematics"},
  {"id":"aperi21:average-velocity","title":{"ko":"평균 속도","en":"Average velocity"},"description":{"ko":"구간 전체를 대표하는 속도","en":"One velocity standing for a whole interval"},"domain":"kinematics"},
  {"id":"aperi21:centripetal-acceleration","title":{"ko":"구심 가속도","en":"Centripetal acceleration"},"description":{"ko":"속도의 변화는 늘 중심 쪽으로 꺾인다","en":"The change in velocity always turns toward the center"},"domain":"kinematics"},
  {"id":"aperi21:coordinate-choice","title":{"ko":"좌표계 선택","en":"Choosing axes"},"description":{"ko":"축을 어디에 두느냐가 식을 바꾸는 방식","en":"How the choice of axes changes the equations"},"domain":"kinematics"},
  {"id":"aperi21:direction-of-acceleration","title":{"ko":"가속도의 방향","en":"Direction of acceleration"},"description":{"ko":"속도와 같은 방향인지 반대인지가 정하는 것","en":"Whether it points with or against the velocity"},"domain":"kinematics"},
  {"id":"aperi21:free-fall","title":{"ko":"자유 낙하","en":"Free fall"},"description":{"ko":"무게가 달라도 두 공은 나란히 내려가 함께 닿는다","en":"However different their weights, the two balls fall together and land together"},"domain":"kinematics"},
  {"id":"aperi21:position-time-graph","title":{"ko":"위치-시간 그래프","en":"Position-time graph"},"description":{"ko":"빨리 오를수록 남기는 선이 가파르다","en":"The faster it rises, the steeper the line it leaves"},"domain":"kinematics"},
  {"id":"aperi21:projectile-motion","title":{"ko":"포물선 운동","en":"Projectile motion"},"description":{"ko":"수평과 연직이 서로를 건드리지 않고 따로 간다","en":"Horizontal and vertical go on untouched"},"domain":"kinematics"},
  {"id":"aperi21:radius-of-curvature","title":{"ko":"곡률 반지름","en":"Radius of curvature"},"description":{"ko":"굽은 정도에 맞는 원이 경로에 얹힌다","en":"A circle matching the bend rides the path"},"domain":"kinematics"},
  {"id":"aperi21:relative-velocity","title":{"ko":"상대 속도","en":"Relative velocity"},"description":{"ko":"보는 사람이 달라지면 배가 지나온 길이 기운다","en":"Change who is watching and the path the boat left tilts"},"domain":"kinematics"},
  {"id":"aperi21:river-crossing","title":{"ko":"강 건너기","en":"Crossing a river"},"description":{"ko":"뱃머리를 맞은편에 두어도 물살에 떠밀려 하류에 닿는다","en":"Aimed straight across, the boat is pushed downstream by the current"},"domain":"kinematics"},
  {"id":"aperi21:stopping-distance","title":{"ko":"정지 거리","en":"Stopping distance"},"description":{"ko":"반응 거리는 비례로, 제동 거리는 제곱으로 늘어난다","en":"Reaction grows linearly, braking as the square"},"domain":"kinematics"},
  {"id":"aperi21:tangential-normal-acceleration","title":{"ko":"접선·법선 가속도","en":"Tangential and normal acceleration"},"description":{"ko":"속력 변화와 방향 변화의 분리","en":"Separating change of speed from change of direction"},"domain":"kinematics"},
  {"id":"aperi21:terminal-velocity","title":{"ko":"종단 속도","en":"Terminal velocity"},"description":{"ko":"공기 저항이 중력을 따라잡는 순간부터 더 빨라지지 않는다","en":"It stops speeding up the moment drag catches gravity"},"domain":"kinematics"},
  {"id":"aperi21:uniform-motion","title":{"ko":"등속 운동","en":"Uniform motion"},"description":{"ko":"같은 시간에 같은 간격으로 자리를 옮긴다","en":"Equal intervals in equal times"},"domain":"kinematics"},
  {"id":"aperi21:uniformly-accelerated-motion","title":{"ko":"등가속도 운동","en":"Uniformly accelerated motion"},"description":{"ko":"같은 시간 동안 간 거리가 같은 만큼씩 늘어난다","en":"Distance in equal times grows by equal amounts"},"domain":"kinematics"},
  {"id":"aperi21:vector-addition","title":{"ko":"벡터의 합성","en":"Vector addition"},"description":{"ko":"나를 가의 머리에 옮겨 붙이고 이어 걸으면 그 끝이 합이다","en":"Slide b onto the head of a, walk both, and the far end is the sum"},"domain":"kinematics"},
  {"id":"aperi21:vector-decomposition","title":{"ko":"벡터의 성분 분해","en":"Vector components"},"description":{"ko":"끝점에서 두 축으로 곧게 내린 자리까지가 두 성분이다","en":"Drop straight from the tip to each axis — that is where each component ends"},"domain":"kinematics"},
  {"id":"aperi21:velocity-time-graph","title":{"ko":"속도-시간 그래프","en":"Velocity-time graph"},"description":{"ko":"그래프 아래 넓이가 간 거리다","en":"The area under the graph is the distance travelled"},"domain":"kinematics"},
  {"id":"aperi21:vertical-throw","title":{"ko":"연직 투상","en":"Vertical throw"},"description":{"ko":"올라갔다 내려오는 운동의 대칭","en":"The symmetry of going up and coming down"},"domain":"kinematics"},
  {"id":"aperi21:inertial-frame","title":{"ko":"관성 기준계","en":"Inertial frame"},"description":{"ko":"버스만 느려지고 승객은 그대로 간다","en":"Only the bus slows; the passenger keeps going"},"domain":"mechanics"},
  {"id":"aperi21:projectile","title":{"ko":"발사체","en":"Projectile"},"description":{"ko":"각도 다이얼 + 핀볼 런처","en":"Angle dial + pinball launcher"},"domain":"mechanics"},
  {"id":"aperi21:ramp-energy","title":{"ko":"경사면과 에너지","en":"Ramps and energy"},"description":{"ko":"길이 달라도 바닥에서의 속력은 같다","en":"Different paths, same speed at the bottom"},"domain":"mechanics"},
  {"id":"aperi21:ray-tracing","title":{"ko":"광선 추적","en":"Ray Tracing"},"description":{"ko":"광원과 렌즈·거울을 배치해 광선 경로와 결상을 관찰.","en":"Place source and lens/mirror to watch ray paths and image formation."},"domain":"optics"},
  {"id":"aperi21:pendulum-isochronism","title":{"ko":"진자의 등시성","en":"Isochronism of the pendulum"},"description":{"ko":"폭이 달라도 같은 박자로 돌아온다","en":"Different amplitudes, same beat"},"domain":"oscillation"},
  {"id":"aperi21:gas-pressure","title":{"ko":"기체 분자와 압력","en":"Molecules and pressure"},"description":{"ko":"두드림이 쌓여 압력이 된다","en":"Pressure is the sum of the knocks"},"domain":"thermal"},
  {"id":"aperi21:heat-conduction","title":{"ko":"열전도","en":"Heat conduction"},"description":{"ko":"쇠에서는 번져 나가고 나무에서는 머문다","en":"It spreads in steel and stays in wood"},"domain":"thermal"},
  {"id":"aperi21:beats","title":{"ko":"맥놀이","en":"Beats"},"description":{"ko":"두 음이 어긋나는 만큼 합이 지워진다","en":"The sum cancels as the two drift apart"},"domain":"waves"},
  {"id":"aperi21:doppler-effect","title":{"ko":"도플러 효과","en":"Doppler effect"},"description":{"ko":"원천이 방출점을 밀고 가 앞쪽 간격이 좁아진다","en":"The source drags its emission points, crowding the front"},"domain":"waves"},
];
