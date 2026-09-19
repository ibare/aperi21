/**
 * @aperi21/bootstrap — 카탈로그 단일 출처.
 *
 * 정적 부트스트랩:
 *  - installAperi21Plugins(host): 외부 호스트가 만든 Host 인스턴스에 도메인
 *    플러그인(optics, circuit) 을 등록한다. 이미 같은 plugin 이 등록되어
 *    있으면 PluginManager 가 throw 하므로, 호출자가 1회만 부르면 된다.
 *
 * 동적 부트스트랩:
 *  - registerAperi21Bundles(): bundle 패키지를 lazy loader 로 등록한다.
 *    각 import() 가 번들러의 dynamic import 경계로 인식되어 bundle 별 chunk
 *    로 분리된다. 호스트 Vite/Rollup 가 그 chunk 그래프를 그대로 이어받는다.
 *
 * 편의용:
 *  - getAperi21Catalog(locale): sim 을 로드하지 않고 추가 가능 목록을 한 언어로 조회.
 *  - loadFrameworkMessages(locale): 프레임워크 문구 번들을 host 에 등록.
 *  - bootstrapAperi21(host?): registerAperi21Bundles 를 호출하고, host 가
 *    주어지면 installAperi21Plugins(host) 도 함께 호출. 외부 호스트가 한 번에
 *    부팅하기 위한 단일 진입점.
 *
 * 소비자:
 *  - apps/catalog (dev) — EngineProvider 에서 호출
 *  - @aperi21/host-tiptap-bundle (외부 호스트 tarball) — re-export
 */

import {
  registerBundle,
  registerBundleLoader,
  type Host,
} from '@aperi21/host';

let bundlesRegistered = false;

