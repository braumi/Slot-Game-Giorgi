(function initMultiplayerScene() {
  if (!window.PIXI) return;

  const sceneElement = document.getElementById("multiplayerScene");
  const MULTI_IMAGE_URL = "./Content/Images/Spines/Multiplayer/multi.png";
  if (!sceneElement) return;

  const SEGMENT_VALUES = [2, 4, 2, 5, 1, 3, 4, 2, 5, 2, 4, 1, 3, 5];
  const SEGMENT_COUNT = SEGMENT_VALUES.length;
  const SEGMENT_ANGLE = (Math.PI * 2) / SEGMENT_COUNT;
  const TWO_PI = Math.PI * 2;
  const BASE_SPINS = 2; // full wheel turns included in the animation

  const multiTexture = PIXI.Texture.from(MULTI_IMAGE_URL);

  const app = new PIXI.Application({
    width: Math.max(1, sceneElement.clientWidth || 500),
    height: Math.max(1, sceneElement.clientHeight || 110),
    backgroundAlpha: 0,
    antialias: true,
  });

  sceneElement.appendChild(app.view);

  let multiSprite = null;
  let isSpinning = false;
  let currentRotation = 0;
  const tweens = [];
  let wheelSpinActive = false;
  let wheelSpinStartTimeMs = 0;
  let wheelSpinDurationMs = 0;
  let wheelTargetScheduled = false;
  let activeSpinSeq = 0;

  let wheelContinuousSpin = false;
  let wheelContinuousAngularVelocity = 0; // radians per ms
  let lastTick = performance.now();

  function resizeRenderer() {
    app.renderer.resize(
      Math.max(1, sceneElement.clientWidth || 1),
      Math.max(1, sceneElement.clientHeight || 1)
    );
  }

  function drawScene() {
    resizeRenderer();

    const stage = app.stage;
    stage.removeChildren();

    const width = app.screen.width;
    const height = app.screen.height;

    if (!multiTexture.baseTexture.valid) {
      multiSprite = null;
      return;
    }

    multiSprite = new PIXI.Sprite(multiTexture);
    multiSprite.anchor.set(0.5);
    multiSprite.x = width / 2;
    const isPhone = window.matchMedia("(max-width: 767px)").matches;
    multiSprite.y = isPhone ? height / 2 + 180 : height / 2 + 350;

    const baseScale = Math.min(
      (width * 0.98) / Math.max(1, multiTexture.width),
      (height * 0.98) / Math.max(1, multiTexture.height)
    );

    // Keep aggressive upscale on larger screens, but reduce on phones
    // so the wheel remains visible in the viewport.
    const scaleBoost = isPhone ? 6 : 5;
    multiSprite.scale.set(baseScale * scaleBoost);
    multiSprite.rotation = currentRotation;
    stage.addChild(multiSprite);
  }

  drawScene();

  if (!multiTexture.baseTexture.valid) {
    multiTexture.baseTexture.once("loaded", drawScene);
  }

  window.addEventListener("resize", drawScene);

  function tweenTo(object, property, target, time, easing, onComplete) {
    const tween = {
      object,
      property,
      startValue: object[property],
      target,
      time,
      easing,
      startTime: performance.now(),
      onComplete,
    };
    tweens.push(tween);
    return tween;
  }

  function lerp(a, b, t) {
    return a * (1 - t) + b * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  app.ticker.add(() => {
    const now = performance.now();
    const dtMs = now - lastTick;
    lastTick = now;

    // While we wait for the multiplier, keep the wheel moving so
    // its animation start time matches the reels.
    if (
      wheelContinuousSpin &&
      wheelSpinActive &&
      multiSprite &&
      tweens.length === 0
    ) {
      multiSprite.rotation += wheelContinuousAngularVelocity * dtMs;
    }

    if (tweens.length) {
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tween = tweens[i];
        const phase = Math.min(1, (now - tween.startTime) / tween.time);
        const eased = tween.easing ? tween.easing(phase) : phase;
        tween.object[tween.property] = lerp(
          tween.startValue,
          tween.target,
          eased
        );

        if (phase === 1) {
          if (typeof tween.onComplete === "function") tween.onComplete();
          tweens.splice(i, 1);
        }
      }
    }

    if (multiSprite) currentRotation = multiSprite.rotation;
  });

  function getSegmentIndexForMultiplier(multiplier) {
    // Required behavior:
    // multiplier -> find matching SEGMENT_VALUES[index] for index in [1..5]
    // then return that index.
    for (let i = 1; i <= 5 && i < SEGMENT_VALUES.length; i++) {
      if (SEGMENT_VALUES[i] === multiplier) return i;
    }

    // Safe fallback (shouldn't happen for multiplier 1..5 with the given layout).
    for (let i = 0; i < SEGMENT_VALUES.length; i++) {
      if (SEGMENT_VALUES[i] === multiplier) return i;
    }

    return 0;
  }

  function cancelTweens() {
    tweens.splice(0, tweens.length);
  }

  function startWheelSpin(durationMs) {
    if (!multiSprite) return;

    const safeDuration = Math.max(1, Number(durationMs) || 1600);
    cancelTweens();

    wheelSpinActive = true;
    wheelTargetScheduled = false;
    wheelSpinStartTimeMs = performance.now();
    wheelSpinDurationMs = safeDuration;

    wheelContinuousSpin = true;
    wheelContinuousAngularVelocity = (BASE_SPINS * TWO_PI) / safeDuration; // radians per ms

    isSpinning = true;
    currentRotation = multiSprite.rotation;
  }

  function finishWheelOnMultiplier(multiplier) {
    if (!multiSprite) return;
    if (typeof multiplier !== "number" || multiplier < 1 || multiplier > 5) return;

    if (!wheelSpinActive) {
      return;
    }
    if (wheelTargetScheduled) return;

    const segmentIndex = getSegmentIndexForMultiplier(multiplier);
    console.log(
      "[multiplayer] target segmentIndex:",
      segmentIndex,
      "multiplier:",
      multiplier,
      "segmentValue:",
      SEGMENT_VALUES[segmentIndex],
      "spinSeq:",
      activeSpinSeq
    );
    // PIXI's rotation direction + the PNG's segment orientation appear mirrored
    // relative to the index->angle assumption, so we flip the sign here.
    const desiredModRotation =
      ((-segmentIndex * SEGMENT_ANGLE) % TWO_PI + TWO_PI) % TWO_PI;

    wheelTargetScheduled = true;
    wheelContinuousSpin = false;
    cancelTweens();

    const elapsedMs = performance.now() - wheelSpinStartTimeMs;
    const remainingMs = wheelSpinDurationMs - elapsedMs;

    const currentAbsRotation = multiSprite.rotation;

    // Fix cumulative drift: always land on the next full wheel boundary
    // plus the desired segment offset.
    // Example: if currently at ~430deg, next full boundary is 720deg,
    // then we add (index * 360/14).
    const nextFullTurnIndex = Math.floor(currentAbsRotation / TWO_PI) + 1;
    let targetAbsRotation =
      nextFullTurnIndex * TWO_PI + desiredModRotation;

    // Ensure we are strictly forward.
    if (targetAbsRotation <= currentAbsRotation) {
      targetAbsRotation += TWO_PI;
    }

    if (remainingMs <= 0) {
      multiSprite.rotation = targetAbsRotation;
      isSpinning = false;
      wheelSpinActive = false;
      wheelContinuousSpin = false;
      currentRotation = multiSprite.rotation;
      return;
    }

    tweenTo(
      multiSprite,
      "rotation",
      targetAbsRotation,
      remainingMs,
      easeOutCubic,
      () => {
        isSpinning = false;
        wheelSpinActive = false;
        wheelContinuousSpin = false;
        currentRotation = multiSprite.rotation;
      }
    );
  }

  window.addEventListener("slotspinstart", (event) => {
    const detail = event && event.detail;
    const durationMs =
      detail && typeof detail.durationMs === "number" ? detail.durationMs : 1600;
    activeSpinSeq =
      detail && typeof detail.spinSeq === "number" ? detail.spinSeq : 0;
    startWheelSpin(durationMs);
  });

  window.addEventListener("slotmultiplierready", (event) => {
    const detail = event && event.detail;
    const multiplier =
      detail && typeof detail.multiplier === "number" ? detail.multiplier : null;
    if (!multiplier) return;
    const spinSeq = detail && typeof detail.spinSeq === "number" ? detail.spinSeq : 0;
    if (spinSeq !== activeSpinSeq) return;
    finishWheelOnMultiplier(multiplier);
  });

  // Fallback: if multiplier isn't ready by the time reels stop.
  window.addEventListener("slotspinresult", (event) => {
    const detail = event && event.detail;
    const multiplier =
      detail && typeof detail.multiplier === "number" ? detail.multiplier : null;
    if (!multiplier) return;
    const spinSeq = detail && typeof detail.spinSeq === "number" ? detail.spinSeq : 0;
    if (spinSeq !== activeSpinSeq) return;
    finishWheelOnMultiplier(multiplier);
  });
})();