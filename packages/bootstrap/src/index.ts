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

// 카탈로그 — 호스트가 시각화 모듈을 로드하지 않고 "추가 가능한 목록" 을 그릴 수 있게.
export { getAperi21Catalog } from './catalog.js';
export type { Aperi21CatalogEntry } from './catalog-types.js';