export function registerAperi21Bundles(): void {
  if (bundlesRegistered) return;
  bundlesRegistered = true;

  // 각 loader 는 조각과 **그 조각이 쓰는 능력**을 함께 가져온다.
  //
  // 능력 파일은 `pnpm gen:capabilities` 가 선언에서 뽑아 만든다. sim 이 아니라
  // 여기 있는 이유는 sim 이 `@aperi21/host` 를 알면 의존 방향이 뒤집히기
  // 때문이다 (원칙 1). 배선은 bootstrap 의 일이다.
  //
  // 둘 다 dynamic import 라 번들러가 조각 chunk 로 가른다 — 조각을 열지 않은
  // 독자는 그 조각의 능력도 받지 않는다 (R10).

  registerBundleLoader('aperi21:projectile', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-projectile'),
      import('./capabilities/physics/projectile.generated.js'),
    ]);
    return registerBundle('aperi21:projectile', m.projectileBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:ray-tracing', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-ray-tracing'),
      import('./capabilities/optics/ray-tracing.generated.js'),
    ]);
    return registerBundle('aperi21:ray-tracing', m.rayTracingBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:dc-circuit', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-dc-circuit'),
      import('./capabilities/electronics/dc-circuit.generated.js'),
    ]);
    return registerBundle('aperi21:dc-circuit', m.dcCircuitBundle, caps.capabilities);
  });

  // 유체 조각 3종 (2026-09-09 첫 배치).
  registerBundleLoader('aperi21:pressure-isotropy', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-pressure-isotropy'),
      import('./capabilities/fluids/pressure-isotropy.generated.js'),
    ]);
    return registerBundle('aperi21:pressure-isotropy', m.pressureIsotropyBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:pressure-and-container-shape', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-pressure-and-container-shape'),
      import('./capabilities/fluids/pressure-and-container-shape.generated.js'),
    ]);
    return registerBundle(
      'aperi21:pressure-and-container-shape',
      m.pressureAndContainerShapeBundle,
      caps.capabilities,
    );
  });

  registerBundleLoader('aperi21:torricellis-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-torricellis-law'),
      import('./capabilities/fluids/torricellis-law.generated.js'),
    ]);
    return registerBundle('aperi21:torricellis-law', m.torricellisLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:laminar-vs-turbulent', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-laminar-vs-turbulent'),
      import('./capabilities/fluids/laminar-vs-turbulent.generated.js'),
    ]);
    return registerBundle(
      'aperi21:laminar-vs-turbulent',
      m.laminarVsTurbulentBundle,
      caps.capabilities,
    );
  });

  // 운동학 (2026-09-10 파일럿 배치).
  registerBundleLoader('aperi21:centripetal-acceleration', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-centripetal-acceleration'),
      import('./capabilities/kinematics/centripetal-acceleration.generated.js'),
    ]);
    return registerBundle(
      'aperi21:centripetal-acceleration',
      m.centripetalAccelerationBundle,
      caps.capabilities,
    );
  });

  registerBundleLoader('aperi21:velocity-time-graph', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-velocity-time-graph'),
      import('./capabilities/kinematics/velocity-time-graph.generated.js'),
    ]);
    return registerBundle('aperi21:velocity-time-graph', m.velocityTimeGraphBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:position-time-graph', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-position-time-graph'),
      import('./capabilities/kinematics/position-time-graph.generated.js'),
    ]);
    return registerBundle('aperi21:position-time-graph', m.positionTimeGraphBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:coordinate-choice', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-coordinate-choice'),
      import('./capabilities/kinematics/coordinate-choice.generated.js'),
    ]);
    return registerBundle('aperi21:coordinate-choice', m.coordinateChoiceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:average-velocity', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-average-velocity'),
      import('./capabilities/kinematics/average-velocity.generated.js'),
    ]);
    return registerBundle('aperi21:average-velocity', m.averageVelocityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:average-acceleration', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-average-acceleration'),
      import('./capabilities/kinematics/average-acceleration.generated.js'),
    ]);
    return registerBundle('aperi21:average-acceleration', m.averageAccelerationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:direction-of-acceleration', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-direction-of-acceleration'),
      import('./capabilities/kinematics/direction-of-acceleration.generated.js'),
    ]);
    return registerBundle('aperi21:direction-of-acceleration', m.directionOfAccelerationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:uniformly-accelerated-motion', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-uniformly-accelerated-motion'),
      import('./capabilities/kinematics/uniformly-accelerated-motion.generated.js'),
    ]);
    return registerBundle('aperi21:uniformly-accelerated-motion', m.uniformlyAcceleratedMotionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:acceleration-time-graph', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-acceleration-time-graph'),
      import('./capabilities/kinematics/acceleration-time-graph.generated.js'),
    ]);
    return registerBundle('aperi21:acceleration-time-graph', m.accelerationTimeGraphBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:vertical-throw', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-vertical-throw'),
      import('./capabilities/kinematics/vertical-throw.generated.js'),
    ]);
    return registerBundle('aperi21:vertical-throw', m.verticalThrowBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:vector-decomposition', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-vector-decomposition'),
      import('./capabilities/kinematics/vector-decomposition.generated.js'),
    ]);
    return registerBundle('aperi21:vector-decomposition', m.vectorDecompositionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:river-crossing', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-river-crossing'),
      import('./capabilities/kinematics/river-crossing.generated.js'),
    ]);
    return registerBundle('aperi21:river-crossing', m.riverCrossingBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:tangential-normal-acceleration', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-tangential-normal-acceleration'),
      import('./capabilities/kinematics/tangential-normal-acceleration.generated.js'),
    ]);
    return registerBundle('aperi21:tangential-normal-acceleration', m.tangentialNormalAccelerationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:reference-frame', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-reference-frame'),
      import('./capabilities/kinematics/reference-frame.generated.js'),
    ]);
    return registerBundle('aperi21:reference-frame', m.referenceFrameBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:gravitational-acceleration', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-gravitational-acceleration'),
      import('./capabilities/kinematics/gravitational-acceleration.generated.js'),
    ]);
    return registerBundle('aperi21:gravitational-acceleration', m.gravitationalAccelerationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:trajectory-equation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-trajectory-equation'),
      import('./capabilities/kinematics/trajectory-equation.generated.js'),
    ]);
    return registerBundle('aperi21:trajectory-equation', m.trajectoryEquationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:uniform-circular-motion', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-uniform-circular-motion'),
      import('./capabilities/kinematics/uniform-circular-motion.generated.js'),
    ]);
    return registerBundle('aperi21:uniform-circular-motion', m.uniformCircularMotionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:newtons-second-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-newtons-second-law'),
      import('./capabilities/mechanics/newtons-second-law.generated.js'),
    ]);
    return registerBundle('aperi21:newtons-second-law', m.newtonsSecondLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:newtons-third-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-newtons-third-law'),
      import('./capabilities/mechanics/newtons-third-law.generated.js'),
    ]);
    return registerBundle('aperi21:newtons-third-law', m.newtonsThirdLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:net-force', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-net-force'),
      import('./capabilities/mechanics/net-force.generated.js'),
    ]);
    return registerBundle('aperi21:net-force', m.netForceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:static-friction', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-static-friction'),
      import('./capabilities/mechanics/static-friction.generated.js'),
    ]);
    return registerBundle('aperi21:static-friction', m.staticFrictionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:inclined-plane', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-inclined-plane'),
      import('./capabilities/mechanics/inclined-plane.generated.js'),
    ]);
    return registerBundle('aperi21:inclined-plane', m.inclinedPlaneBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:apparent-weight', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-apparent-weight'),
      import('./capabilities/mechanics/apparent-weight.generated.js'),
    ]);
    return registerBundle('aperi21:apparent-weight', m.apparentWeightBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:atwood-machine', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-atwood-machine'),
      import('./capabilities/mechanics/atwood-machine.generated.js'),
    ]);
    return registerBundle('aperi21:atwood-machine', m.atwoodMachineBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:centripetal-force', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-centripetal-force'),
      import('./capabilities/mechanics/centripetal-force.generated.js'),
    ]);
    return registerBundle('aperi21:centripetal-force', m.centripetalForceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:coriolis-effect', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-coriolis-effect'),
      import('./capabilities/mechanics/coriolis-effect.generated.js'),
    ]);
    return registerBundle('aperi21:coriolis-effect', m.coriolisEffectBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:balance-scale', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-balance-scale'),
      import('./capabilities/mechanics/balance-scale.generated.js'),
    ]);
    return registerBundle('aperi21:balance-scale', m.balanceScaleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:free-body-diagram', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-free-body-diagram'),
      import('./capabilities/mechanics/free-body-diagram.generated.js'),
    ]);
    return registerBundle('aperi21:free-body-diagram', m.freeBodyDiagramBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:pulley-system', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-pulley-system'),
      import('./capabilities/mechanics/pulley-system.generated.js'),
    ]);
    return registerBundle('aperi21:pulley-system', m.pulleySystemBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:spring-force', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-spring-force'),
      import('./capabilities/mechanics/spring-force.generated.js'),
    ]);
    return registerBundle('aperi21:spring-force', m.springForceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:vertical-loop', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-vertical-loop'),
      import('./capabilities/mechanics/vertical-loop.generated.js'),
    ]);
    return registerBundle('aperi21:vertical-loop', m.verticalLoopBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:drag-force', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-drag-force'),
      import('./capabilities/mechanics/drag-force.generated.js'),
    ]);
    return registerBundle('aperi21:drag-force', m.dragForceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:non-inertial-frame', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-non-inertial-frame'),
      import('./capabilities/mechanics/non-inertial-frame.generated.js'),
    ]);
    return registerBundle('aperi21:non-inertial-frame', m.nonInertialFrameBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:impulse-force-relation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-impulse-force-relation'),
      import('./capabilities/mechanics/impulse-force-relation.generated.js'),
    ]);
    return registerBundle('aperi21:impulse-force-relation', m.impulseForceRelationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:mechanical-advantage', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-mechanical-advantage'),
      import('./capabilities/mechanics/mechanical-advantage.generated.js'),
    ]);
    return registerBundle('aperi21:mechanical-advantage', m.mechanicalAdvantageBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:stress-strain-curve', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-stress-strain-curve'),
      import('./capabilities/mechanics/stress-strain-curve.generated.js'),
    ]);
    return registerBundle('aperi21:stress-strain-curve', m.stressStrainCurveBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:banked-curve', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-banked-curve'),
      import('./capabilities/mechanics/banked-curve.generated.js'),
    ]);
    return registerBundle('aperi21:banked-curve', m.bankedCurveBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:buoyant-force-as-force', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-buoyant-force-as-force'),
      import('./capabilities/mechanics/buoyant-force-as-force.generated.js'),
    ]);
    return registerBundle('aperi21:buoyant-force-as-force', m.buoyantForceAsForceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:kinetic-friction', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-kinetic-friction'),
      import('./capabilities/mechanics/kinetic-friction.generated.js'),
    ]);
    return registerBundle('aperi21:kinetic-friction', m.kineticFrictionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:equilibrium-of-forces', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-equilibrium-of-forces'),
      import('./capabilities/mechanics/equilibrium-of-forces.generated.js'),
    ]);
    return registerBundle('aperi21:equilibrium-of-forces', m.equilibriumOfForcesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:inertial-vs-gravitational-mass', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-inertial-vs-gravitational-mass'),
      import('./capabilities/mechanics/inertial-vs-gravitational-mass.generated.js'),
    ]);
    return registerBundle('aperi21:inertial-vs-gravitational-mass', m.inertialVsGravitationalMassBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:tension', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-tension'),
      import('./capabilities/mechanics/tension.generated.js'),
    ]);
    return registerBundle('aperi21:tension', m.tensionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:fictitious-force', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-fictitious-force'),
      import('./capabilities/mechanics/fictitious-force.generated.js'),
    ]);
    return registerBundle('aperi21:fictitious-force', m.fictitiousForceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:youngs-modulus', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-youngs-modulus'),
      import('./capabilities/mechanics/youngs-modulus.generated.js'),
    ]);
    return registerBundle('aperi21:youngs-modulus', m.youngsModulusBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:normal-force', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-normal-force'),
      import('./capabilities/mechanics/normal-force.generated.js'),
    ]);
    return registerBundle('aperi21:normal-force', m.normalForceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:angle-of-friction', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-angle-of-friction'),
      import('./capabilities/mechanics/angle-of-friction.generated.js'),
    ]);
    return registerBundle('aperi21:angle-of-friction', m.angleOfFrictionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:connected-bodies', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-connected-bodies'),
      import('./capabilities/mechanics/connected-bodies.generated.js'),
    ]);
    return registerBundle('aperi21:connected-bodies', m.connectedBodiesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:conical-pendulum', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-conical-pendulum'),
      import('./capabilities/mechanics/conical-pendulum.generated.js'),
    ]);
    return registerBundle('aperi21:conical-pendulum', m.conicalPendulumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:energy-flow-diagram', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-energy-flow-diagram'),
      import('./capabilities/mechanics/energy-flow-diagram.generated.js'),
    ]);
    return registerBundle('aperi21:energy-flow-diagram', m.energyFlowDiagramBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:phase-space', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-phase-space'),
      import('./capabilities/oscillation/phase-space.generated.js'),
    ]);
    return registerBundle('aperi21:phase-space', m.phaseSpaceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:tidal-force', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-tidal-force'),
      import('./capabilities/astro/tidal-force.generated.js'),
    ]);
    return registerBundle('aperi21:tidal-force', m.tidalForceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:bernoullis-principle', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-bernoullis-principle'),
      import('./capabilities/fluids/bernoullis-principle.generated.js'),
    ]);
    return registerBundle('aperi21:bernoullis-principle', m.bernoullisPrincipleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:maxwell-boltzmann-distribution', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-maxwell-boltzmann-distribution'),
      import('./capabilities/thermal/maxwell-boltzmann-distribution.generated.js'),
    ]);
    return registerBundle('aperi21:maxwell-boltzmann-distribution', m.maxwellBoltzmannDistributionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:interference', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-interference'),
      import('./capabilities/waves/interference.generated.js'),
    ]);
    return registerBundle('aperi21:interference', m.interferenceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:color-addition', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-color-addition'),
      import('./capabilities/optics/color-addition.generated.js'),
    ]);
    return registerBundle('aperi21:color-addition', m.colorAdditionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:field-lines', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-field-lines'),
      import('./capabilities/em/field-lines.generated.js'),
    ]);
    return registerBundle('aperi21:field-lines', m.fieldLinesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:spacetime-diagram', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-spacetime-diagram'),
      import('./capabilities/modern/spacetime-diagram.generated.js'),
    ]);
    return registerBundle('aperi21:spacetime-diagram', m.spacetimeDiagramBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:potential-energy-curve', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-potential-energy-curve'),
      import('./capabilities/mechanics/potential-energy-curve.generated.js'),
    ]);
    return registerBundle('aperi21:potential-energy-curve', m.potentialEnergyCurveBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:gyroscopic-precession', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-gyroscopic-precession'),
      import('./capabilities/oscillation/gyroscopic-precession.generated.js'),
    ]);
    return registerBundle('aperi21:gyroscopic-precession', m.gyroscopicPrecessionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:hr-diagram', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-hr-diagram'),
      import('./capabilities/astro/hr-diagram.generated.js'),
    ]);
    return registerBundle('aperi21:hr-diagram', m.hrDiagramBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:lift-force', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-lift-force'),
      import('./capabilities/fluids/lift-force.generated.js'),
    ]);
    return registerBundle('aperi21:lift-force', m.liftForceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:carnot-cycle', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-carnot-cycle'),
      import('./capabilities/thermal/carnot-cycle.generated.js'),
    ]);
    return registerBundle('aperi21:carnot-cycle', m.carnotCycleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:longitudinal-wave', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-longitudinal-wave'),
      import('./capabilities/waves/longitudinal-wave.generated.js'),
    ]);
    return registerBundle('aperi21:longitudinal-wave', m.longitudinalWaveBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:thin-film-interference', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-thin-film-interference'),
      import('./capabilities/optics/thin-film-interference.generated.js'),
    ]);
    return registerBundle('aperi21:thin-film-interference', m.thinFilmInterferenceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:equipotential-surface', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-equipotential-surface'),
      import('./capabilities/em/equipotential-surface.generated.js'),
    ]);
    return registerBundle('aperi21:equipotential-surface', m.equipotentialSurfaceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:atomic-orbital', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-atomic-orbital'),
      import('./capabilities/modern/atomic-orbital.generated.js'),
    ]);
    return registerBundle('aperi21:atomic-orbital', m.atomicOrbitalBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:normal-modes', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-normal-modes'),
      import('./capabilities/oscillation/normal-modes.generated.js'),
    ]);
    return registerBundle('aperi21:normal-modes', m.normalModesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:moon-phases', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-moon-phases'),
      import('./capabilities/astro/moon-phases.generated.js'),
    ]);
    return registerBundle('aperi21:moon-phases', m.moonPhasesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:poiseuille-flow', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-poiseuille-flow'),
      import('./capabilities/fluids/poiseuille-flow.generated.js'),
    ]);
    return registerBundle('aperi21:poiseuille-flow', m.poiseuilleFlowBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:thermal-convection', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-thermal-convection'),
      import('./capabilities/thermal/thermal-convection.generated.js'),
    ]);
    return registerBundle('aperi21:thermal-convection', m.thermalConvectionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:huygens-principle', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-huygens-principle'),
      import('./capabilities/waves/huygens-principle.generated.js'),
    ]);
    return registerBundle('aperi21:huygens-principle', m.huygensPrincipleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:polarization', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-polarization'),
      import('./capabilities/optics/polarization.generated.js'),
    ]);
    return registerBundle('aperi21:polarization', m.polarizationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:electromagnetic-wave', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-electromagnetic-wave'),
      import('./capabilities/em/electromagnetic-wave.generated.js'),
    ]);
    return registerBundle('aperi21:electromagnetic-wave', m.electromagneticWaveBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:double-slit-with-electrons', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-double-slit-with-electrons'),
      import('./capabilities/modern/double-slit-with-electrons.generated.js'),
    ]);
    return registerBundle('aperi21:double-slit-with-electrons', m.doubleSlitWithElectronsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:resonance', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-resonance'),
      import('./capabilities/oscillation/resonance.generated.js'),
    ]);
    return registerBundle('aperi21:resonance', m.resonanceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:keplers-second-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-keplers-second-law'),
      import('./capabilities/astro/keplers-second-law.generated.js'),
    ]);
    return registerBundle('aperi21:keplers-second-law', m.keplersSecondLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:capillary-action', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-capillary-action'),
      import('./capabilities/fluids/capillary-action.generated.js'),
    ]);
    return registerBundle('aperi21:capillary-action', m.capillaryActionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:phase-diagram', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-phase-diagram'),
      import('./capabilities/thermal/phase-diagram.generated.js'),
    ]);
    return registerBundle('aperi21:phase-diagram', m.phaseDiagramBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:standing-wave', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-standing-wave'),
      import('./capabilities/waves/standing-wave.generated.js'),
    ]);
    return registerBundle('aperi21:standing-wave', m.standingWaveBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:youngs-double-slit', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-youngs-double-slit'),
      import('./capabilities/optics/youngs-double-slit.generated.js'),
    ]);
    return registerBundle('aperi21:youngs-double-slit', m.youngsDoubleSlitBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:rc-circuit', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-rc-circuit'),
      import('./capabilities/em/rc-circuit.generated.js'),
    ]);
    return registerBundle('aperi21:rc-circuit', m.rcCircuitBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:hydrogen-spectrum', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-hydrogen-spectrum'),
      import('./capabilities/modern/hydrogen-spectrum.generated.js'),
    ]);
    return registerBundle('aperi21:hydrogen-spectrum', m.hydrogenSpectrumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:moment-of-inertia', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-moment-of-inertia'),
      import('./capabilities/oscillation/moment-of-inertia.generated.js'),
    ]);
    return registerBundle('aperi21:moment-of-inertia', m.momentOfInertiaBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:lagrange-points', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-lagrange-points'),
      import('./capabilities/astro/lagrange-points.generated.js'),
    ]);
    return registerBundle('aperi21:lagrange-points', m.lagrangePointsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:stability-of-floating-body', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-stability-of-floating-body'),
      import('./capabilities/fluids/stability-of-floating-body.generated.js'),
    ]);
    return registerBundle('aperi21:stability-of-floating-body', m.stabilityOfFloatingBodyBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:refraction-of-waves', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-refraction-of-waves'),
      import('./capabilities/waves/refraction-of-waves.generated.js'),
    ]);
    return registerBundle('aperi21:refraction-of-waves', m.refractionOfWavesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:total-internal-reflection', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-total-internal-reflection'),
      import('./capabilities/optics/total-internal-reflection.generated.js'),
    ]);
    return registerBundle('aperi21:total-internal-reflection', m.totalInternalReflectionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:seeing-requires-light', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-seeing-requires-light'),
      import('./capabilities/optics/seeing-requires-light.generated.js'),
    ]);
    return registerBundle('aperi21:seeing-requires-light', m.seeingRequiresLightBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:law-of-reflection', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-law-of-reflection'),
      import('./capabilities/optics/law-of-reflection.generated.js'),
    ]);
    return registerBundle('aperi21:law-of-reflection', m.lawOfReflectionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:snells-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-snells-law'),
      import('./capabilities/optics/snells-law.generated.js'),
    ]);
    return registerBundle('aperi21:snells-law', m.snellsLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:converging-diverging-lens', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-converging-diverging-lens'),
      import('./capabilities/optics/converging-diverging-lens.generated.js'),
    ]);
    return registerBundle('aperi21:converging-diverging-lens', m.convergingDivergingLensBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:single-slit-diffraction', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-single-slit-diffraction'),
      import('./capabilities/optics/single-slit-diffraction.generated.js'),
    ]);
    return registerBundle('aperi21:single-slit-diffraction', m.singleSlitDiffractionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:malus-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-malus-law'),
      import('./capabilities/optics/malus-law.generated.js'),
    ]);
    return registerBundle('aperi21:malus-law', m.malusLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:rectilinear-propagation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-rectilinear-propagation'),
      import('./capabilities/optics/rectilinear-propagation.generated.js'),
    ]);
    return registerBundle('aperi21:rectilinear-propagation', m.rectilinearPropagationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:specular-diffuse-reflection', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-specular-diffuse-reflection'),
      import('./capabilities/optics/specular-diffuse-reflection.generated.js'),
    ]);
    return registerBundle('aperi21:specular-diffuse-reflection', m.specularDiffuseReflectionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:apparent-depth', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-apparent-depth'),
      import('./capabilities/optics/apparent-depth.generated.js'),
    ]);
    return registerBundle('aperi21:apparent-depth', m.apparentDepthBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:magnification', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-magnification'),
      import('./capabilities/optics/magnification.generated.js'),
    ]);
    return registerBundle('aperi21:magnification', m.magnificationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:diffraction-grating', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-diffraction-grating'),
      import('./capabilities/optics/diffraction-grating.generated.js'),
    ]);
    return registerBundle('aperi21:diffraction-grating', m.diffractionGratingBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:rayleigh-scattering', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-rayleigh-scattering'),
      import('./capabilities/optics/rayleigh-scattering.generated.js'),
    ]);
    return registerBundle('aperi21:rayleigh-scattering', m.rayleighScatteringBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:shadow-umbra-penumbra', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-shadow-umbra-penumbra'),
      import('./capabilities/optics/shadow-umbra-penumbra.generated.js'),
    ]);
    return registerBundle('aperi21:shadow-umbra-penumbra', m.shadowUmbraPenumbraBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:plane-mirror-image', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-plane-mirror-image'),
      import('./capabilities/optics/plane-mirror-image.generated.js'),
    ]);
    return registerBundle('aperi21:plane-mirror-image', m.planeMirrorImageBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:optical-fiber', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-optical-fiber'),
      import('./capabilities/optics/optical-fiber.generated.js'),
    ]);
    return registerBundle('aperi21:optical-fiber', m.opticalFiberBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:real-vs-virtual-image', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-real-vs-virtual-image'),
      import('./capabilities/optics/real-vs-virtual-image.generated.js'),
    ]);
    return registerBundle('aperi21:real-vs-virtual-image', m.realVsVirtualImageBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:newtons-rings', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-newtons-rings'),
      import('./capabilities/optics/newtons-rings.generated.js'),
    ]);
    return registerBundle('aperi21:newtons-rings', m.newtonsRingsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:brewster-angle', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-brewster-angle'),
      import('./capabilities/optics/brewster-angle.generated.js'),
    ]);
    return registerBundle('aperi21:brewster-angle', m.brewsterAngleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:pinhole-camera', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-pinhole-camera'),
      import('./capabilities/optics/pinhole-camera.generated.js'),
    ]);
    return registerBundle('aperi21:pinhole-camera', m.pinholeCameraBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:multiple-mirror-images', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-multiple-mirror-images'),
      import('./capabilities/optics/multiple-mirror-images.generated.js'),
    ]);
    return registerBundle('aperi21:multiple-mirror-images', m.multipleMirrorImagesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:mirage', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-mirage'),
      import('./capabilities/optics/mirage.generated.js'),
    ]);
    return registerBundle('aperi21:mirage', m.mirageBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:lens-combination', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-lens-combination'),
      import('./capabilities/optics/lens-combination.generated.js'),
    ]);
    return registerBundle('aperi21:lens-combination', m.lensCombinationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:resolving-power', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-resolving-power'),
      import('./capabilities/optics/resolving-power.generated.js'),
    ]);
    return registerBundle('aperi21:resolving-power', m.resolvingPowerBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:birefringence', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-birefringence'),
      import('./capabilities/optics/birefringence.generated.js'),
    ]);
    return registerBundle('aperi21:birefringence', m.birefringenceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:object-color', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-object-color'),
      import('./capabilities/optics/object-color.generated.js'),
    ]);
    return registerBundle('aperi21:object-color', m.objectColorBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:concave-mirror', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-concave-mirror'),
      import('./capabilities/optics/concave-mirror.generated.js'),
    ]);
    return registerBundle('aperi21:concave-mirror', m.concaveMirrorBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:dispersion', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-dispersion'),
      import('./capabilities/optics/dispersion.generated.js'),
    ]);
    return registerBundle('aperi21:dispersion', m.dispersionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:spherical-aberration', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-spherical-aberration'),
      import('./capabilities/optics/spherical-aberration.generated.js'),
    ]);
    return registerBundle('aperi21:spherical-aberration', m.sphericalAberrationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:scattering', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-scattering'),
      import('./capabilities/optics/scattering.generated.js'),
    ]);
    return registerBundle('aperi21:scattering', m.scatteringBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:light-through-materials', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-light-through-materials'),
      import('./capabilities/optics/light-through-materials.generated.js'),
    ]);
    return registerBundle('aperi21:light-through-materials', m.lightThroughMaterialsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:convex-mirror', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-convex-mirror'),
      import('./capabilities/optics/convex-mirror.generated.js'),
    ]);
    return registerBundle('aperi21:convex-mirror', m.convexMirrorBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:prism', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-prism'),
      import('./capabilities/optics/prism.generated.js'),
    ]);
    return registerBundle('aperi21:prism', m.prismBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:human-eye-accommodation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-human-eye-accommodation'),
      import('./capabilities/optics/human-eye-accommodation.generated.js'),
    ]);
    return registerBundle('aperi21:human-eye-accommodation', m.humanEyeAccommodationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:rainbow', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-rainbow'),
      import('./capabilities/optics/rainbow.generated.js'),
    ]);
    return registerBundle('aperi21:rainbow', m.rainbowBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:chromatic-aberration', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-chromatic-aberration'),
      import('./capabilities/optics/chromatic-aberration.generated.js'),
    ]);
    return registerBundle('aperi21:chromatic-aberration', m.chromaticAberrationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:myopia-hyperopia', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-myopia-hyperopia'),
      import('./capabilities/optics/myopia-hyperopia.generated.js'),
    ]);
    return registerBundle('aperi21:myopia-hyperopia', m.myopiaHyperopiaBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:magnifying-glass', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-magnifying-glass'),
      import('./capabilities/optics/magnifying-glass.generated.js'),
    ]);
    return registerBundle('aperi21:magnifying-glass', m.magnifyingGlassBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:microscope', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-microscope'),
      import('./capabilities/optics/microscope.generated.js'),
    ]);
    return registerBundle('aperi21:microscope', m.microscopeBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:telescope', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-telescope'),
      import('./capabilities/optics/telescope.generated.js'),
    ]);
    return registerBundle('aperi21:telescope', m.telescopeBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:charged-particle-in-magnetic-field', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-charged-particle-in-magnetic-field'),
      import('./capabilities/em/charged-particle-in-magnetic-field.generated.js'),
    ]);
    return registerBundle('aperi21:charged-particle-in-magnetic-field', m.chargedParticleInMagneticFieldBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:radioactive-decay', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-radioactive-decay'),
      import('./capabilities/modern/radioactive-decay.generated.js'),
    ]);
    return registerBundle('aperi21:radioactive-decay', m.radioactiveDecayBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:time-dilation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-time-dilation'),
      import('./capabilities/modern/time-dilation.generated.js'),
    ]);
    return registerBundle('aperi21:time-dilation', m.timeDilationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:equivalence-principle', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-equivalence-principle'),
      import('./capabilities/modern/equivalence-principle.generated.js'),
    ]);
    return registerBundle('aperi21:equivalence-principle', m.equivalencePrincipleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:photoelectric-effect', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-photoelectric-effect'),
      import('./capabilities/modern/photoelectric-effect.generated.js'),
    ]);
    return registerBundle('aperi21:photoelectric-effect', m.photoelectricEffectBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:de-broglie-wavelength', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-de-broglie-wavelength'),
      import('./capabilities/modern/de-broglie-wavelength.generated.js'),
    ]);
    return registerBundle('aperi21:de-broglie-wavelength', m.deBroglieWavelengthBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:bohr-model', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-bohr-model'),
      import('./capabilities/modern/bohr-model.generated.js'),
    ]);
    return registerBundle('aperi21:bohr-model', m.bohrModelBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:nuclear-structure', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-nuclear-structure'),
      import('./capabilities/modern/nuclear-structure.generated.js'),
    ]);
    return registerBundle('aperi21:nuclear-structure', m.nuclearStructureBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:band-theory', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-band-theory'),
      import('./capabilities/modern/band-theory.generated.js'),
    ]);
    return registerBundle('aperi21:band-theory', m.bandTheoryBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:scale-of-universe', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-scale-of-universe'),
      import('./capabilities/modern/scale-of-universe.generated.js'),
    ]);
    return registerBundle('aperi21:scale-of-universe', m.scaleOfUniverseBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:relativity-of-simultaneity', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-relativity-of-simultaneity'),
      import('./capabilities/modern/relativity-of-simultaneity.generated.js'),
    ]);
    return registerBundle('aperi21:relativity-of-simultaneity', m.relativityOfSimultaneityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:light-bending-by-gravity', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-light-bending-by-gravity'),
      import('./capabilities/modern/light-bending-by-gravity.generated.js'),
    ]);
    return registerBundle('aperi21:light-bending-by-gravity', m.lightBendingByGravityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:blackbody-radiation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-blackbody-radiation'),
      import('./capabilities/modern/blackbody-radiation.generated.js'),
    ]);
    return registerBundle('aperi21:blackbody-radiation', m.blackbodyRadiationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:particle-in-a-box', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-particle-in-a-box'),
      import('./capabilities/modern/particle-in-a-box.generated.js'),
    ]);
    return registerBundle('aperi21:particle-in-a-box', m.particleInABoxBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:rutherford-scattering', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-rutherford-scattering'),
      import('./capabilities/modern/rutherford-scattering.generated.js'),
    ]);
    return registerBundle('aperi21:rutherford-scattering', m.rutherfordScatteringBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:nuclear-fission', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-nuclear-fission'),
      import('./capabilities/modern/nuclear-fission.generated.js'),
    ]);
    return registerBundle('aperi21:nuclear-fission', m.nuclearFissionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:superconductivity', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-superconductivity'),
      import('./capabilities/modern/superconductivity.generated.js'),
    ]);
    return registerBundle('aperi21:superconductivity', m.superconductivityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:michelson-morley', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-michelson-morley'),
      import('./capabilities/modern/michelson-morley.generated.js'),
    ]);
    return registerBundle('aperi21:michelson-morley', m.michelsonMorleyBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:gravitational-time-dilation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-gravitational-time-dilation'),
      import('./capabilities/modern/gravitational-time-dilation.generated.js'),
    ]);
    return registerBundle('aperi21:gravitational-time-dilation', m.gravitationalTimeDilationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:compton-scattering', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-compton-scattering'),
      import('./capabilities/modern/compton-scattering.generated.js'),
    ]);
    return registerBundle('aperi21:compton-scattering', m.comptonScatteringBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:uncertainty-principle', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-uncertainty-principle'),
      import('./capabilities/modern/uncertainty-principle.generated.js'),
    ]);
    return registerBundle('aperi21:uncertainty-principle', m.uncertaintyPrincipleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:stern-gerlach', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-stern-gerlach'),
      import('./capabilities/modern/stern-gerlach.generated.js'),
    ]);
    return registerBundle('aperi21:stern-gerlach', m.sternGerlachBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:decay-types', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-decay-types'),
      import('./capabilities/modern/decay-types.generated.js'),
    ]);
    return registerBundle('aperi21:decay-types', m.decayTypesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:semiconductor-doping', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-semiconductor-doping'),
      import('./capabilities/modern/semiconductor-doping.generated.js'),
    ]);
    return registerBundle('aperi21:semiconductor-doping', m.semiconductorDopingBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:length-contraction', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-length-contraction'),
      import('./capabilities/modern/length-contraction.generated.js'),
    ]);
    return registerBundle('aperi21:length-contraction', m.lengthContractionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:gravitational-redshift', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-gravitational-redshift'),
      import('./capabilities/modern/gravitational-redshift.generated.js'),
    ]);
    return registerBundle('aperi21:gravitational-redshift', m.gravitationalRedshiftBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:pair-production', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-pair-production'),
      import('./capabilities/modern/pair-production.generated.js'),
    ]);
    return registerBundle('aperi21:pair-production', m.pairProductionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:quantum-tunneling', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-quantum-tunneling'),
      import('./capabilities/modern/quantum-tunneling.generated.js'),
    ]);
    return registerBundle('aperi21:quantum-tunneling', m.quantumTunnelingBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:laser-and-stimulated-emission', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-laser-and-stimulated-emission'),
      import('./capabilities/modern/laser-and-stimulated-emission.generated.js'),
    ]);
    return registerBundle('aperi21:laser-and-stimulated-emission', m.laserAndStimulatedEmissionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:binding-energy-curve', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-binding-energy-curve'),
      import('./capabilities/modern/binding-energy-curve.generated.js'),
    ]);
    return registerBundle('aperi21:binding-energy-curve', m.bindingEnergyCurveBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:bose-einstein-condensate', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-bose-einstein-condensate'),
      import('./capabilities/modern/bose-einstein-condensate.generated.js'),
    ]);
    return registerBundle('aperi21:bose-einstein-condensate', m.boseEinsteinCondensateBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:relativistic-velocity-addition', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-relativistic-velocity-addition'),
      import('./capabilities/modern/relativistic-velocity-addition.generated.js'),
    ]);
    return registerBundle('aperi21:relativistic-velocity-addition', m.relativisticVelocityAdditionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:ionizing-radiation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-ionizing-radiation'),
      import('./capabilities/modern/ionizing-radiation.generated.js'),
    ]);
    return registerBundle('aperi21:ionizing-radiation', m.ionizingRadiationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:wave-function', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-wave-function'),
      import('./capabilities/modern/wave-function.generated.js'),
    ]);
    return registerBundle('aperi21:wave-function', m.waveFunctionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:pauli-exclusion', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-pauli-exclusion'),
      import('./capabilities/modern/pauli-exclusion.generated.js'),
    ]);
    return registerBundle('aperi21:pauli-exclusion', m.pauliExclusionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:antimatter', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-antimatter'),
      import('./capabilities/modern/antimatter.generated.js'),
    ]);
    return registerBundle('aperi21:antimatter', m.antimatterBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:pn-junction', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-pn-junction'),
      import('./capabilities/modern/pn-junction.generated.js'),
    ]);
    return registerBundle('aperi21:pn-junction', m.pnJunctionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:light-cone', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-light-cone'),
      import('./capabilities/modern/light-cone.generated.js'),
    ]);
    return registerBundle('aperi21:light-cone', m.lightConeBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:wien-displacement-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-wien-displacement-law'),
      import('./capabilities/modern/wien-displacement-law.generated.js'),
    ]);
    return registerBundle('aperi21:wien-displacement-law', m.wienDisplacementLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:superposition-quantum', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-superposition-quantum'),
      import('./capabilities/modern/superposition-quantum.generated.js'),
    ]);
    return registerBundle('aperi21:superposition-quantum', m.superpositionQuantumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:zeeman-effect', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-zeeman-effect'),
      import('./capabilities/modern/zeeman-effect.generated.js'),
    ]);
    return registerBundle('aperi21:zeeman-effect', m.zeemanEffectBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:nuclear-fusion', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-nuclear-fusion'),
      import('./capabilities/modern/nuclear-fusion.generated.js'),
    ]);
    return registerBundle('aperi21:nuclear-fusion', m.nuclearFusionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:fermi-level', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-fermi-level'),
      import('./capabilities/modern/fermi-level.generated.js'),
    ]);
    return registerBundle('aperi21:fermi-level', m.fermiLevelBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:relativistic-momentum', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-relativistic-momentum'),
      import('./capabilities/modern/relativistic-momentum.generated.js'),
    ]);
    return registerBundle('aperi21:relativistic-momentum', m.relativisticMomentumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:work-function-and-threshold', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-work-function-and-threshold'),
      import('./capabilities/modern/work-function-and-threshold.generated.js'),
    ]);
    return registerBundle('aperi21:work-function-and-threshold', m.workFunctionAndThresholdBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:quantum-harmonic-oscillator', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-quantum-harmonic-oscillator'),
      import('./capabilities/modern/quantum-harmonic-oscillator.generated.js'),
    ]);
    return registerBundle('aperi21:quantum-harmonic-oscillator', m.quantumHarmonicOscillatorBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:electron-configuration', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-electron-configuration'),
      import('./capabilities/modern/electron-configuration.generated.js'),
    ]);
    return registerBundle('aperi21:electron-configuration', m.electronConfigurationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:radiometric-dating', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-radiometric-dating'),
      import('./capabilities/modern/radiometric-dating.generated.js'),
    ]);
    return registerBundle('aperi21:radiometric-dating', m.radiometricDatingBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:photovoltaic-effect', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-photovoltaic-effect'),
      import('./capabilities/modern/photovoltaic-effect.generated.js'),
    ]);
    return registerBundle('aperi21:photovoltaic-effect', m.photovoltaicEffectBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:relativistic-doppler', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-relativistic-doppler'),
      import('./capabilities/modern/relativistic-doppler.generated.js'),
    ]);
    return registerBundle('aperi21:relativistic-doppler', m.relativisticDopplerBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:electron-diffraction', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-electron-diffraction'),
      import('./capabilities/modern/electron-diffraction.generated.js'),
    ]);
    return registerBundle('aperi21:electron-diffraction', m.electronDiffractionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:spin', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-spin'),
      import('./capabilities/modern/spin.generated.js'),
    ]);
    return registerBundle('aperi21:spin', m.spinBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:exchange-particles', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-exchange-particles'),
      import('./capabilities/modern/exchange-particles.generated.js'),
    ]);
    return registerBundle('aperi21:exchange-particles', m.exchangeParticlesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:meissner-effect', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-meissner-effect'),
      import('./capabilities/modern/meissner-effect.generated.js'),
    ]);
    return registerBundle('aperi21:meissner-effect', m.meissnerEffectBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:light-clock', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-light-clock'),
      import('./capabilities/modern/light-clock.generated.js'),
    ]);
    return registerBundle('aperi21:light-clock', m.lightClockBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:measurement-collapse', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-measurement-collapse'),
      import('./capabilities/modern/measurement-collapse.generated.js'),
    ]);
    return registerBundle('aperi21:measurement-collapse', m.measurementCollapseBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:chain-reaction', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-chain-reaction'),
      import('./capabilities/modern/chain-reaction.generated.js'),
    ]);
    return registerBundle('aperi21:chain-reaction', m.chainReactionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:diode-and-led', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-diode-and-led'),
      import('./capabilities/modern/diode-and-led.generated.js'),
    ]);
    return registerBundle('aperi21:diode-and-led', m.diodeAndLedBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:muon-decay-evidence', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-muon-decay-evidence'),
      import('./capabilities/modern/muon-decay-evidence.generated.js'),
    ]);
    return registerBundle('aperi21:muon-decay-evidence', m.muonDecayEvidenceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:finite-well', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-finite-well'),
      import('./capabilities/modern/finite-well.generated.js'),
    ]);
    return registerBundle('aperi21:finite-well', m.finiteWellBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:transistor-principle', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-transistor-principle'),
      import('./capabilities/modern/transistor-principle.generated.js'),
    ]);
    return registerBundle('aperi21:transistor-principle', m.transistorPrincipleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:twin-paradox', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-twin-paradox'),
      import('./capabilities/modern/twin-paradox.generated.js'),
    ]);
    return registerBundle('aperi21:twin-paradox', m.twinParadoxBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:scanning-tunneling-microscope', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-scanning-tunneling-microscope'),
      import('./capabilities/modern/scanning-tunneling-microscope.generated.js'),
    ]);
    return registerBundle('aperi21:scanning-tunneling-microscope', m.scanningTunnelingMicroscopeBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:kinetic-energy', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-kinetic-energy'),
      import('./capabilities/mechanics/kinetic-energy.generated.js'),
    ]);
    return registerBundle('aperi21:kinetic-energy', m.kineticEnergyBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:energy-dissipation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-energy-dissipation'),
      import('./capabilities/mechanics/energy-dissipation.generated.js'),
    ]);
    return registerBundle('aperi21:energy-dissipation', m.energyDissipationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:perfectly-inelastic-collision', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-perfectly-inelastic-collision'),
      import('./capabilities/mechanics/perfectly-inelastic-collision.generated.js'),
    ]);
    return registerBundle('aperi21:perfectly-inelastic-collision', m.perfectlyInelasticCollisionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:rocket-equation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-rocket-equation'),
      import('./capabilities/mechanics/rocket-equation.generated.js'),
    ]);
    return registerBundle('aperi21:rocket-equation', m.rocketEquationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:ballistic-pendulum', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-ballistic-pendulum'),
      import('./capabilities/mechanics/ballistic-pendulum.generated.js'),
    ]);
    return registerBundle('aperi21:ballistic-pendulum', m.ballisticPendulumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:uniform-motion', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-uniform-motion'),
      import('./capabilities/kinematics/uniform-motion.generated.js'),
    ]);
    return registerBundle('aperi21:uniform-motion', m.uniformMotionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:free-fall', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-free-fall'),
      import('./capabilities/kinematics/free-fall.generated.js'),
    ]);
    return registerBundle('aperi21:free-fall', m.freeFallBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:projectile-motion', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-projectile-motion'),
      import('./capabilities/kinematics/projectile-motion.generated.js'),
    ]);
    return registerBundle('aperi21:projectile-motion', m.projectileMotionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:vector-addition', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-vector-addition'),
      import('./capabilities/kinematics/vector-addition.generated.js'),
    ]);
    return registerBundle('aperi21:vector-addition', m.vectorAdditionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:relative-velocity', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-relative-velocity'),
      import('./capabilities/kinematics/relative-velocity.generated.js'),
    ]);
    return registerBundle('aperi21:relative-velocity', m.relativeVelocityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:terminal-velocity', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-terminal-velocity'),
      import('./capabilities/kinematics/terminal-velocity.generated.js'),
    ]);
    return registerBundle('aperi21:terminal-velocity', m.terminalVelocityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:stopping-distance', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-stopping-distance'),
      import('./capabilities/kinematics/stopping-distance.generated.js'),
    ]);
    return registerBundle('aperi21:stopping-distance', m.stoppingDistanceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:angular-acceleration', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-angular-acceleration'),
      import('./capabilities/kinematics/angular-acceleration.generated.js'),
    ]);
    return registerBundle('aperi21:angular-acceleration', m.angularAccelerationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:radius-of-curvature', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-radius-of-curvature'),
      import('./capabilities/kinematics/radius-of-curvature.generated.js'),
    ]);
    return registerBundle('aperi21:radius-of-curvature', m.radiusOfCurvatureBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:archimedes-principle', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-archimedes-principle'),
      import('./capabilities/fluids/archimedes-principle.generated.js'),
    ]);
    return registerBundle(
      'aperi21:archimedes-principle',
      m.archimedesPrincipleBundle,
      caps.capabilities,
    );
  });

  registerBundleLoader('aperi21:hydrostatic-pressure', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-hydrostatic-pressure'),
      import('./capabilities/fluids/hydrostatic-pressure.generated.js'),
    ]);
    return registerBundle('aperi21:hydrostatic-pressure', m.hydrostaticPressureBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:continuity-equation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-continuity-equation'),
      import('./capabilities/fluids/continuity-equation.generated.js'),
    ]);
    return registerBundle('aperi21:continuity-equation', m.continuityEquationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:surface-tension', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-surface-tension'),
      import('./capabilities/fluids/surface-tension.generated.js'),
    ]);
    return registerBundle('aperi21:surface-tension', m.surfaceTensionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:buoyancy', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-buoyancy'),
      import('./capabilities/fluids/buoyancy.generated.js'),
    ]);
    return registerBundle('aperi21:buoyancy', m.buoyancyBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:viscosity', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-viscosity'),
      import('./capabilities/fluids/viscosity.generated.js'),
    ]);
    return registerBundle('aperi21:viscosity', m.viscosityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:pascals-principle', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-pascals-principle'),
      import('./capabilities/fluids/pascals-principle.generated.js'),
    ]);
    return registerBundle('aperi21:pascals-principle', m.pascalsPrincipleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:venturi-effect', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-venturi-effect'),
      import('./capabilities/fluids/venturi-effect.generated.js'),
    ]);
    return registerBundle('aperi21:venturi-effect', m.venturiEffectBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:laplace-pressure', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-laplace-pressure'),
      import('./capabilities/fluids/laplace-pressure.generated.js'),
    ]);
    return registerBundle('aperi21:laplace-pressure', m.laplacePressureBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:floating-and-draft', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-floating-and-draft'),
      import('./capabilities/fluids/floating-and-draft.generated.js'),
    ]);
    return registerBundle('aperi21:floating-and-draft', m.floatingAndDraftBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:stokes-drag', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-stokes-drag'),
      import('./capabilities/fluids/stokes-drag.generated.js'),
    ]);
    return registerBundle('aperi21:stokes-drag', m.stokesDragBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:atmospheric-pressure', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-atmospheric-pressure'),
      import('./capabilities/fluids/atmospheric-pressure.generated.js'),
    ]);
    return registerBundle('aperi21:atmospheric-pressure', m.atmosphericPressureBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:reynolds-number', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-reynolds-number'),
      import('./capabilities/fluids/reynolds-number.generated.js'),
    ]);
    return registerBundle('aperi21:reynolds-number', m.reynoldsNumberBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:wetting-and-contact-angle', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-wetting-and-contact-angle'),
      import('./capabilities/fluids/wetting-and-contact-angle.generated.js'),
    ]);
    return registerBundle('aperi21:wetting-and-contact-angle', m.wettingAndContactAngleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:manometer', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-manometer'),
      import('./capabilities/fluids/manometer.generated.js'),
    ]);
    return registerBundle('aperi21:manometer', m.manometerBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:drag-in-fluid', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-drag-in-fluid'),
      import('./capabilities/fluids/drag-in-fluid.generated.js'),
    ]);
    return registerBundle('aperi21:drag-in-fluid', m.dragInFluidBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:barometer', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-barometer'),
      import('./capabilities/fluids/barometer.generated.js'),
    ]);
    return registerBundle('aperi21:barometer', m.barometerBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:boundary-layer', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-boundary-layer'),
      import('./capabilities/fluids/boundary-layer.generated.js'),
    ]);
    return registerBundle('aperi21:boundary-layer', m.boundaryLayerBundle, caps.capabilities);
  });

  // ── 01-broad 배치 (2026-09-12). 역학 · 진동 · 파동 · 전자기 · 열 · 천체 10 ──
  //
  // 기존 조각이 유체에 몰려 있어(5/10) 같은 분과를 더 고르면 이미 있는 어휘를
  // 다시 확인할 뿐이라, 손대지 않은 분과를 열었다.

  registerBundleLoader('aperi21:inertial-frame', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-inertial-frame'),
      import('./capabilities/mechanics/inertial-frame.generated.js'),
    ]);
    return registerBundle('aperi21:inertial-frame', m.inertialFrameBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:ramp-energy', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-ramp-energy'),
      import('./capabilities/mechanics/ramp-energy.generated.js'),
    ]);
    return registerBundle('aperi21:ramp-energy', m.rampEnergyBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:work-by-variable-force', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-work-by-variable-force'),
      import('./capabilities/mechanics/work-by-variable-force.generated.js'),
    ]);
    return registerBundle('aperi21:work-by-variable-force', m.workByVariableForceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:work-energy-theorem', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-work-energy-theorem'),
      import('./capabilities/mechanics/work-energy-theorem.generated.js'),
    ]);
    return registerBundle('aperi21:work-energy-theorem', m.workEnergyTheoremBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:gravitational-potential-energy', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-gravitational-potential-energy'),
      import('./capabilities/mechanics/gravitational-potential-energy.generated.js'),
    ]);
    return registerBundle('aperi21:gravitational-potential-energy', m.gravitationalPotentialEnergyBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:elastic-potential-energy', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-elastic-potential-energy'),
      import('./capabilities/mechanics/elastic-potential-energy.generated.js'),
    ]);
    return registerBundle('aperi21:elastic-potential-energy', m.elasticPotentialEnergyBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:conservative-force', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-conservative-force'),
      import('./capabilities/mechanics/conservative-force.generated.js'),
    ]);
    return registerBundle('aperi21:conservative-force', m.conservativeForceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:non-conservative-force', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-non-conservative-force'),
      import('./capabilities/mechanics/non-conservative-force.generated.js'),
    ]);
    return registerBundle('aperi21:non-conservative-force', m.nonConservativeForceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:equilibrium-points', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-equilibrium-points'),
      import('./capabilities/mechanics/equilibrium-points.generated.js'),
    ]);
    return registerBundle('aperi21:equilibrium-points', m.equilibriumPointsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:efficiency', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-efficiency'),
      import('./capabilities/mechanics/efficiency.generated.js'),
    ]);
    return registerBundle('aperi21:efficiency', m.efficiencyBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:impulse-momentum-theorem', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-impulse-momentum-theorem'),
      import('./capabilities/mechanics/impulse-momentum-theorem.generated.js'),
    ]);
    return registerBundle('aperi21:impulse-momentum-theorem', m.impulseMomentumTheoremBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:conservation-of-momentum', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-conservation-of-momentum'),
      import('./capabilities/mechanics/conservation-of-momentum.generated.js'),
    ]);
    return registerBundle('aperi21:conservation-of-momentum', m.conservationOfMomentumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:elastic-collision', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-elastic-collision'),
      import('./capabilities/mechanics/elastic-collision.generated.js'),
    ]);
    return registerBundle('aperi21:elastic-collision', m.elasticCollisionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:inelastic-collision', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-inelastic-collision'),
      import('./capabilities/mechanics/inelastic-collision.generated.js'),
    ]);
    return registerBundle('aperi21:inelastic-collision', m.inelasticCollisionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:two-dimensional-collision', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-two-dimensional-collision'),
      import('./capabilities/mechanics/two-dimensional-collision.generated.js'),
    ]);
    return registerBundle('aperi21:two-dimensional-collision', m.twoDimensionalCollisionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:center-of-mass-motion', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-center-of-mass-motion'),
      import('./capabilities/mechanics/center-of-mass-motion.generated.js'),
    ]);
    return registerBundle('aperi21:center-of-mass-motion', m.centerOfMassMotionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:explosion-and-recoil', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-explosion-and-recoil'),
      import('./capabilities/mechanics/explosion-and-recoil.generated.js'),
    ]);
    return registerBundle('aperi21:explosion-and-recoil', m.explosionAndRecoilBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:energy-in-collision', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-energy-in-collision'),
      import('./capabilities/mechanics/energy-in-collision.generated.js'),
    ]);
    return registerBundle('aperi21:energy-in-collision', m.energyInCollisionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:pendulum-isochronism', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-pendulum-isochronism'),
      import('./capabilities/oscillation/pendulum-isochronism.generated.js'),
    ]);
    return registerBundle(
      'aperi21:pendulum-isochronism',
      m.pendulumIsochronismBundle,
      caps.capabilities,
    );
  });

  registerBundleLoader('aperi21:torque', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-torque'),
      import('./capabilities/oscillation/torque.generated.js'),
    ]);
    return registerBundle('aperi21:torque', m.torqueBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:parallel-axis-theorem', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-parallel-axis-theorem'),
      import('./capabilities/oscillation/parallel-axis-theorem.generated.js'),
    ]);
    return registerBundle('aperi21:parallel-axis-theorem', m.parallelAxisTheoremBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:rotational-kinetic-energy', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-rotational-kinetic-energy'),
      import('./capabilities/oscillation/rotational-kinetic-energy.generated.js'),
    ]);
    return registerBundle('aperi21:rotational-kinetic-energy', m.rotationalKineticEnergyBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:angular-momentum', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-angular-momentum'),
      import('./capabilities/oscillation/angular-momentum.generated.js'),
    ]);
    return registerBundle('aperi21:angular-momentum', m.angularMomentumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:conservation-of-angular-momentum', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-conservation-of-angular-momentum'),
      import('./capabilities/oscillation/conservation-of-angular-momentum.generated.js'),
    ]);
    return registerBundle('aperi21:conservation-of-angular-momentum', m.conservationOfAngularMomentumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:angular-momentum-vector', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-angular-momentum-vector'),
      import('./capabilities/oscillation/angular-momentum-vector.generated.js'),
    ]);
    return registerBundle('aperi21:angular-momentum-vector', m.angularMomentumVectorBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:rolling-without-slipping', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-rolling-without-slipping'),
      import('./capabilities/oscillation/rolling-without-slipping.generated.js'),
    ]);
    return registerBundle('aperi21:rolling-without-slipping', m.rollingWithoutSlippingBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:rolling-race', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-rolling-race'),
      import('./capabilities/oscillation/rolling-race.generated.js'),
    ]);
    return registerBundle('aperi21:rolling-race', m.rollingRaceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:static-equilibrium', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-static-equilibrium'),
      import('./capabilities/oscillation/static-equilibrium.generated.js'),
    ]);
    return registerBundle('aperi21:static-equilibrium', m.staticEquilibriumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:center-of-gravity', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-center-of-gravity'),
      import('./capabilities/oscillation/center-of-gravity.generated.js'),
    ]);
    return registerBundle('aperi21:center-of-gravity', m.centerOfGravityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:gears', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-gears'),
      import('./capabilities/oscillation/gears.generated.js'),
    ]);
    return registerBundle('aperi21:gears', m.gearsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:simple-harmonic-motion', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-simple-harmonic-motion'),
      import('./capabilities/oscillation/simple-harmonic-motion.generated.js'),
    ]);
    return registerBundle('aperi21:simple-harmonic-motion', m.simpleHarmonicMotionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:shm-energy', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-shm-energy'),
      import('./capabilities/oscillation/shm-energy.generated.js'),
    ]);
    return registerBundle('aperi21:shm-energy', m.shmEnergyBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:mass-spring-system', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-mass-spring-system'),
      import('./capabilities/oscillation/mass-spring-system.generated.js'),
    ]);
    return registerBundle('aperi21:mass-spring-system', m.massSpringSystemBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:simple-pendulum', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-simple-pendulum'),
      import('./capabilities/oscillation/simple-pendulum.generated.js'),
    ]);
    return registerBundle('aperi21:simple-pendulum', m.simplePendulumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:physical-pendulum', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-physical-pendulum'),
      import('./capabilities/oscillation/physical-pendulum.generated.js'),
    ]);
    return registerBundle('aperi21:physical-pendulum', m.physicalPendulumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:damped-oscillation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-damped-oscillation'),
      import('./capabilities/oscillation/damped-oscillation.generated.js'),
    ]);
    return registerBundle('aperi21:damped-oscillation', m.dampedOscillationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:damping-regimes', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-damping-regimes'),
      import('./capabilities/oscillation/damping-regimes.generated.js'),
    ]);
    return registerBundle('aperi21:damping-regimes', m.dampingRegimesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:driven-oscillation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-driven-oscillation'),
      import('./capabilities/oscillation/driven-oscillation.generated.js'),
    ]);
    return registerBundle('aperi21:driven-oscillation', m.drivenOscillationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:quality-factor', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-quality-factor'),
      import('./capabilities/oscillation/quality-factor.generated.js'),
    ]);
    return registerBundle('aperi21:quality-factor', m.qualityFactorBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:coupled-oscillators', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-coupled-oscillators'),
      import('./capabilities/oscillation/coupled-oscillators.generated.js'),
    ]);
    return registerBundle('aperi21:coupled-oscillators', m.coupledOscillatorsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:beats-in-oscillation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-beats-in-oscillation'),
      import('./capabilities/oscillation/beats-in-oscillation.generated.js'),
    ]);
    return registerBundle('aperi21:beats-in-oscillation', m.beatsInOscillationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:nonlinear-oscillation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-nonlinear-oscillation'),
      import('./capabilities/oscillation/nonlinear-oscillation.generated.js'),
    ]);
    return registerBundle('aperi21:nonlinear-oscillation', m.nonlinearOscillationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:beats', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-beats'),
      import('./capabilities/waves/beats.generated.js'),
    ]);
    return registerBundle('aperi21:beats', m.beatsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:doppler-effect', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-doppler-effect'),
      import('./capabilities/waves/doppler-effect.generated.js'),
    ]);
    return registerBundle('aperi21:doppler-effect', m.dopplerEffectBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:wave-basics', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-wave-basics'),
      import('./capabilities/waves/wave-basics.generated.js'),
    ]);
    return registerBundle('aperi21:wave-basics', m.waveBasicsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:superposition', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-superposition'),
      import('./capabilities/waves/superposition.generated.js'),
    ]);
    return registerBundle('aperi21:superposition', m.superpositionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:reflection-of-waves', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-reflection-of-waves'),
      import('./capabilities/waves/reflection-of-waves.generated.js'),
    ]);
    return registerBundle('aperi21:reflection-of-waves', m.reflectionOfWavesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:diffraction', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-diffraction'),
      import('./capabilities/waves/diffraction.generated.js'),
    ]);
    return registerBundle('aperi21:diffraction', m.diffractionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:sound-source-vibration', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-sound-source-vibration'),
      import('./capabilities/waves/sound-source-vibration.generated.js'),
    ]);
    return registerBundle('aperi21:sound-source-vibration', m.soundSourceVibrationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:transverse-wave', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-transverse-wave'),
      import('./capabilities/waves/transverse-wave.generated.js'),
    ]);
    return registerBundle('aperi21:transverse-wave', m.transverseWaveBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:harmonics', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-harmonics'),
      import('./capabilities/waves/harmonics.generated.js'),
    ]);
    return registerBundle('aperi21:harmonics', m.harmonicsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:doppler-source-vs-observer', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-doppler-source-vs-observer'),
      import('./capabilities/waves/doppler-source-vs-observer.generated.js'),
    ]);
    return registerBundle('aperi21:doppler-source-vs-observer', m.dopplerSourceVsObserverBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:digital-vs-analog-signal', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-digital-vs-analog-signal'),
      import('./capabilities/waves/digital-vs-analog-signal.generated.js'),
    ]);
    return registerBundle('aperi21:digital-vs-analog-signal', m.digitalVsAnalogSignalBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:wavefront-and-ray', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-wavefront-and-ray'),
      import('./capabilities/waves/wavefront-and-ray.generated.js'),
    ]);
    return registerBundle('aperi21:wavefront-and-ray', m.wavefrontAndRayBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:wave-speed-in-medium', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-wave-speed-in-medium'),
      import('./capabilities/waves/wave-speed-in-medium.generated.js'),
    ]);
    return registerBundle('aperi21:wave-speed-in-medium', m.waveSpeedInMediumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:constructive-destructive', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-constructive-destructive'),
      import('./capabilities/waves/constructive-destructive.generated.js'),
    ]);
    return registerBundle('aperi21:constructive-destructive', m.constructiveDestructiveBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:sound-intensity', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-sound-intensity'),
      import('./capabilities/waves/sound-intensity.generated.js'),
    ]);
    return registerBundle('aperi21:sound-intensity', m.soundIntensityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:seismic-waves', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-seismic-waves'),
      import('./capabilities/waves/seismic-waves.generated.js'),
    ]);
    return registerBundle('aperi21:seismic-waves', m.seismicWavesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:impedance-mismatch', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-impedance-mismatch'),
      import('./capabilities/waves/impedance-mismatch.generated.js'),
    ]);
    return registerBundle('aperi21:impedance-mismatch', m.impedanceMismatchBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:wave-energy', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-wave-energy'),
      import('./capabilities/waves/wave-energy.generated.js'),
    ]);
    return registerBundle('aperi21:wave-energy', m.waveEnergyBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:string-vibration', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-string-vibration'),
      import('./capabilities/waves/string-vibration.generated.js'),
    ]);
    return registerBundle('aperi21:string-vibration', m.stringVibrationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:slit-width-and-diffraction', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-slit-width-and-diffraction'),
      import('./capabilities/waves/slit-width-and-diffraction.generated.js'),
    ]);
    return registerBundle('aperi21:slit-width-and-diffraction', m.slitWidthAndDiffractionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:shock-wave', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-shock-wave'),
      import('./capabilities/waves/shock-wave.generated.js'),
    ]);
    return registerBundle('aperi21:shock-wave', m.shockWaveBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:noise-cancellation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-noise-cancellation'),
      import('./capabilities/waves/noise-cancellation.generated.js'),
    ]);
    return registerBundle('aperi21:noise-cancellation', m.noiseCancellationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:wave-vs-particle-transport', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-wave-vs-particle-transport'),
      import('./capabilities/waves/wave-vs-particle-transport.generated.js'),
    ]);
    return registerBundle('aperi21:wave-vs-particle-transport', m.waveVsParticleTransportBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:air-column-resonance', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-air-column-resonance'),
      import('./capabilities/waves/air-column-resonance.generated.js'),
    ]);
    return registerBundle('aperi21:air-column-resonance', m.airColumnResonanceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:sound-through-materials', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-sound-through-materials'),
      import('./capabilities/waves/sound-through-materials.generated.js'),
    ]);
    return registerBundle('aperi21:sound-through-materials', m.soundThroughMaterialsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:wave-attenuation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-wave-attenuation'),
      import('./capabilities/waves/wave-attenuation.generated.js'),
    ]);
    return registerBundle('aperi21:wave-attenuation', m.waveAttenuationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:current-magnetic-field', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-current-magnetic-field'),
      import('./capabilities/em/current-magnetic-field.generated.js'),
    ]);
    return registerBundle(
      'aperi21:current-magnetic-field',
      m.currentMagneticFieldBundle,
      caps.capabilities,
    );
  });

  registerBundleLoader('aperi21:lenz-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-lenz-law'),
      import('./capabilities/em/lenz-law.generated.js'),
    ]);
    return registerBundle('aperi21:lenz-law', m.lenzLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:electric-charge', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-electric-charge'),
      import('./capabilities/em/electric-charge.generated.js'),
    ]);
    return registerBundle('aperi21:electric-charge', m.electricChargeBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:parallel-plate-capacitor', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-parallel-plate-capacitor'),
      import('./capabilities/em/parallel-plate-capacitor.generated.js'),
    ]);
    return registerBundle('aperi21:parallel-plate-capacitor', m.parallelPlateCapacitorBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:electric-current', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-electric-current'),
      import('./capabilities/em/electric-current.generated.js'),
    ]);
    return registerBundle('aperi21:electric-current', m.electricCurrentBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:magnetic-field', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-magnetic-field'),
      import('./capabilities/em/magnetic-field.generated.js'),
    ]);
    return registerBundle('aperi21:magnetic-field', m.magneticFieldBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:lorentz-force', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-lorentz-force'),
      import('./capabilities/em/lorentz-force.generated.js'),
    ]);
    return registerBundle('aperi21:lorentz-force', m.lorentzForceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:faradays-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-faradays-law'),
      import('./capabilities/em/faradays-law.generated.js'),
    ]);
    return registerBundle('aperi21:faradays-law', m.faradaysLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:lc-oscillation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-lc-oscillation'),
      import('./capabilities/em/lc-oscillation.generated.js'),
    ]);
    return registerBundle('aperi21:lc-oscillation', m.lcOscillationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:antenna-radiation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-antenna-radiation'),
      import('./capabilities/em/antenna-radiation.generated.js'),
    ]);
    return registerBundle('aperi21:antenna-radiation', m.antennaRadiationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:coulombs-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-coulombs-law'),
      import('./capabilities/em/coulombs-law.generated.js'),
    ]);
    return registerBundle('aperi21:coulombs-law', m.coulombsLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:capacitors-in-circuit', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-capacitors-in-circuit'),
      import('./capabilities/em/capacitors-in-circuit.generated.js'),
    ]);
    return registerBundle('aperi21:capacitors-in-circuit', m.capacitorsInCircuitBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:ohms-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-ohms-law'),
      import('./capabilities/em/ohms-law.generated.js'),
    ]);
    return registerBundle('aperi21:ohms-law', m.ohmsLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:magnetic-poles', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-magnetic-poles'),
      import('./capabilities/em/magnetic-poles.generated.js'),
    ]);
    return registerBundle('aperi21:magnetic-poles', m.magneticPolesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:force-on-current-wire', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-force-on-current-wire'),
      import('./capabilities/em/force-on-current-wire.generated.js'),
    ]);
    return registerBundle('aperi21:force-on-current-wire', m.forceOnCurrentWireBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:motional-emf', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-motional-emf'),
      import('./capabilities/em/motional-emf.generated.js'),
    ]);
    return registerBundle('aperi21:motional-emf', m.motionalEmfBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:reactance-and-impedance', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-reactance-and-impedance'),
      import('./capabilities/em/reactance-and-impedance.generated.js'),
    ]);
    return registerBundle('aperi21:reactance-and-impedance', m.reactanceAndImpedanceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:displacement-current', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-displacement-current'),
      import('./capabilities/em/displacement-current.generated.js'),
    ]);
    return registerBundle('aperi21:displacement-current', m.displacementCurrentBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:electric-field', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-electric-field'),
      import('./capabilities/em/electric-field.generated.js'),
    ]);
    return registerBundle('aperi21:electric-field', m.electricFieldBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:energy-in-capacitor', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-energy-in-capacitor'),
      import('./capabilities/em/energy-in-capacitor.generated.js'),
    ]);
    return registerBundle('aperi21:energy-in-capacitor', m.energyInCapacitorBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:simple-circuit', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-simple-circuit'),
      import('./capabilities/em/simple-circuit.generated.js'),
    ]);
    return registerBundle('aperi21:simple-circuit', m.simpleCircuitBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:magnet-attraction', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-magnet-attraction'),
      import('./capabilities/em/magnet-attraction.generated.js'),
    ]);
    return registerBundle('aperi21:magnet-attraction', m.magnetAttractionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:velocity-selector', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-velocity-selector'),
      import('./capabilities/em/velocity-selector.generated.js'),
    ]);
    return registerBundle('aperi21:velocity-selector', m.velocitySelectorBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:generator', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-generator'),
      import('./capabilities/em/generator.generated.js'),
    ]);
    return registerBundle('aperi21:generator', m.generatorBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:phase-in-ac-circuit', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-phase-in-ac-circuit'),
      import('./capabilities/em/phase-in-ac-circuit.generated.js'),
    ]);
    return registerBundle('aperi21:phase-in-ac-circuit', m.phaseInAcCircuitBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:poynting-vector', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-poynting-vector'),
      import('./capabilities/em/poynting-vector.generated.js'),
    ]);
    return registerBundle('aperi21:poynting-vector', m.poyntingVectorBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:charging-methods', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-charging-methods'),
      import('./capabilities/em/charging-methods.generated.js'),
    ]);
    return registerBundle('aperi21:charging-methods', m.chargingMethodsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:dielectric', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-dielectric'),
      import('./capabilities/em/dielectric.generated.js'),
    ]);
    return registerBundle('aperi21:dielectric', m.dielectricBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:kirchhoffs-current-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-kirchhoffs-current-law'),
      import('./capabilities/em/kirchhoffs-current-law.generated.js'),
    ]);
    return registerBundle('aperi21:kirchhoffs-current-law', m.kirchhoffsCurrentLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:magnetic-field-lines', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-magnetic-field-lines'),
      import('./capabilities/em/magnetic-field-lines.generated.js'),
    ]);
    return registerBundle('aperi21:magnetic-field-lines', m.magneticFieldLinesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:mass-spectrometer', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-mass-spectrometer'),
      import('./capabilities/em/mass-spectrometer.generated.js'),
    ]);
    return registerBundle('aperi21:mass-spectrometer', m.massSpectrometerBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:self-inductance', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-self-inductance'),
      import('./capabilities/em/self-inductance.generated.js'),
    ]);
    return registerBundle('aperi21:self-inductance', m.selfInductanceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:series-rlc-resonance', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-series-rlc-resonance'),
      import('./capabilities/em/series-rlc-resonance.generated.js'),
    ]);
    return registerBundle('aperi21:series-rlc-resonance', m.seriesRlcResonanceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:radiation-pressure', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-radiation-pressure'),
      import('./capabilities/em/radiation-pressure.generated.js'),
    ]);
    return registerBundle('aperi21:radiation-pressure', m.radiationPressureBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:uniform-field', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-uniform-field'),
      import('./capabilities/em/uniform-field.generated.js'),
    ]);
    return registerBundle('aperi21:uniform-field', m.uniformFieldBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:drift-velocity', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-drift-velocity'),
      import('./capabilities/em/drift-velocity.generated.js'),
    ]);
    return registerBundle('aperi21:drift-velocity', m.driftVelocityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:electromagnet', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-electromagnet'),
      import('./capabilities/em/electromagnet.generated.js'),
    ]);
    return registerBundle('aperi21:electromagnet', m.electromagnetBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:motor', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-motor'),
      import('./capabilities/em/motor.generated.js'),
    ]);
    return registerBundle('aperi21:motor', m.motorBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:rl-circuit', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-rl-circuit'),
      import('./capabilities/em/rl-circuit.generated.js'),
    ]);
    return registerBundle('aperi21:rl-circuit', m.rlCircuitBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:maxwells-equations', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-maxwells-equations'),
      import('./capabilities/em/maxwells-equations.generated.js'),
    ]);
    return registerBundle('aperi21:maxwells-equations', m.maxwellsEquationsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:superposition-of-forces', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-superposition-of-forces'),
      import('./capabilities/em/superposition-of-forces.generated.js'),
    ]);
    return registerBundle('aperi21:superposition-of-forces', m.superpositionOfForcesBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:resistance-and-geometry', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-resistance-and-geometry'),
      import('./capabilities/em/resistance-and-geometry.generated.js'),
    ]);
    return registerBundle('aperi21:resistance-and-geometry', m.resistanceAndGeometryBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:field-of-loop-and-solenoid', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-field-of-loop-and-solenoid'),
      import('./capabilities/em/field-of-loop-and-solenoid.generated.js'),
    ]);
    return registerBundle('aperi21:field-of-loop-and-solenoid', m.fieldOfLoopAndSolenoidBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:loudspeaker-and-microphone', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-loudspeaker-and-microphone'),
      import('./capabilities/em/loudspeaker-and-microphone.generated.js'),
    ]);
    return registerBundle('aperi21:loudspeaker-and-microphone', m.loudspeakerAndMicrophoneBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:mutual-inductance', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-mutual-inductance'),
      import('./capabilities/em/mutual-inductance.generated.js'),
    ]);
    return registerBundle('aperi21:mutual-inductance', m.mutualInductanceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:field-of-dipole', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-field-of-dipole'),
      import('./capabilities/em/field-of-dipole.generated.js'),
    ]);
    return registerBundle('aperi21:field-of-dipole', m.fieldOfDipoleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:kirchhoffs-voltage-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-kirchhoffs-voltage-law'),
      import('./capabilities/em/kirchhoffs-voltage-law.generated.js'),
    ]);
    return registerBundle('aperi21:kirchhoffs-voltage-law', m.kirchhoffsVoltageLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:biot-savart-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-biot-savart-law'),
      import('./capabilities/em/biot-savart-law.generated.js'),
    ]);
    return registerBundle('aperi21:biot-savart-law', m.biotSavartLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:transformer', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-transformer'),
      import('./capabilities/em/transformer.generated.js'),
    ]);
    return registerBundle('aperi21:transformer', m.transformerBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:charge-in-uniform-field', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-charge-in-uniform-field'),
      import('./capabilities/em/charge-in-uniform-field.generated.js'),
    ]);
    return registerBundle('aperi21:charge-in-uniform-field', m.chargeInUniformFieldBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:emf-and-internal-resistance', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-emf-and-internal-resistance'),
      import('./capabilities/em/emf-and-internal-resistance.generated.js'),
    ]);
    return registerBundle('aperi21:emf-and-internal-resistance', m.emfAndInternalResistanceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:amperes-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-amperes-law'),
      import('./capabilities/em/amperes-law.generated.js'),
    ]);
    return registerBundle('aperi21:amperes-law', m.amperesLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:ac-generation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-ac-generation'),
      import('./capabilities/em/ac-generation.generated.js'),
    ]);
    return registerBundle('aperi21:ac-generation', m.acGenerationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:gausss-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-gausss-law'),
      import('./capabilities/em/gausss-law.generated.js'),
    ]);
    return registerBundle('aperi21:gausss-law', m.gausssLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:joule-heating', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-joule-heating'),
      import('./capabilities/em/joule-heating.generated.js'),
    ]);
    return registerBundle('aperi21:joule-heating', m.jouleHeatingBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:force-between-wires', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-force-between-wires'),
      import('./capabilities/em/force-between-wires.generated.js'),
    ]);
    return registerBundle('aperi21:force-between-wires', m.forceBetweenWiresBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:eddy-current', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-eddy-current'),
      import('./capabilities/em/eddy-current.generated.js'),
    ]);
    return registerBundle('aperi21:eddy-current', m.eddyCurrentBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:field-of-charged-sphere', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-field-of-charged-sphere'),
      import('./capabilities/em/field-of-charged-sphere.generated.js'),
    ]);
    return registerBundle('aperi21:field-of-charged-sphere', m.fieldOfChargedSphereBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:potential-divider', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-potential-divider'),
      import('./capabilities/em/potential-divider.generated.js'),
    ]);
    return registerBundle('aperi21:potential-divider', m.potentialDividerBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:magnetic-dipole', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-magnetic-dipole'),
      import('./capabilities/em/magnetic-dipole.generated.js'),
    ]);
    return registerBundle('aperi21:magnetic-dipole', m.magneticDipoleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:energy-in-inductor', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-energy-in-inductor'),
      import('./capabilities/em/energy-in-inductor.generated.js'),
    ]);
    return registerBundle('aperi21:energy-in-inductor', m.energyInInductorBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:potential-vs-field', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-potential-vs-field'),
      import('./capabilities/em/potential-vs-field.generated.js'),
    ]);
    return registerBundle('aperi21:potential-vs-field', m.potentialVsFieldBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:temperature-and-resistance', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-temperature-and-resistance'),
      import('./capabilities/em/temperature-and-resistance.generated.js'),
    ]);
    return registerBundle('aperi21:temperature-and-resistance', m.temperatureAndResistanceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:magnetic-materials', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-magnetic-materials'),
      import('./capabilities/em/magnetic-materials.generated.js'),
    ]);
    return registerBundle('aperi21:magnetic-materials', m.magneticMaterialsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:power-transmission', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-power-transmission'),
      import('./capabilities/em/power-transmission.generated.js'),
    ]);
    return registerBundle('aperi21:power-transmission', m.powerTransmissionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:electrostatic-shielding', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-electrostatic-shielding'),
      import('./capabilities/em/electrostatic-shielding.generated.js'),
    ]);
    return registerBundle('aperi21:electrostatic-shielding', m.electrostaticShieldingBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:wheatstone-bridge', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-wheatstone-bridge'),
      import('./capabilities/em/wheatstone-bridge.generated.js'),
    ]);
    return registerBundle('aperi21:wheatstone-bridge', m.wheatstoneBridgeBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:charge-on-conductor-surface', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-charge-on-conductor-surface'),
      import('./capabilities/em/charge-on-conductor-surface.generated.js'),
    ]);
    return registerBundle('aperi21:charge-on-conductor-surface', m.chargeOnConductorSurfaceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:iv-characteristic', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-iv-characteristic'),
      import('./capabilities/em/iv-characteristic.generated.js'),
    ]);
    return registerBundle('aperi21:iv-characteristic', m.ivCharacteristicBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:millikan-experiment', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-millikan-experiment'),
      import('./capabilities/em/millikan-experiment.generated.js'),
    ]);
    return registerBundle('aperi21:millikan-experiment', m.millikanExperimentBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:thermistor-and-ldr', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-thermistor-and-ldr'),
      import('./capabilities/em/thermistor-and-ldr.generated.js'),
    ]);
    return registerBundle('aperi21:thermistor-and-ldr', m.thermistorAndLdrBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:heat-conduction', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-heat-conduction'),
      import('./capabilities/thermal/heat-conduction.generated.js'),
    ]);
    return registerBundle('aperi21:heat-conduction', m.heatConductionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:gas-pressure', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-gas-pressure'),
      import('./capabilities/thermal/gas-pressure.generated.js'),
    ]);
    return registerBundle('aperi21:gas-pressure', m.gasPressureBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:thermal-equilibrium', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-thermal-equilibrium'),
      import('./capabilities/thermal/thermal-equilibrium.generated.js'),
    ]);
    return registerBundle('aperi21:thermal-equilibrium', m.thermalEquilibriumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:thermal-radiation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-thermal-radiation'),
      import('./capabilities/thermal/thermal-radiation.generated.js'),
    ]);
    return registerBundle('aperi21:thermal-radiation', m.thermalRadiationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:ideal-gas-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-ideal-gas-law'),
      import('./capabilities/thermal/ideal-gas-law.generated.js'),
    ]);
    return registerBundle('aperi21:ideal-gas-law', m.idealGasLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:first-law-of-thermodynamics', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-first-law-of-thermodynamics'),
      import('./capabilities/thermal/first-law-of-thermodynamics.generated.js'),
    ]);
    return registerBundle('aperi21:first-law-of-thermodynamics', m.firstLawOfThermodynamicsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:second-law-of-thermodynamics', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-second-law-of-thermodynamics'),
      import('./capabilities/thermal/second-law-of-thermodynamics.generated.js'),
    ]);
    return registerBundle('aperi21:second-law-of-thermodynamics', m.secondLawOfThermodynamicsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:thermal-expansion', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-thermal-expansion'),
      import('./capabilities/thermal/thermal-expansion.generated.js'),
    ]);
    return registerBundle('aperi21:thermal-expansion', m.thermalExpansionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:specific-heat', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-specific-heat'),
      import('./capabilities/thermal/specific-heat.generated.js'),
    ]);
    return registerBundle('aperi21:specific-heat', m.specificHeatBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:stefan-boltzmann-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-stefan-boltzmann-law'),
      import('./capabilities/thermal/stefan-boltzmann-law.generated.js'),
    ]);
    return registerBundle('aperi21:stefan-boltzmann-law', m.stefanBoltzmannLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:boyles-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-boyles-law'),
      import('./capabilities/thermal/boyles-law.generated.js'),
    ]);
    return registerBundle('aperi21:boyles-law', m.boylesLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:pv-diagram', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-pv-diagram'),
      import('./capabilities/thermal/pv-diagram.generated.js'),
    ]);
    return registerBundle('aperi21:pv-diagram', m.pvDiagramBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:brownian-motion', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-brownian-motion'),
      import('./capabilities/thermal/brownian-motion.generated.js'),
    ]);
    return registerBundle('aperi21:brownian-motion', m.brownianMotionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:bimetal', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-bimetal'),
      import('./capabilities/thermal/bimetal.generated.js'),
    ]);
    return registerBundle('aperi21:bimetal', m.bimetalBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:calorimetry', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-calorimetry'),
      import('./capabilities/thermal/calorimetry.generated.js'),
    ]);
    return registerBundle('aperi21:calorimetry', m.calorimetryBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:albedo', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-albedo'),
      import('./capabilities/thermal/albedo.generated.js'),
    ]);
    return registerBundle('aperi21:albedo', m.albedoBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:charles-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-charles-law'),
      import('./capabilities/thermal/charles-law.generated.js'),
    ]);
    return registerBundle('aperi21:charles-law', m.charlesLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:isothermal-process', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-isothermal-process'),
      import('./capabilities/thermal/isothermal-process.generated.js'),
    ]);
    return registerBundle('aperi21:isothermal-process', m.isothermalProcessBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:entropy-and-irreversibility', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-entropy-and-irreversibility'),
      import('./capabilities/thermal/entropy-and-irreversibility.generated.js'),
    ]);
    return registerBundle('aperi21:entropy-and-irreversibility', m.entropyAndIrreversibilityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:latent-heat', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-latent-heat'),
      import('./capabilities/thermal/latent-heat.generated.js'),
    ]);
    return registerBundle('aperi21:latent-heat', m.latentHeatBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:radiative-equilibrium', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-radiative-equilibrium'),
      import('./capabilities/thermal/radiative-equilibrium.generated.js'),
    ]);
    return registerBundle('aperi21:radiative-equilibrium', m.radiativeEquilibriumBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:pressure-from-collisions', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-pressure-from-collisions'),
      import('./capabilities/thermal/pressure-from-collisions.generated.js'),
    ]);
    return registerBundle('aperi21:pressure-from-collisions', m.pressureFromCollisionsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:adiabatic-process', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-adiabatic-process'),
      import('./capabilities/thermal/adiabatic-process.generated.js'),
    ]);
    return registerBundle('aperi21:adiabatic-process', m.adiabaticProcessBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:diffusion', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-diffusion'),
      import('./capabilities/thermal/diffusion.generated.js'),
    ]);
    return registerBundle('aperi21:diffusion', m.diffusionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:triple-point', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-triple-point'),
      import('./capabilities/thermal/triple-point.generated.js'),
    ]);
    return registerBundle('aperi21:triple-point', m.triplePointBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:greenhouse-effect', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-greenhouse-effect'),
      import('./capabilities/thermal/greenhouse-effect.generated.js'),
    ]);
    return registerBundle('aperi21:greenhouse-effect', m.greenhouseEffectBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:mean-free-path', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-mean-free-path'),
      import('./capabilities/thermal/mean-free-path.generated.js'),
    ]);
    return registerBundle('aperi21:mean-free-path', m.meanFreePathBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:isobaric-isochoric', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-isobaric-isochoric'),
      import('./capabilities/thermal/isobaric-isochoric.generated.js'),
    ]);
    return registerBundle('aperi21:isobaric-isochoric', m.isobaricIsochoricBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:random-walk', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-random-walk'),
      import('./capabilities/thermal/random-walk.generated.js'),
    ]);
    return registerBundle('aperi21:random-walk', m.randomWalkBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:insulation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-insulation'),
      import('./capabilities/thermal/insulation.generated.js'),
    ]);
    return registerBundle('aperi21:insulation', m.insulationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:cyclic-process', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-cyclic-process'),
      import('./capabilities/thermal/cyclic-process.generated.js'),
    ]);
    return registerBundle('aperi21:cyclic-process', m.cyclicProcessBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:statistical-fluctuation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-statistical-fluctuation'),
      import('./capabilities/thermal/statistical-fluctuation.generated.js'),
    ]);
    return registerBundle('aperi21:statistical-fluctuation', m.statisticalFluctuationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:heat-engine', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-heat-engine'),
      import('./capabilities/thermal/heat-engine.generated.js'),
    ]);
    return registerBundle('aperi21:heat-engine', m.heatEngineBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:maxwells-demon', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-maxwells-demon'),
      import('./capabilities/thermal/maxwells-demon.generated.js'),
    ]);
    return registerBundle('aperi21:maxwells-demon', m.maxwellsDemonBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:refrigerator-heat-pump', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-refrigerator-heat-pump'),
      import('./capabilities/thermal/refrigerator-heat-pump.generated.js'),
    ]);
    return registerBundle('aperi21:refrigerator-heat-pump', m.refrigeratorHeatPumpBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:apparent-brightness', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-apparent-brightness'),
      import('./capabilities/astro/apparent-brightness.generated.js'),
    ]);
    return registerBundle(
      'aperi21:apparent-brightness',
      m.apparentBrightnessBundle,
      caps.capabilities,
    );
  });

  registerBundleLoader('aperi21:newtons-law-of-gravitation', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-newtons-law-of-gravitation'),
      import('./capabilities/astro/newtons-law-of-gravitation.generated.js'),
    ]);
    return registerBundle('aperi21:newtons-law-of-gravitation', m.newtonsLawOfGravitationBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:circular-orbit', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-circular-orbit'),
      import('./capabilities/astro/circular-orbit.generated.js'),
    ]);
    return registerBundle('aperi21:circular-orbit', m.circularOrbitBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:earth-rotation-day-night', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-earth-rotation-day-night'),
      import('./capabilities/astro/earth-rotation-day-night.generated.js'),
    ]);
    return registerBundle('aperi21:earth-rotation-day-night', m.earthRotationDayNightBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:star-color-temperature', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-star-color-temperature'),
      import('./capabilities/astro/star-color-temperature.generated.js'),
    ]);
    return registerBundle('aperi21:star-color-temperature', m.starColorTemperatureBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:gravitational-field', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-gravitational-field'),
      import('./capabilities/astro/gravitational-field.generated.js'),
    ]);
    return registerBundle('aperi21:gravitational-field', m.gravitationalFieldBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:keplers-first-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-keplers-first-law'),
      import('./capabilities/astro/keplers-first-law.generated.js'),
    ]);
    return registerBundle('aperi21:keplers-first-law', m.keplersFirstLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:axial-tilt-seasons', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-axial-tilt-seasons'),
      import('./capabilities/astro/axial-tilt-seasons.generated.js'),
    ]);
    return registerBundle('aperi21:axial-tilt-seasons', m.axialTiltSeasonsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:magnitude-scale', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-magnitude-scale'),
      import('./capabilities/astro/magnitude-scale.generated.js'),
    ]);
    return registerBundle('aperi21:magnitude-scale', m.magnitudeScaleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:shell-theorem', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-shell-theorem'),
      import('./capabilities/astro/shell-theorem.generated.js'),
    ]);
    return registerBundle('aperi21:shell-theorem', m.shellTheoremBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:escape-velocity', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-escape-velocity'),
      import('./capabilities/astro/escape-velocity.generated.js'),
    ]);
    return registerBundle('aperi21:escape-velocity', m.escapeVelocityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:diurnal-motion', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-diurnal-motion'),
      import('./capabilities/astro/diurnal-motion.generated.js'),
    ]);
    return registerBundle('aperi21:diurnal-motion', m.diurnalMotionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:stellar-luminosity', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-stellar-luminosity'),
      import('./capabilities/astro/stellar-luminosity.generated.js'),
    ]);
    return registerBundle('aperi21:stellar-luminosity', m.stellarLuminosityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:inverse-square-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-inverse-square-law'),
      import('./capabilities/astro/inverse-square-law.generated.js'),
    ]);
    return registerBundle('aperi21:inverse-square-law', m.inverseSquareLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:keplers-third-law', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-keplers-third-law'),
      import('./capabilities/astro/keplers-third-law.generated.js'),
    ]);
    return registerBundle('aperi21:keplers-third-law', m.keplersThirdLawBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:eclipse', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-eclipse'),
      import('./capabilities/astro/eclipse.generated.js'),
    ]);
    return registerBundle('aperi21:eclipse', m.eclipseBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:stellar-spectral-class', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-stellar-spectral-class'),
      import('./capabilities/astro/stellar-spectral-class.generated.js'),
    ]);
    return registerBundle('aperi21:stellar-spectral-class', m.stellarSpectralClassBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:gravity-inside-earth', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-gravity-inside-earth'),
      import('./capabilities/astro/gravity-inside-earth.generated.js'),
    ]);
    return registerBundle('aperi21:gravity-inside-earth', m.gravityInsideEarthBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:orbital-velocity', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-orbital-velocity'),
      import('./capabilities/astro/orbital-velocity.generated.js'),
    ]);
    return registerBundle('aperi21:orbital-velocity', m.orbitalVelocityBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:earth-revolution-constellations', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-earth-revolution-constellations'),
      import('./capabilities/astro/earth-revolution-constellations.generated.js'),
    ]);
    return registerBundle('aperi21:earth-revolution-constellations', m.earthRevolutionConstellationsBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:expanding-universe', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-expanding-universe'),
      import('./capabilities/astro/expanding-universe.generated.js'),
    ]);
    return registerBundle('aperi21:expanding-universe', m.expandingUniverseBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:weightlessness', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-weightlessness'),
      import('./capabilities/astro/weightlessness.generated.js'),
    ]);
    return registerBundle('aperi21:weightlessness', m.weightlessnessBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:elliptical-orbit', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-elliptical-orbit'),
      import('./capabilities/astro/elliptical-orbit.generated.js'),
    ]);
    return registerBundle('aperi21:elliptical-orbit', m.ellipticalOrbitBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:solar-altitude-shadow', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-solar-altitude-shadow'),
      import('./capabilities/astro/solar-altitude-shadow.generated.js'),
    ]);
    return registerBundle('aperi21:solar-altitude-shadow', m.solarAltitudeShadowBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:star-radiation-gravity-balance', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-star-radiation-gravity-balance'),
      import('./capabilities/astro/star-radiation-gravity-balance.generated.js'),
    ]);
    return registerBundle('aperi21:star-radiation-gravity-balance', m.starRadiationGravityBalanceBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:gravitational-potential-energy-general', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-gravitational-potential-energy-general'),
      import('./capabilities/astro/gravitational-potential-energy-general.generated.js'),
    ]);
    return registerBundle('aperi21:gravitational-potential-energy-general', m.gravitationalPotentialEnergyGeneralBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:two-body-problem', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-two-body-problem'),
      import('./capabilities/astro/two-body-problem.generated.js'),
    ]);
    return registerBundle('aperi21:two-body-problem', m.twoBodyProblemBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:stellar-parallax', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-stellar-parallax'),
      import('./capabilities/astro/stellar-parallax.generated.js'),
    ]);
    return registerBundle('aperi21:stellar-parallax', m.stellarParallaxBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:stellar-nucleosynthesis', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-stellar-nucleosynthesis'),
      import('./capabilities/astro/stellar-nucleosynthesis.generated.js'),
    ]);
    return registerBundle('aperi21:stellar-nucleosynthesis', m.stellarNucleosynthesisBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:roche-limit', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-roche-limit'),
      import('./capabilities/astro/roche-limit.generated.js'),
    ]);
    return registerBundle('aperi21:roche-limit', m.rocheLimitBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:geostationary-orbit', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-geostationary-orbit'),
      import('./capabilities/astro/geostationary-orbit.generated.js'),
    ]);
    return registerBundle('aperi21:geostationary-orbit', m.geostationaryOrbitBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:seasonal-sun-path', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-seasonal-sun-path'),
      import('./capabilities/astro/seasonal-sun-path.generated.js'),
    ]);
    return registerBundle('aperi21:seasonal-sun-path', m.seasonalSunPathBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:exoplanet-detection', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-exoplanet-detection'),
      import('./capabilities/astro/exoplanet-detection.generated.js'),
    ]);
    return registerBundle('aperi21:exoplanet-detection', m.exoplanetDetectionBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:black-hole-horizon', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-black-hole-horizon'),
      import('./capabilities/astro/black-hole-horizon.generated.js'),
    ]);
    return registerBundle('aperi21:black-hole-horizon', m.blackHoleHorizonBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:orbital-transfer', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-orbital-transfer'),
      import('./capabilities/astro/orbital-transfer.generated.js'),
    ]);
    return registerBundle('aperi21:orbital-transfer', m.orbitalTransferBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:star-life-cycle', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-star-life-cycle'),
      import('./capabilities/astro/star-life-cycle.generated.js'),
    ]);
    return registerBundle('aperi21:star-life-cycle', m.starLifeCycleBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:gravitational-slingshot', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-gravitational-slingshot'),
      import('./capabilities/astro/gravitational-slingshot.generated.js'),
    ]);
    return registerBundle('aperi21:gravitational-slingshot', m.gravitationalSlingshotBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:supernova-and-neutron-star', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-supernova-and-neutron-star'),
      import('./capabilities/astro/supernova-and-neutron-star.generated.js'),
    ]);
    return registerBundle('aperi21:supernova-and-neutron-star', m.supernovaAndNeutronStarBundle, caps.capabilities);
  });

  registerBundleLoader('aperi21:orbital-decay', async () => {
    const [m, caps] = await Promise.all([
      import('@aperi21/sim-orbital-decay'),
      import('./capabilities/astro/orbital-decay.generated.js'),
    ]);
    return registerBundle('aperi21:orbital-decay', m.orbitalDecayBundle, caps.capabilities);
  });
}

