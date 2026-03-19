(function initWinModal() {
  if (!window.PIXI) return;

  const overlay = document.getElementById("winModalOverlay");
  const pixiHost = document.getElementById("winModalPixiHost");
  const amountEl = document.getElementById("winModalAmount");

  if (!overlay || !pixiHost || !amountEl) return;

  const WINS_PNG_URL =
    "./Content/Images/Spines/Win/wins.png";
  const AMOUNT_FRAME_REGION = {
    // wins.atlas.txt -> charcho
    x: 1603,
    y: 256,
    w: 207,
    h: 244,
    rotate: false,
    ox: 0,
    oy: 0,
  };

  // Regions extracted from `wins.atlas.txt`
  // super => wins.atlas: 7ganateba
  // fantastic => wins.atlas: FANTASTIC
  // big => wins.atlas: big
  // label => wins.atlas: win
  const REGION_CONFIG = {
    5: {
      // SUPER: align positioning with other tiers (remove extra atlas offsets)
      region: {
         x: 580, y: 305, w: 270, h: 120,
        rotate: true,
        // user request: rotate super by -90deg
        rotateOverride: -Math.PI / 4,
        ox: 0,
        oy: 0,
      },
      label: { x: 1072, y: 16, w: 130, h: 52, rotate: false, ox: 0, oy: 0 },
      anim: "super",
      // Center SUPER literally at the same anchor as other tiers.
      titleYOffset: 0,
      labelYOffset: 70,
    },
    4: {
      region: { x: 912, y: 983, w: 378, h: 83, rotate: false, ox: 0, oy: 0 },
      label: { x: 1072, y: 16, w: 130, h: 52, rotate: false, ox: 0, oy: 0 },
      anim: "fantastic",
      titleYOffset: -42,
      labelYOffset: 70,
    },
    3: {
      // Big: move tier image + label slightly to the right.
      region: { x: 984, y: 115, w: 100, h: 160, rotate: true, ox: 0, oy: 0 },
      label: { x: 1072, y: 16, w: 130, h: 52, rotate: false, ox: 10, oy: 0 },
      anim: "big",
      titleYOffset: -36,
      labelYOffset: 68,
    },
  };

  let app = null;
  let active = false;
  let winsTexture = null;
  let winsReady = null;
  let currentTicker = null;

  function formatMoney(value) {
    try {
      if (window.slotGameLogic && typeof window.slotGameLogic.formatCurrency === "function") {
        return window.slotGameLogic.formatCurrency(value);
      }
    } catch (e) {
      // ignore
    }
    return `€${Number(value || 0).toFixed(2).replace(".", ",")}`;
  }

  function ensurePixi() {
    if (app) return;

    const width = Math.max(1, pixiHost.clientWidth || 800);
    const height = Math.max(1, pixiHost.clientHeight || 320);

    app = new PIXI.Application({
      width,
      height,
      transparent: true,
      antialias: true,
      // Atlas coords are in source pixels; keep consistent rendering scale.
      autoDensity: false,
      resolution: 1,
    });
    pixiHost.innerHTML = "";
    pixiHost.appendChild(app.view);
  }

  function ensureWinsTexture() {
    if (winsTexture && winsReady) return;

    winsReady = (async () => {
      try {
        if (PIXI.Assets && typeof PIXI.Assets.load === "function") {
          await PIXI.Assets.load(WINS_PNG_URL);
        } else {
          // Fallback: trigger baseTexture loading via Texture.from
          winsTexture = PIXI.Texture.from(WINS_PNG_URL);
          await new Promise((resolve) => {
            if (winsTexture.baseTexture && winsTexture.baseTexture.valid) return resolve();
            winsTexture.baseTexture.once("loaded", () => resolve());
          });
        }
      } catch (e) {
        // If load fails, we still try Texture.from; we will log for debugging.
        console.error("[winModal] failed loading wins.png", e);
      }

      winsTexture = PIXI.Texture.from(WINS_PNG_URL);
      if (!winsTexture.baseTexture || !winsTexture.baseTexture.valid) {
        await new Promise((resolve) => {
          if (winsTexture.baseTexture && winsTexture.baseTexture.valid) return resolve();
          winsTexture.baseTexture.once("loaded", () => resolve());
        });
      }
    })();
  }

  function createRegionSprite(baseTexture, region) {
    const res = baseTexture && typeof baseTexture.resolution === "number" ? baseTexture.resolution : 1;
    const rect = new PIXI.Rectangle(
      region.x * res,
      region.y * res,
      region.w * res,
      region.h * res
    );
    const texture = new PIXI.Texture(baseTexture, rect);
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);

    if (region.rotate) {
      // Atlas marks rotate:true (90 degrees).
      // For SUPER we need -90deg, so allow an override.
      if (typeof region.rotateOverride === "number") {
        sprite.rotation = region.rotateOverride;
      } else {
        sprite.rotation = Math.PI / 2;
      }
    }
    return sprite;
  }

  function stopAnimation() {
    if (!app || !currentTicker) return;
    app.ticker.remove(currentTicker);
    currentTicker = null;
    active = false;
  }

  function clearStage() {
    if (!app) return;
    app.stage.removeChildren();
  }

  function showWin(multiplier, winAmount) {
    // Turbo mode => no animations.
    if (window.slotGameState && window.slotGameState.turboMode) return;

    if (!REGION_CONFIG[multiplier]) return;

    ensurePixi();
    ensureWinsTexture();

    winsReady.then(() => {
      stopAnimation();
      clearStage();

      overlay.hidden = false;
      amountEl.textContent = formatMoney(winAmount);
      active = true;

      const cfg = REGION_CONFIG[multiplier];
      const width = Math.max(1, pixiHost.clientWidth || 800);
      const height = Math.max(1, pixiHost.clientHeight || 320);

      console.log(
        "[winModal] showing",
        multiplier,
        "winAmount:",
        winAmount,
        "winsTextureValid:",
        winsTexture && winsTexture.baseTexture && winsTexture.baseTexture.valid,
        "baseResolution:",
        winsTexture &&
          winsTexture.baseTexture &&
          typeof winsTexture.baseTexture.resolution === "number"
          ? winsTexture.baseTexture.resolution
          : "n/a"
      );

      // Resize the canvas to stay crisp on different screens.
      if (app) {
        app.renderer.resize(width, height);
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const animationRoot = new PIXI.Container();
      animationRoot.x = centerX;
      animationRoot.y = centerY;
      app.stage.addChild(animationRoot);

      // Main tier image
      const mainSprite = createRegionSprite(winsTexture.baseTexture, cfg.region);
      // Scale to a consistent visual size per tier.
      const isPhone = window.matchMedia("(max-width: 767px)").matches;
      const desiredMainHeight = isPhone
        ? (multiplier === 4 ? 90 : 132)
        : (multiplier === 4 ? 130 : 180);
      const baseH = cfg.region.h;
      const scale = desiredMainHeight / Math.max(1, baseH);
      mainSprite.scale.set(scale, scale);
      mainSprite.x = (cfg.region.ox || 0) * scale;
      mainSprite.y = cfg.titleYOffset + (cfg.region.oy || 0) * scale;

      // Label (WIN)
      const labelSprite = createRegionSprite(winsTexture.baseTexture, cfg.label);
      const desiredLabelHeight = 52;
      const labelScale = desiredLabelHeight / Math.max(1, cfg.label.h);
      labelSprite.scale.set(labelScale, labelScale);
      labelSprite.x = (cfg.label.ox || 0) * labelScale;
      labelSprite.y = cfg.labelYOffset + (cfg.label.oy || 0) * labelScale;

      // Frame behind amount text ("charcho")
      const amountFrameSprite = createRegionSprite(
        winsTexture.baseTexture,
        AMOUNT_FRAME_REGION
      );
      const desiredAmountFrameWidth = 260;
      const amountFrameScale =
        desiredAmountFrameWidth / Math.max(1, AMOUNT_FRAME_REGION.w);
      amountFrameSprite.scale.set(amountFrameScale, amountFrameScale);
      amountFrameSprite.x = 0;
      amountFrameSprite.y = 260;

      mainSprite.alpha = 0;
      labelSprite.alpha = 0;
      amountFrameSprite.alpha = 0;

      animationRoot.addChild(mainSprite);
      animationRoot.addChild(labelSprite);
      animationRoot.addChild(amountFrameSprite);

      const start = performance.now();
      const durationMs = multiplier === 5 ? 1300 : multiplier === 4 ? 1100 : 1000;

      currentTicker = (delta) => {
        if (!active) return;

        const now = performance.now();
        const t = Math.min(1, (now - start) / durationMs);

        // Base fade in
        const inT = Math.min(1, t / 0.25);
        mainSprite.alpha = inT;
        labelSprite.alpha = Math.max(0, (t - 0.15) / 0.25);
        amountFrameSprite.alpha = Math.max(0, (t - 0.2) / 0.25);

        if (cfg.anim === "super") {
          // Fast punch + gentle spin
          const punch = 0.15 + 1.0 * easeOutBack(t);
          mainSprite.scale.set(scale * punch, scale * punch);
          mainSprite.rotation += 0.02 * (1 - t);
          mainSprite.y = cfg.titleYOffset + Math.sin(t * Math.PI * 6) * (1 - t) * 6;
        } else if (cfg.anim === "fantastic") {
          // Slide from left + small shake
          mainSprite.x = lerp(-140, 0, easeOutCubic(t));
          const shake = (1 - t) * 6;
          mainSprite.y = cfg.titleYOffset + Math.sin(t * 40) * shake;
          mainSprite.scale.set(scale * (0.3 + 0.7 * easeOutCubic(t)), scale * (0.3 + 0.7 * easeOutCubic(t)));
        } else {
          // big: bounce up and settle
          const bounce = (1 - t) * 18 * Math.cos(t * Math.PI * 2);
          mainSprite.y = cfg.titleYOffset - bounce;
          const pulse = 1 + 0.04 * Math.sin(t * Math.PI * 8) * (1 - t);
          mainSprite.scale.set(scale * pulse, scale * pulse);
        }

        if (t >= 1) {
          stopAnimation();
          // keep the modal visible briefly after animation
          setTimeout(() => {
            overlay.hidden = true;
          }, 900);
        }
      };

      app.ticker.add(currentTicker);
    });
  }

  function lerp(a, b, t) {
    return a * (1 - t) + b * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  // Keep canvas size in sync with the host container.
  window.addEventListener("resize", () => {
    if (!app) return;
    const width = Math.max(1, pixiHost.clientWidth || 800);
    const height = Math.max(1, pixiHost.clientHeight || 320);
    app.renderer.resize(width, height);
  });

  window.addEventListener("slotspinresult", (event) => {
    const detail = event && event.detail;
    if (!detail) return;

    if (!detail.isWin) return;
    const multiplier = detail.multiplier;
    const winAmount = detail.winAmount;

    // Only show special animations on 3x/4x/5x tiers.
    if (multiplier !== 3 && multiplier !== 4 && multiplier !== 5) return;

    showWin(multiplier, winAmount);
  });
})();

