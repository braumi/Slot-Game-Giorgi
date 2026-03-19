(function initSpinScene() {
  if (!window.PIXI) return;

  const sceneElement = document.getElementById("slotScene");
  const spinButton = document.getElementById("spinButton");
  const turboButton = document.getElementById("turboButton");
  if (!sceneElement || !spinButton) return;

  const app = new PIXI.Application({
    width: Math.max(1, sceneElement.clientWidth || 760),
    height: Math.max(1, sceneElement.clientHeight || 456),
    backgroundAlpha: 0,
    antialias: true,
  });

  sceneElement.appendChild(app.view);

  let spinSeq = 0; // increments per click so other UIs can sync reliably
  let activeSpinSeq = 0;
  let turboMode = false;

  function syncTurboUI() {
    if (!turboButton) return;
    turboButton.classList.toggle("turbo-btn--on", turboMode);
    turboButton.setAttribute("aria-pressed", turboMode ? "true" : "false");
  }

  function setSpinButtonSpinning(spinning) {
    if (!spinButton) return;
    if (spinning) spinButton.classList.add("spin-btn--spinning");
    else spinButton.classList.remove("spin-btn--spinning");
  }

  function canAffordCurrentBet() {
    if (!window.slotGameState) return true;
    const balance = Number(window.slotGameState.balance);
    const bet = Number(window.slotGameState.bet);
    if (!Number.isFinite(balance) || !Number.isFinite(bet)) return true;
    return balance >= bet && bet > 0;
  }

  function syncSpinButtonAvailability() {
    if (!spinButton) return;
    const blocked = !canAffordCurrentBet() && !running;
    spinButton.classList.toggle("spin-btn--blocked", blocked);
    spinButton.setAttribute("aria-disabled", blocked ? "true" : "false");
  }

  if (turboButton) {
    turboButton.addEventListener("click", () => {
      // Apply immediately for the next spin.
      turboMode = !turboMode;
      window.slotGameState.turboMode = turboMode;
      syncTurboUI();
    });
    // Initialize
    window.slotGameState.turboMode = turboMode;
    syncTurboUI();
  }

  window.addEventListener("hudupdated", syncSpinButtonAvailability);
  setTimeout(syncSpinButtonAvailability, 0);

  const CHIKEN_IMAGE_URL = "./Content/Images/Spines/Box/chiken.png";
  const KACI_IMAGE_URL = "./Content/Images/kaci.png";
  const CHIKEN_FRAMES = [
    { key: "charchoCopy", x: 1346, y: 698, w: 332, h: 303, rotated: true }, // charcho
    { key: "cow", x: 2, y: 34, w: 222, h: 203, rotated: false },
    { key: "cowTav", x: 226, y: 41, w: 214, h: 196, rotated: false },
    { key: "cowTval1", x: 55, y: 4, w: 28, h: 32, rotated: true },
    { key: "cowTval2", x: 1626, y: 467, w: 28, h: 32, rotated: false },
    { key: "cowYur1", x: 804, y: 4, w: 54, h: 55, rotated: true },
    { key: "cowYur2", x: 1325, y: 17, w: 79, h: 44, rotated: false },
    { key: "cowZar", x: 646, y: 5, w: 48, h: 54, rotated: true },
    { key: "cowZarQamari", x: 1122, y: 97, w: 137, h: 149, rotated: false },
    { key: "cxvari", x: 1346, y: 447, w: 200, h: 278, rotated: true, previewRotation: Math.PI },
    { key: "cxvariGuga1", x: 1626, y: 501, w: 42, h: 28, rotated: true },
    { key: "cxvariGuga2", x: 89, y: 8, w: 31, h: 24, rotated: false },
    { key: "cxvariYuriShadow", x: 1406, y: 3, w: 84, h: 62, rotated: false },
    { key: "cxvariYuri1", x: 1626, y: 575, w: 73, h: 35, rotated: true },
    { key: "cxvariYuri2", x: 1294, y: 482, w: 88, h: 48, rotated: true },
    { key: "cxvariTvali1", x: 122, y: 11, w: 21, h: 21, rotated: false },
    { key: "cxvariTvali2", x: 122, y: 11, w: 21, h: 21, rotated: false },
    { key: "chicken", x: 1294, y: 189, w: 256, h: 257, rotated: true, previewRotation: Math.PI },
    { key: "niskarti", x: 1261, y: 211, w: 31, h: 35, rotated: false },
    { key: "kudi", x: 1539, y: 8, w: 114, h: 137, rotated: false },
    { key: "frta", x: 1261, y: 63, w: 124, h: 142, rotated: true },
    { key: "guga1", x: 861, y: 9, w: 19, h: 22, rotated: false },
    { key: "guga2", x: 861, y: 33, w: 22, h: 25, rotated: false },
    { key: "bibilo", x: 1492, y: 11, w: 35, h: 54, rotated: false },
    { key: "bibilo2", x: 1243, y: 2, w: 80, h: 59, rotated: false },
    { key: "kaciSaxe", x: 1405, y: 67, w: 120, h: 132, rotated: true },
    { key: "kaciEyeL", x: 1122, y: 78, w: 17, h: 17, rotated: false },
    { key: "kaciEyeR", x: 1243, y: 79, w: 16, h: 16, rotated: false },
    { key: "kaciHair", x: 1553, y: 147, w: 117, h: 76, rotated: true },
    { key: "kaciHat", x: 804, y: 60, w: 177, h: 157, rotated: true },
    { key: "wild", x: 1103, y: 2, w: 138, h: 74, rotated: false },
  ];
  const FERMA_IMAGE_URL = "./Content/Images/Spines/Box/ferma.png";
  const FERMA_PREVIEW_FRAMES = [
    { key: "K", x: 2, y: 3, w: 157, h: 92, rotated: false, label: "K", previewRotation: Math.PI / 2},
    { key: "J", x: 567, y: 2, w: 152, h: 140, rotated: false, label: "J" },
    { key: "A", x: 1433, y: 40, w: 103, h: 150, rotated: false, label: "A" },
    { key: "7", x: 626, y: 156, w: 183, h: 190, rotated: false, label: "7" },
    { key: "Q", x: 1289, y: 33, w: 142, h: 155, rotated: false, label: "Watermelon" },
    { key: "kalata", x: 1668, y: 64, w: 138, h: 134, rotated: true, label: "Basket", previewRotation: Math.PI },
    { key: "moreyva", x: 1763, y: 216, w: 129, h: 130, rotated: false, label: "Watering Can" },
    { key: "scatter", x: 229, y: 127, w: 95, h: 219, rotated: false, label: "Scatter", showInGrid: false, previewRotation: Math.PI / 2 },
  ];
  const SYMBOL_POOL = [
    "K",
    "J",
    "A",
    "7",
    "Q",
    "kalataScatter",
    "kalataScatter",
    "moreyvaScatter",
    "moreyvaScatter",
    "cow",
    "cxvari",
    "chicken",
    "kaci",
  ];
  const SYMBOL_SCALE_BOOST = {
    default: 1.18,
    kalataScatter: 1.08,
    moreyvaScatter: 1.08,
    cow: 1.12,
    cxvari: 1.12,
    chicken: .5,
    kaci: 1.12,
    A: 1.12,
  };
  const SYMBOL_OFFSET_X = {
    J: 20,
    Q: 6,
    "7": -6,
    chicken: 6,
  };
  const SYMBOL_OFFSET_Y = {
    J: -2,
    K: -14,
    Q: -15,
    "7": -7,
    kaci: -5,
    chicken: -6,
    chicken: -6,
    chicken: -6,
  };
  const SYMBOL_CELL_INSET = 3;
  const CHARCHO_REFERENCE_SCALE_X = 0.50;
  const CHARCHO_REFERENCE_SCALE_Y = 0.44;
  const CHARCHO_UNIFORM_SCALE_X = 0.50;
  const CHARCHO_UNIFORM_SCALE_Y = 0.43;
  const CHARCHO_OFFSET_Y = -5;
  const FRAMED_SYMBOL_KEYS = {
    cow: true,
    cxvari: true,
    chicken: true,
  };
  const FRAMED_SYMBOL_SCALE_BOOST = 1.12;

  const tweening = [];
  const reels = [];
  const reelContainer = new PIXI.Container();
  const reelMask = new PIXI.Graphics();

  let slotTextures = {};
  let fermaTextures = {};
  let chikenTextures = {};
  let charchoReferenceSize = { width: 1, height: 1 };
  let running = false;
  let sevenEffects = [];
  let activeSpinRequest = null;
  let activeSpinResult = null;
  let layout = {
    reelWidth: 140,
    symbolSize: 130,
    margin: 0,
  };

  app.stage.addChild(reelContainer);
  app.stage.addChild(reelMask);
  reelContainer.mask = reelMask;

  function getLayout() {
    const isPhone = window.matchMedia("(max-width: 767px)").matches;
    const minReelWidth = isPhone ? 62 : 95;
    const minSymbolSize = isPhone ? 58 : 90;
    const reelWidth = Math.max(minReelWidth, Math.floor(app.screen.width / 5));
    const symbolSize = Math.max(
      minSymbolSize,
      Math.floor(Math.min(reelWidth - 6, app.screen.height / 3))
    );
    const margin = Math.round((app.screen.height - symbolSize * 3) / 2);

    return { reelWidth, symbolSize, margin };
  }

  function fitSymbol(sprite) {
    const isFramedSymbol = !!FRAMED_SYMBOL_KEYS[sprite.symbolKey];
    if (isFramedSymbol) {
      const scaleX = layout.reelWidth / Math.max(1, charchoReferenceSize.width);
      const scaleY = layout.symbolSize / Math.max(1, charchoReferenceSize.height);
      sprite.scale.set(scaleX, scaleY);
      sprite.x = Math.round((layout.reelWidth - sprite.width) / 2);
      return;
    }

    const maxWidth = Math.max(1, layout.reelWidth - SYMBOL_CELL_INSET * 2);
    const maxHeight = Math.max(1, layout.symbolSize - SYMBOL_CELL_INSET * 2);
    const baseRatio = Math.min(
      maxWidth / sprite.texture.width,
      maxHeight / sprite.texture.height
    );
    const boost = SYMBOL_SCALE_BOOST[sprite.symbolKey] || SYMBOL_SCALE_BOOST.default;
    const ratio = baseRatio * boost;

    sprite.scale.set(ratio);
    const offsetX = SYMBOL_OFFSET_X[sprite.symbolKey] || 0;
    sprite.x = Math.round((layout.reelWidth - sprite.width) / 2 + offsetX);
  }

  function placeSymbolInCell(symbol, cellY) {
    symbol.cellY = cellY;
    const isFramedSymbol = !!FRAMED_SYMBOL_KEYS[symbol.symbolKey];
    if (isFramedSymbol) {
      symbol.y = cellY;
      return;
    }

    const isPhone = window.matchMedia("(max-width: 767px)").matches;
    const phoneSymbolOffset =
      isPhone && (symbol.symbolKey === "Q" || symbol.symbolKey === "K") ? 10 : 0;
    const offsetY = (SYMBOL_OFFSET_Y[symbol.symbolKey] || 0) + phoneSymbolOffset;
    symbol.y = Math.round(
      cellY + (layout.symbolSize - symbol.height) / 2 + offsetY
    );
  }

  function setSymbolTexture(symbol, key) {
    symbol.texture = slotTextures[key];
    symbol.symbolKey = key;
    fitSymbol(symbol);
  }

  function getRandomSymbolKey() {
    return SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)];
  }

  function relayout() {
    layout = getLayout();

    reelContainer.x = Math.round((app.screen.width - layout.reelWidth * 5) / 2);
    reelContainer.y = layout.margin;

    for (let i = 0; i < reels.length; i++) {
      const reel = reels[i];
      reel.container.x = i * layout.reelWidth;
      reel.container.y = 0;

      for (let j = 0; j < reel.symbols.length; j++) {
        const symbol = reel.symbols[j];
        const cellY =
          ((reel.position + j) % reel.symbols.length) * layout.symbolSize -
          layout.symbolSize;
        fitSymbol(symbol);
        placeSymbolInCell(symbol, cellY);
      }
    }

    reelMask.clear();
    reelMask.beginFill(0xffffff, 1);
    reelMask.drawRect(
      reelContainer.x,
      reelContainer.y,
      layout.reelWidth * 5,
      layout.symbolSize * 3
    );
    reelMask.endFill();

  }

  loadAssets([FERMA_IMAGE_URL, CHIKEN_IMAGE_URL, KACI_IMAGE_URL])
    .then(onAssetsLoaded)
    .catch((error) => {
      console.error("Failed to load slot assets:", error);
    });

  function onAssetsLoaded() {
    fermaTextures = buildFermaTextures();
    chikenTextures = buildChikenTextures();
    charchoReferenceSize = {
      width: Math.max(
        1,
        chikenTextures.charchoCopy.width * CHARCHO_REFERENCE_SCALE_X
      ),
      height: Math.max(
        1,
        chikenTextures.charchoCopy.height * CHARCHO_REFERENCE_SCALE_Y
      ),
    };
    slotTextures = buildGameSymbolTextures();

    for (let i = 0; i < 5; i++) {
      const reelContainerColumn = new PIXI.Container();
      reelContainer.addChild(reelContainerColumn);

      const reel = {
        container: reelContainerColumn,
        symbols: [],
        position: 0,
        previousPosition: 0,
        blur: new PIXI.filters.BlurFilter(),
      };

      reel.blur.blurX = 0;
      reel.blur.blurY = 0;
      reelContainerColumn.filters = [reel.blur];

      for (let j = 0; j < 4; j++) {
        const symbol = new PIXI.Sprite();
        setSymbolTexture(symbol, getRandomSymbolKey());

        reel.symbols.push(symbol);
        reelContainerColumn.addChild(symbol);
      }

      reels.push(reel);
    }

    relayout();
  }

  spinButton.addEventListener("click", () => {
    startPlay();
  });

  spinButton.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      startPlay();
    }
  });

  window.addEventListener("resize", () => {
    app.renderer.resize(
      Math.max(1, sceneElement.clientWidth || 1),
      Math.max(1, sceneElement.clientHeight || 1)
    );
    relayout();
  });

  function startPlay() {
    if (running || reels.length === 0 || !canAffordCurrentBet()) {
      syncSpinButtonAvailability();
      return;
    }

    running = true;
    activeSpinSeq = ++spinSeq;
    setSpinButtonSpinning(true);
    clearSevenEffects();
    // turboMode: 3x faster => durations are divided by 3
    const turboFactor = turboMode ? 1 / 3 : 1;
    let maxSpinTime = 0;
    let firstReelStopTime = 0;

    const betAmount =
      (window.slotGameState && Number(window.slotGameState.bet)) || 1;

    // Immediate UI feedback: subtract bet right away on click.
    // The backend (fake.api.js) will confirm/overwrite the balance shortly after.
    if (
      window.slotGameState &&
      typeof window.slotGameState.balance === "number" &&
      window.slotGameState.balance >= betAmount
    ) {
      window.slotGameState.balance -= betAmount;
      if (
        window.slotGameLogic &&
        typeof window.slotGameLogic.syncHud === "function"
      ) {
        window.slotGameLogic.syncHud();
      }
    }
    activeSpinResult = null;
    const spinSeqForThisSpin = activeSpinSeq;
    if (window.slotGameLogic && typeof window.slotGameLogic.requestSpin === "function") {
      activeSpinRequest = window.slotGameLogic
        .requestSpin(betAmount)
        .then((result) => {
          activeSpinResult = result;
          if (result && typeof result.Multiplier === "number") {
            window.dispatchEvent(
              new CustomEvent("slotmultiplierready", {
                detail: { multiplier: result.Multiplier, spinSeq: spinSeqForThisSpin },
              })
            );
          }
          return result;
        })
        .catch(() => null);
    } else {
      activeSpinRequest = Promise.resolve(null);
    }

    for (let i = 0; i < reels.length; i++) {
      const reel = reels[i];
      const extra = Math.floor(Math.random() * 3);
      const target = reel.position + 10 + i * 5 + extra;
      // Keep stop order strictly left->right by making the random time component small
      // compared to the base i*600 stagger.
      // Also make the 4th & 5th reels a bit faster by reducing their stagger.
      const timeStagger = i * 600;
      const tailPenalty = i >= 3 ? (i - 2) * 250 : 0; // i=3 ->250ms faster, i=4 ->500ms faster
      const rawTime = 2500 + timeStagger + extra * 200 - tailPenalty;
      const time = Math.max(200, rawTime * turboFactor);
      if (i === 0) firstReelStopTime = time;
      maxSpinTime = Math.max(maxSpinTime, time);

      tweenTo(
        reel,
        "position",
        target,
        time,
        easeOutCubic,
        null,
        i === reels.length - 1 ? reelsComplete : null
      );
    }

    window.dispatchEvent(
      new CustomEvent("slotspinstart", {
        detail: {
          durationMs: Math.max(200, maxSpinTime - 250),
          spinSeq: activeSpinSeq,
        },
      })
    );
  }

  async function reelsComplete() {
    applySevenWinEffects();
    let spinResult = activeSpinResult;
    if (!spinResult && activeSpinRequest) {
      spinResult = await activeSpinRequest;
    }
    activeSpinRequest = null;
    activeSpinResult = null;

    // API UserWin already includes its own multiplier from fake.api.js
    const totalWin =
      spinResult && typeof spinResult.UserWin === "number"
        ? spinResult.UserWin
        : 0;
    const isWin = totalWin > 0;

    window.dispatchEvent(
      new CustomEvent("slotspinresult", {
        detail: {
          isWin,
          winAmount: totalWin,
          board: spinResult && spinResult.Baraban ? spinResult.Baraban : null,
          multiplier:
            spinResult && typeof spinResult.Multiplier === "number"
              ? spinResult.Multiplier
              : 1,
          spinSeq: activeSpinSeq,
        },
      })
    );

    if (window.slotGameLogic && typeof window.slotGameLogic.syncHud === "function") {
      window.slotGameLogic.syncHud();
    }
    running = false;
    setSpinButtonSpinning(false);
    syncSpinButtonAvailability();
  }

  app.ticker.add(() => {
    for (let i = 0; i < reels.length; i++) {
      const reel = reels[i];

      reel.blur.blurY = (reel.position - reel.previousPosition) * 8;
      reel.previousPosition = reel.position;

      for (let j = 0; j < reel.symbols.length; j++) {
        const symbol = reel.symbols[j];
        const previousCellY =
          typeof symbol.cellY === "number" ? symbol.cellY : symbol.y;

        const cellY =
          ((reel.position + j) % reel.symbols.length) * layout.symbolSize -
          layout.symbolSize;
        placeSymbolInCell(symbol, cellY);

        if (cellY < 0 && previousCellY > layout.symbolSize) {
          setSymbolTexture(symbol, getRandomSymbolKey());
          placeSymbolInCell(symbol, cellY);
        }
      }
    }
  });

  app.ticker.add(() => {
    const now = Date.now();
    const remove = [];

    for (let i = 0; i < tweening.length; i++) {
      const tween = tweening[i];
      const phase = Math.min(1, (now - tween.start) / tween.time);

      tween.object[tween.property] = lerp(
        tween.propertyBeginValue,
        tween.target,
        tween.easing(phase)
      );

      if (tween.change) tween.change(tween);

      if (phase === 1) {
        tween.object[tween.property] = tween.target;
        if (tween.complete) tween.complete(tween);
        remove.push(tween);
      }
    }

    for (let i = 0; i < remove.length; i++) {
      tweening.splice(tweening.indexOf(remove[i]), 1);
    }
  });

  function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
    const tween = {
      object,
      property,
      propertyBeginValue: object[property],
      target,
      easing,
      time,
      change: onchange,
      complete: oncomplete,
      start: Date.now(),
    };

    tweening.push(tween);
    return tween;
  }

  function lerp(a, b, t) {
    return a * (1 - t) + b * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function backout(amount) {
    return function ease(t) {
      return --t * t * ((amount + 1) * t + amount) + 1;
    };
  }

  function loadAssets(urls) {
    if (PIXI.Assets && typeof PIXI.Assets.load === "function") {
      return PIXI.Assets.load(urls);
    }

    return new Promise((resolve, reject) => {
      const loader = new PIXI.Loader();
      for (let i = 0; i < urls.length; i++) {
        loader.add(urls[i], urls[i]);
      }

      loader.load(() => resolve());
      loader.onError.once((error) => reject(error));
    });
  }

  function buildGameSymbolTextures() {
    const textures = {};

    // Base ferma symbols
    textures.K = rotateTexture(fermaTextures.K, Math.PI / 2);
    textures.J = fermaTextures.J;
    textures.A = fermaTextures.A;
    textures["7"] = fermaTextures["7"];
    textures.Q = fermaTextures.Q;

    // Kept for seven-win lighting effect
    textures["7i"] = fermaTextures["7i"];
    textures["7ganateba"] = fermaTextures["7ganateba"];

    // Chiken symbols (framed in reel textures)
    textures.cow = buildFramedContainerTexture(buildCowPreview(190), 0.74, -2, -6);
    textures.kaci = buildKaciWildTexture();

    const chickenLayers = buildChickenPreview(190);
    const chickenContainer = new PIXI.Container();
    chickenContainer.addChild(chickenLayers.bodyContainer);
    chickenContainer.addChild(chickenLayers.topContainer);
    textures.chicken = buildFramedCompositeTexture(
      chickenLayers.bodyContainer,
      chickenLayers.topContainer,
      true,
      0.76,
      8,
      -8
    );

    const cxvariLayers = buildCxvariPreview(190);
    const cxvariContainer = new PIXI.Container();
    cxvariContainer.addChild(cxvariLayers.bodyContainer);
    cxvariContainer.addChild(cxvariLayers.topContainer);
    textures.cxvari = buildFramedCompositeTexture(
      cxvariLayers.bodyContainer,
      cxvariLayers.topContainer,
      true,
      0.97,
      3,
      -11,
      0.65,
      1
    );

    // Basket/Watering can with scatter on top (scatter is not standalone)
    textures.kalataScatter = buildFermaWithScatterTexture("kalata", 175);
    textures.moreyvaScatter = buildFermaWithScatterTexture("moreyva", 175);

    return textures;
  }

  function buildFermaTextures() {
    const baseTexture = PIXI.BaseTexture.from(FERMA_IMAGE_URL);
    const textures = {};

    for (let i = 0; i < FERMA_PREVIEW_FRAMES.length; i++) {
      const frame = FERMA_PREVIEW_FRAMES[i];
      const rectangle = new PIXI.Rectangle(
        frame.x,
        frame.y,
        frame.rotated ? frame.h : frame.w,
        frame.rotated ? frame.w : frame.h
      );
      textures[frame.key] = new PIXI.Texture(
        baseTexture,
        rectangle,
        undefined,
        undefined,
        frame.rotated ? 2 : 0
      );
    }

    return textures;
  }

  function buildChikenTextures() {
    const baseTexture = PIXI.BaseTexture.from(CHIKEN_IMAGE_URL);
    const textures = {};

    for (let i = 0; i < CHIKEN_FRAMES.length; i++) {
      const frame = CHIKEN_FRAMES[i];
      const rectangle = new PIXI.Rectangle(
        frame.x,
        frame.y,
        frame.rotated ? frame.h : frame.w,
        frame.rotated ? frame.w : frame.h
      );
      textures[frame.key] = new PIXI.Texture(
        baseTexture,
        rectangle,
        undefined,
        undefined,
        frame.rotated ? 2 : 0
      );
    }

    return textures;
  }

  function renderFermaPreview() {
    if (!chikenTextures || Object.keys(chikenTextures).length === 0) return;

    fermaPreviewContainer.removeChildren();

    const displayFrames = [
      "K",
      "J",
      "A",
      "7",
      "Q",
      "kalata",
      "moreyva",
      "cow",
      "cxvari",
      "chicken",
      "kaci",
    ];
    const columns = 4;
    const cardW = Math.floor(Math.min(app.screen.width / 4.8, 128));
    const cardH = Math.floor(Math.min(app.screen.height / 4.1, 138));
    const pad = 8;
    const gridW = columns * cardW + (columns - 1) * pad;
    const rows = Math.ceil(displayFrames.length / columns);
    const gridH = rows * cardH + (rows - 1) * pad;

    const panel = new PIXI.Graphics();
    panel.beginFill(0x000000, 0.45);
    panel.drawRoundedRect(-10, -10, gridW + 20, gridH + 20, 12);
    panel.endFill();
    fermaPreviewContainer.addChild(panel);

    for (let i = 0; i < displayFrames.length; i++) {
      const frame = displayFrames[i];
      const col = i % columns;
      const row = Math.floor(i / columns);

      const cell = new PIXI.Container();
      cell.x = col * (cardW + pad);
      cell.y = row * (cardH + pad);

      const cellBg = new PIXI.Graphics();
      cellBg.beginFill(0xffffff, 0.12);
      cellBg.drawRoundedRect(0, 0, cardW, cardH, 10);
      cellBg.endFill();
      cell.addChild(cellBg);

      const targetSize = Math.min(cardW, cardH - 26) * 0.7;
      const centerX = cardW / 2;
      const centerY = cardH / 2 - 8;

      let chickenLayers = null;
      let cxvariLayers = null;

      const isFermaSymbol = ["K", "J", "A", "7", "Q", "kalata", "moreyva"].includes(frame);
      const usesFrame = ["cow", "cxvari", "chicken", "kaci"].includes(frame);

      if (isFermaSymbol) {
        const symbolContainer = buildSingleFermaSymbol(frame, targetSize);
        symbolContainer.x = centerX;
        symbolContainer.y = centerY;
        cell.addChild(symbolContainer);

        if (frame === "kalata" || frame === "moreyva") {
          const scatterOverlay = buildSingleFermaSymbol("scatter", targetSize * 1.1);
          scatterOverlay.x = centerX;
          scatterOverlay.y = centerY + 12;
          scatterOverlay.alpha = 0.95;
          cell.addChild(scatterOverlay);
        }
      } else if (frame === "chicken") {
        chickenLayers = buildChickenPreview(targetSize);
        chickenLayers.bodyContainer.x = centerX + 10;
        chickenLayers.bodyContainer.y = centerY + 12;
        chickenLayers.topContainer.x = centerX + 10;
        chickenLayers.topContainer.y = centerY + 12;
        cell.addChild(chickenLayers.bodyContainer);
      } else if (frame === "cxvari") {
        cxvariLayers = buildCxvariPreview(targetSize);
        cxvariLayers.bodyContainer.x = centerX + 4;
        cxvariLayers.bodyContainer.y = centerY + 8;
        cxvariLayers.topContainer.x = centerX + 8;
        cxvariLayers.topContainer.y = centerY - 6;
      } else {
        const symbolContainer = frame === "kaci"
          ? buildKaciHeadPreview(targetSize)
          : buildSingleChikenSymbol(frame, targetSize);
        symbolContainer.x = centerX;
        symbolContainer.y = centerY;
        cell.addChild(symbolContainer);
      }

      if (usesFrame) {
        const charcho = new PIXI.Sprite(chikenTextures.charchoCopy);
        charcho.anchor.set(0.5);
        const frameRatio = Math.min((cardW * 0.67) / charcho.texture.width, (cardH * 0.67) / charcho.texture.height);
        charcho.scale.set(frameRatio);
        charcho.x = cardW / 2;
        charcho.y = cardH / 2 - 2;
        charcho.rotation = Math.PI;
        cell.addChild(charcho);
      }

      if (chickenLayers) {
        cell.addChild(chickenLayers.topContainer);
      }
      if (cxvariLayers) {
        cell.addChild(cxvariLayers.bodyContainer);
        cell.addChild(cxvariLayers.topContainer);
      }

      const labelMap = {
        Q: "Watermelon",
        kalata: "Basket",
        moreyva: "Watering Can",
        kaci: "kaci (head)",
      };
      const labelText = labelMap[frame] || frame;
      const label = new PIXI.Text(labelText, {
        fontFamily: "Arial",
        fontSize: 11,
        fill: 0xffffff,
      });
      label.anchor.set(0.5, 1);
      label.x = cardW / 2;
      label.y = cardH - 4;
      cell.addChild(label);

      fermaPreviewContainer.addChild(cell);
    }

    fermaPreviewContainer.x = Math.round((app.screen.width - gridW) / 2);
    fermaPreviewContainer.y = Math.max(6, Math.round(layout.margin * 0.08));
    fermaPreviewContainer.zIndex = 20;
  }

  function buildSingleChikenSymbol(key, targetSize) {
    const container = new PIXI.Container();
    const frame = CHIKEN_FRAMES.find((item) => item.key === key);
    const sprite = new PIXI.Sprite(chikenTextures[key]);
    sprite.anchor.set(0.5);
    const ratio = Math.min(targetSize / sprite.texture.width, targetSize / sprite.texture.height);
    sprite.scale.set(ratio);
    if (frame && typeof frame.previewRotation === "number") {
      sprite.rotation = frame.previewRotation;
    }
    container.addChild(sprite);
    return container;
  }

  function buildSingleFermaSymbol(key, targetSize) {
    const container = new PIXI.Container();
    const frame = FERMA_PREVIEW_FRAMES.find((item) => item.key === key);
    const sprite = new PIXI.Sprite(fermaTextures[key]);
    sprite.anchor.set(0.5);
    const ratio = Math.min(targetSize / sprite.texture.width, targetSize / sprite.texture.height);
    sprite.scale.set(ratio);
    if (frame && typeof frame.previewRotation === "number") {
      sprite.rotation = frame.previewRotation;
    }
    container.addChild(sprite);
    return container;
  }

  function buildKaciWildTexture() {
    const container = new PIXI.Container();

    const base = new PIXI.Sprite(PIXI.Texture.from(KACI_IMAGE_URL));
    base.anchor.set(0.5);
    base.x = 0;
    base.y = 0;
    container.addChild(base);

    const wild = new PIXI.Sprite(chikenTextures.wild);
    wild.anchor.set(0.5);
    const wildRatio = (base.width * 0.62) / Math.max(1, wild.texture.width);
    wild.scale.set(wildRatio);
    wild.x = 0;
    wild.y = 58;
    container.addChild(wild);

    const baseRegion = new PIXI.Rectangle(
      -base.width / 2 - 2,
      -base.height / 2 - 2,
      Math.max(1, base.width + 4),
      Math.max(1, base.height + 4)
    );

    return containerToTexture(container, baseRegion);
  }

  function buildFermaWithScatterTexture(baseKey, targetSize) {
    const container = new PIXI.Container();
    const base = buildSingleFermaSymbol(baseKey, targetSize);
    const scatter = buildSingleFermaSymbol("scatter", targetSize * 1.1);
    base.x = 0;
    base.y = 0;
    scatter.x = 0;
    scatter.y = 20;
    scatter.alpha = 0.95;
    container.addChild(base);
    container.addChild(scatter);
    return containerToTexture(container);
  }

  function buildFramedSingleChikenSymbolTexture(
    key,
    targetSize,
    contentScale = 1,
    contentOffsetX = 0,
    contentOffsetY = 0
  ) {
    const content = buildSingleChikenSymbol(key, targetSize);
    return buildFramedContainerTexture(
      content,
      contentScale,
      contentOffsetX,
      contentOffsetY
    );
  }

  function buildFramedCompositeTexture(
    bodyContainer,
    topContainer,
    frameBehindAll = false,
    contentScale = 1,
    contentOffsetX = 0,
    contentOffsetY = 0,
    contentScaleX = 1,
    contentScaleY = 1
  ) {
    if (contentScale !== 1 || contentScaleX !== 1 || contentScaleY !== 1) {
      const finalScaleX = contentScale * contentScaleX;
      const finalScaleY = contentScale * contentScaleY;
      bodyContainer.scale.set(
        bodyContainer.scale.x * finalScaleX,
        bodyContainer.scale.y * finalScaleY
      );
      topContainer.scale.set(
        topContainer.scale.x * finalScaleX,
        topContainer.scale.y * finalScaleY
      );
    }

    const wrapper = new PIXI.Container();
    const measure = new PIXI.Container();
    measure.addChild(bodyContainer);
    measure.addChild(topContainer);
    const bounds = measure.getLocalBounds();
    const frame = createFrameSprite(bounds);

    if (contentOffsetX !== 0 || contentOffsetY !== 0) {
      bodyContainer.x += contentOffsetX;
      bodyContainer.y += contentOffsetY;
      topContainer.x += contentOffsetX;
      topContainer.y += contentOffsetY;
    }

    if (frameBehindAll) {
      wrapper.addChild(frame);
      wrapper.addChild(bodyContainer);
      wrapper.addChild(topContainer);
    } else {
      wrapper.addChild(bodyContainer);
      wrapper.addChild(frame);
      wrapper.addChild(topContainer);
    }

    return containerToTexture(wrapper, getFrameLockedRegion(frame));
  }

  function buildFramedContainerTexture(
    contentContainer,
    contentScale = 1,
    contentOffsetX = 0,
    contentOffsetY = 0
  ) {
    const wrapper = new PIXI.Container();
    if (contentScale !== 1) {
      contentContainer.scale.set(
        contentContainer.scale.x * contentScale,
        contentContainer.scale.y * contentScale
      );
    }
    const measure = new PIXI.Container();
    measure.addChild(contentContainer);
    const bounds = measure.getLocalBounds();
    const frame = createFrameSprite(bounds);

    if (contentOffsetX !== 0 || contentOffsetY !== 0) {
      contentContainer.x += contentOffsetX;
      contentContainer.y += contentOffsetY;
    }

    wrapper.addChild(frame);
    wrapper.addChild(contentContainer);
    return containerToTexture(wrapper, getFrameLockedRegion(frame));
  }

  function createFrameSprite(contentBounds) {
    const frame = new PIXI.Sprite(chikenTextures.charchoCopy);
    frame.anchor.set(0.5);
    frame.rotation = Math.PI;

    const centerX = contentBounds.x + contentBounds.width / 2;
    const centerY = contentBounds.y + contentBounds.height / 2;
    frame.x = centerX;
    frame.y = centerY + CHARCHO_OFFSET_Y;

    // Keep frame close to content so framed symbols can fill reel cells more.
    frame.scale.set(CHARCHO_UNIFORM_SCALE_X, CHARCHO_UNIFORM_SCALE_Y);

    return frame;
  }

  function getFrameLockedRegion(frame) {
    return new PIXI.Rectangle(
      frame.x - charchoReferenceSize.width / 2 - 2,
      frame.y - charchoReferenceSize.height / 2 - 2,
      Math.max(1, charchoReferenceSize.width + 4),
      Math.max(1, charchoReferenceSize.height + 4)
    );
  }

  function containerToTexture(container, regionOverride) {
    const bounds = container.getLocalBounds();
    const region = regionOverride || new PIXI.Rectangle(
      bounds.x - 2,
      bounds.y - 2,
      Math.max(1, bounds.width + 4),
      Math.max(1, bounds.height + 4)
    );
    return app.renderer.generateTexture(
      container,
      PIXI.SCALE_MODES.LINEAR,
      2,
      region
    );
  }

  function rotateTexture(texture, radians) {
    const container = new PIXI.Container();
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.rotation = radians;
    container.addChild(sprite);
    return containerToTexture(container);
  }

  function buildChickenPreview(targetSize) {
    const bodyContainer = new PIXI.Container();
    const topContainer = new PIXI.Container();
    const measureContainer = new PIXI.Container();

    const bodySpec = { key: "chicken", x: 0, y: 0, rotation: Math.PI };
    const topSpecs = [
      { key: "niskarti", x: -65, y: -54, rotation: 0 },
      { key: "kudi", x: 120, y: -48, rotation: -0.12 },
      { key: "bibilo", x: -65, y: -20, rotation: -0.08 },
      { key: "bibilo2", x: -40, y: -130, rotation: -0.1 },
      { key: "guga1", x: -82, y: -83, rotation: 0 },
      { key: "guga2", x: -40, y: -83, rotation: 0 },
      { key: "frta", x: 70, y: 60, rotation: Math.PI + 0.28 },
    ];

    const body = new PIXI.Sprite(chikenTextures[bodySpec.key]);
    body.anchor.set(0.5);
    body.x = bodySpec.x;
    body.y = bodySpec.y;
    body.rotation = bodySpec.rotation;
    bodyContainer.addChild(body);

    const measureBody = new PIXI.Sprite(chikenTextures[bodySpec.key]);
    measureBody.anchor.set(0.5);
    measureBody.x = bodySpec.x;
    measureBody.y = bodySpec.y;
    measureBody.rotation = bodySpec.rotation;
    measureContainer.addChild(measureBody);

    for (let i = 0; i < topSpecs.length; i++) {
      const spec = topSpecs[i];
      const part = new PIXI.Sprite(chikenTextures[spec.key]);
      part.anchor.set(0.5);
      part.x = spec.x;
      part.y = spec.y;
      part.rotation = spec.rotation;
      topContainer.addChild(part);

      const measurePart = new PIXI.Sprite(chikenTextures[spec.key]);
      measurePart.anchor.set(0.5);
      measurePart.x = spec.x;
      measurePart.y = spec.y;
      measurePart.rotation = spec.rotation;
      measureContainer.addChild(measurePart);
    }

    const bounds = measureContainer.getLocalBounds();
    const pivotX = bounds.x + bounds.width / 2;
    const pivotY = bounds.y + bounds.height / 2;
    const ratio = Math.min(targetSize / bounds.width, targetSize / bounds.height);

    bodyContainer.pivot.set(pivotX, pivotY);
    topContainer.pivot.set(pivotX, pivotY);
    bodyContainer.scale.set(ratio);
    topContainer.scale.set(ratio);

    return { bodyContainer, topContainer };
  }

  function buildCxvariPreview(targetSize) {
    const bodyContainer = new PIXI.Container();
    const topContainer = new PIXI.Container();
    const measureContainer = new PIXI.Container();

    const bodySpec = { key: "cxvari", x: 10, y: 0, rotation: Math.PI };
    const underBodySpec = {
      key: "cxvariYuri1",
      x: 120,
      y: -35,
      rotation: Math.PI,
      scaleX: 2,
      scaleY: 0.4,
    };
    const topSpecs = [
      { key: "cxvariYuriShadow",x: -80, y: -14, rotation: Math.PI / 3 + Math.PI / 24 - Math.PI /12, scaleY: 1, scaleX: 0.3 },
      { key: "cxvariYuri2", x: -60, y: -25, rotation: Math.PI / 3 + Math.PI + Math.PI / 24, scaleY: 1.2, scaleX: 0.7 },
      { key: "cxvariTvali1", x: 32, y: -20, rotation: 0, scaleY: 0.8},
      { key: "cxvariTvali2", x: 90, y: -22, rotation: 0, scaleY: 0.8},
    ];

    const body = new PIXI.Sprite(chikenTextures[bodySpec.key]);
    body.anchor.set(0.5);
    body.x = bodySpec.x;
    body.y = bodySpec.y;
    body.rotation = bodySpec.rotation;
    const underBody = new PIXI.Sprite(chikenTextures[underBodySpec.key]);
    underBody.anchor.set(0.5);
    underBody.x = underBodySpec.x;
    underBody.y = underBodySpec.y;
    underBody.rotation = underBodySpec.rotation;
    underBody.scale.set(underBodySpec.scaleX, underBodySpec.scaleY);
    bodyContainer.addChild(underBody);
    bodyContainer.addChild(body);

    const measureBody = new PIXI.Sprite(chikenTextures[bodySpec.key]);
    measureBody.anchor.set(0.5);
    measureBody.x = bodySpec.x;
    measureBody.y = bodySpec.y;
    measureBody.rotation = bodySpec.rotation;
    measureContainer.addChild(measureBody);
    const measureUnderBody = new PIXI.Sprite(chikenTextures[underBodySpec.key]);
    measureUnderBody.anchor.set(0.5);
    measureUnderBody.x = underBodySpec.x;
    measureUnderBody.y = underBodySpec.y;
    measureUnderBody.rotation = underBodySpec.rotation;
    measureUnderBody.scale.set(underBodySpec.scaleX, underBodySpec.scaleY);
    measureContainer.addChild(measureUnderBody);

    for (let i = 0; i < topSpecs.length; i++) {
      const spec = topSpecs[i];
      const part = new PIXI.Sprite(chikenTextures[spec.key]);
      part.anchor.set(0.5);
      part.x = spec.x;
      part.y = spec.y;
      part.rotation = spec.rotation;
      if (typeof spec.scaleX === "number" || typeof spec.scaleY === "number") {
        part.scale.set(spec.scaleX || 1, spec.scaleY || 1);
      }
      topContainer.addChild(part);

      const measurePart = new PIXI.Sprite(chikenTextures[spec.key]);
      measurePart.anchor.set(0.5);
      measurePart.x = spec.x;
      measurePart.y = spec.y;
      measurePart.rotation = spec.rotation;
      if (typeof spec.scaleX === "number" || typeof spec.scaleY === "number") {
        measurePart.scale.set(spec.scaleX || 1, spec.scaleY || 1);
      }
      measureContainer.addChild(measurePart);
    }

    const bounds = measureContainer.getLocalBounds();
    const pivotX = bounds.x + bounds.width / 2;
    const pivotY = bounds.y + bounds.height / 2;
    const ratio = Math.min(targetSize / bounds.width, targetSize / bounds.height);

    bodyContainer.pivot.set(pivotX, pivotY);
    topContainer.pivot.set(pivotX, pivotY);
    bodyContainer.scale.set(ratio);
    topContainer.scale.set(ratio);

    return { bodyContainer, topContainer };
  }

  function buildCowPreview(targetSize) {
    const container = new PIXI.Container();
    container.sortableChildren = true;
    const measure = new PIXI.Container();

    const specs = [
      { key: "cowYur1", x: -225, y: -205, rotation: Math.PI, zIndex: 5 },
      { key: "cow", x: -125, y: -40, rotation: 0, zIndex: 10 },
      { key: "cowTav", x: -190, y: -140, rotation: 0, zIndex: 12 },
      { key: "cowYur2", x: -85, y: -135, rotation: 0, zIndex: 12 },
      { key: "cowTval1", x: -220, y: -160, rotation: 0, zIndex: 14, scaleX: 0.7, scaleY: 0.7, rotation: Math.PI  },
      { key: "cowTval2", x: -170, y: -140, rotation: 0, zIndex: 14, scaleX: 0.8, scaleY: 0.8 },
      { key: "cowZarQamari", x: -160, y: -30, rotation: 0, zIndex: 16, },
      { key: "cowZar", x: -200, y: 60, rotation: Math.PI, zIndex: 18, },
    ];

    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];

      const part = new PIXI.Sprite(chikenTextures[spec.key]);
      part.anchor.set(0.5);
      part.x = spec.x;
      part.y = spec.y;
      part.rotation = spec.rotation;
      if (typeof spec.zIndex === "number") {
        part.zIndex = spec.zIndex;
      }
      if (typeof spec.scaleX === "number" || typeof spec.scaleY === "number") {
        part.scale.set(spec.scaleX || 1, spec.scaleY || 1);
      }
      if (typeof spec.scale === "number") {
        part.scale.set(spec.scale);
      }
      container.addChild(part);

      const measurePart = new PIXI.Sprite(chikenTextures[spec.key]);
      measurePart.anchor.set(0.5);
      measurePart.x = spec.x;
      measurePart.y = spec.y;
      measurePart.rotation = spec.rotation;
      if (typeof spec.scaleX === "number" || typeof spec.scaleY === "number") {
        measurePart.scale.set(spec.scaleX || 1, spec.scaleY || 1);
      }
      if (typeof spec.scale === "number") {
        measurePart.scale.set(spec.scale);
      }
      measure.addChild(measurePart);
    }

    const bounds = measure.getLocalBounds();
    container.pivot.set(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    const ratio = Math.min(targetSize / bounds.width, targetSize / bounds.height);
    container.scale.set(ratio);

    return container;
  }

  function buildKaciHeadPreview(targetSize) {
    const container = new PIXI.Container();
    container.sortableChildren = true;

    const face = new PIXI.Sprite(chikenTextures.kaciSaxe);
    face.anchor.set(0.5);
    face.x = -10;
    face.y = -40;
    face.rotation = Math.PI;
    face.zIndex = 20;
    face.scale.set(0.5);
    container.addChild(face);

    const hair = new PIXI.Sprite(chikenTextures.kaciHair);
    hair.anchor.set(0.5);
    hair.x = 8;
    hair.y = -36;
    hair.zIndex = 30;
    container.addChild(hair);

    const hat = new PIXI.Sprite(chikenTextures.kaciHat);
    hat.anchor.set(0.5);
    hat.x = 5;
    hat.y = -54;
    hat.rotation = Math.PI;
    hat.scale.set(0.5);
    hat.zIndex = 10;
    container.addChild(hat);

    const leftEye = new PIXI.Sprite(chikenTextures.kaciEyeL);
    leftEye.anchor.set(0.5);
    leftEye.x = -16;
    leftEye.y = -6;
    leftEye.scale.set(1.8);
    leftEye.zIndex = 40;
    container.addChild(leftEye);

    const rightEye = new PIXI.Sprite(chikenTextures.kaciEyeR);
    rightEye.anchor.set(0.5);
    rightEye.x = 15;
    rightEye.y = -6;
    rightEye.scale.set(1.9);
    rightEye.zIndex = 40;
    container.addChild(rightEye);

    const bounds = container.getLocalBounds();
    container.pivot.set(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    const ratio = Math.min(targetSize / bounds.width, targetSize / bounds.height);
    container.scale.set(ratio);

    return container;
  }

  function getVisibleSymbolsByReel() {
    const visibleByReel = [];

    for (let i = 0; i < reels.length; i++) {
      const symbols = reels[i].symbols
        .filter((symbol) => symbol.y >= 0 && symbol.y < layout.symbolSize * 3)
        .sort((a, b) => a.y - b.y);

      visibleByReel.push(symbols);
    }

    return visibleByReel;
  }

  function applySevenWinEffects() {
    const visible = getVisibleSymbolsByReel();

    for (let row = 0; row < 3; row++) {
      let consecutiveSevens = 0;

      for (let reelIndex = 0; reelIndex < visible.length; reelIndex++) {
        const symbol = visible[reelIndex][row];
        if (symbol && symbol.symbolKey === "7") {
          consecutiveSevens++;
        } else {
          break;
        }
      }

      if (consecutiveSevens >= 3) {
        for (let reelIndex = 0; reelIndex < consecutiveSevens; reelIndex++) {
          const symbol = visible[reelIndex][row];
          if (!symbol) continue;

          const glow = new PIXI.Sprite(slotTextures["7ganateba"]);
          glow.anchor.set(0.5);
          glow.x = layout.reelWidth / 2;
          glow.y = symbol.y + layout.symbolSize / 2;
          glow.width = layout.symbolSize * 1.08;
          glow.height = layout.symbolSize * 1.08;
          glow.alpha = 0.9;
          symbol.parent.addChildAt(glow, 0);

          setSymbolTexture(symbol, "7i");

          sevenEffects.push({ symbol, glow });
        }
      }
    }
  }

  function clearSevenEffects() {
    for (let i = 0; i < sevenEffects.length; i++) {
      const effect = sevenEffects[i];
      if (effect.glow && effect.glow.parent) {
        effect.glow.parent.removeChild(effect.glow);
      }
      if (effect.symbol) {
        setSymbolTexture(effect.symbol, "7");
      }
    }
    sevenEffects = [];
  }
})();