let pluginsInstalledFor = new WeakSet<Host>();

export async function installAperi21Plugins(host: Host): Promise<void> {
  if (pluginsInstalledFor.has(host)) return;
  pluginsInstalledFor.add(host);

  // 여기 오는 것은 **여러 sim 이 공유하는 도메인 어휘**뿐이다.
  //
  // 조각 하나가 자기 시각화를 직접 그리는 경우는 `Bundle.renderers` 로 간다.
  // 그것까지 여기 태우면 조각이 화면에 없어도 부팅만으로 통째로 로드되고,
  // 첫 페이로드가 조각 수에 비례해 자란다 (R10). 실제로 sim 2개 때문에
  // 11.4 KB(gz) 가 항상 실리고 있었다.
  const [{ opticsPlugin }, { circuitPlugin }] = await Promise.all([
    import('@aperi21/plugin-optics'),
    import('@aperi21/plugin-circuit'),
  ]);
  host.pluginManager.register(opticsPlugin);
  host.pluginManager.register(circuitPlugin);
}

/**
 * 외부 호스트가 단일 호출로 bundle 레지스트리 부팅 + (옵션) plugin 설치까지 끝내기 위한 진입점.
 * host 인자가 없으면 plugin 설치는 건너뛰고 bundle loader 만 등록한다 — 호스트가
 * 자기 Host 인스턴스를 만든 다음 별도로 installAperi21Plugins(host) 를 호출.
 */
export async function bootstrapAperi21(host?: Host): Promise<void> {
  registerAperi21Bundles();
  if (host) await installAperi21Plugins(host);
}

/** 테스트용. */
export function _resetBootstrapState(): void {
  bundlesRegistered = false;
  pluginsInstalledFor = new WeakSet<Host>();
}

// 카탈로그 — 호스트가 시각화 모듈을 로드하지 않고 "추가 가능한 목록" 을 한 언어로 그릴 수 있게.
export { getAperi21Catalog } from './catalog.js';
export type {
  Aperi21Catalog,
  Aperi21CatalogDomain,
  Aperi21CatalogEntry,
} from './catalog-types.js';

// 프레임워크 문구 — 호스트 locale 의 번들을 host 의 문구 저장소에 등록한다.
export { loadFrameworkMessages } from './messages.js';
