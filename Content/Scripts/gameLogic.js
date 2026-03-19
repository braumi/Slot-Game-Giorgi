(function initGameLogic() {
  const api =
    typeof window.GetBoard === "function"
      ? { GetBoard: window.GetBoard }
      : window.fakeApi || window.FakeApi || null;

  window.slotGameState = window.slotGameState || {};
  if (typeof window.slotGameState.balance !== "number") {
    window.slotGameState.balance = 0;
  }
  if (typeof window.slotGameState.bet !== "number") {
    window.slotGameState.bet = 1;
  }

  function getCurrentMultiplier() {
    const m = window.slotGameState.multiplierValue;
    return typeof m === "number" && m > 0 ? m : 1;
  }

  function applyMultiplier(baseWin) {
    const multiplier = getCurrentMultiplier();
    return baseWin * multiplier;
  }

  async function requestSpin(bet) {
    if (!api || typeof api.GetBoard !== "function") {
      console.warn("[gameLogic] fake.api GetBoard not available");
      return null;
    }
    try {
      const result = await api.GetBoard(bet);
      window.slotGameState.lastBoard = result;
      if (result && typeof result.Balance === "number") {
        window.slotGameState.balance = result.Balance;
      }
      if (result && typeof result.Multiplier === "number") {
        // store API multiplier so UI/logic can use it
        window.slotGameState.multiplierValue = result.Multiplier;
        console.log("[fake.api] Multiplier:", result.Multiplier);
      }
      return result;
    } catch (err) {
      console.error("[gameLogic] GetBoard failed", err);
      return null;
    }
  }

  function formatCurrency(value) {
    return `€${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }

  function syncHud() {
    const balanceEl = document.getElementById("hudBalance");
    const maxWinEl = document.getElementById("hudMaxWin");
    const betSelect = document.getElementById("hudBetSelect");
    if (balanceEl) {
      balanceEl.textContent = formatCurrency(window.slotGameState.balance);
    }
    if (maxWinEl) {
      // show last win amount from API without re‑multiplying
      const maxWin =
        window.slotGameState.lastBoard &&
        typeof window.slotGameState.lastBoard.UserWin === "number"
          ? window.slotGameState.lastBoard.UserWin
          : 0;
      maxWinEl.textContent = formatCurrency(maxWin);
    }
    if (betSelect && document.activeElement !== betSelect) {
      // Keep dropdown in sync with state (state should be one of the fixed amounts).
      const normalized = Math.round(window.slotGameState.bet);
      betSelect.value = String(normalized);
    }

    // Notify other UI modules (e.g. spin button availability) after HUD sync.
    window.dispatchEvent(
      new CustomEvent("hudupdated", {
        detail: {
          balance: window.slotGameState.balance,
          bet: window.slotGameState.bet,
        },
      })
    );
  }

  function initHudBindings() {
    const betSelect = document.getElementById("hudBetSelect");
    if (!betSelect) return;
    betSelect.addEventListener("change", () => {
      const raw = parseFloat(betSelect.value.replace(",", "."));
      if (Number.isNaN(raw) || raw <= 0) return;
      window.slotGameState.bet = raw;
      syncHud();
    });
  }

  window.addEventListener("DOMContentLoaded", async () => {
    initHudBindings();
    // Seed initial state from API so balance placeholder matches backend
    if (api && typeof api.GetBoard === "function") {
      try {
        const info = await api.GetBoard();
        if (info && typeof info.Balance === "number") {
          window.slotGameState.balance = info.Balance;
        }
        window.slotGameState.lastBoard = info || null;
        if (info && typeof info.Multiplier === "number") {
          window.slotGameState.multiplierValue = info.Multiplier;
        }
      } catch (e) {
        console.warn("[gameLogic] initial GetBoard failed", e);
      }
    }
    syncHud();
  });

  window.slotGameLogic = {
    getCurrentMultiplier,
    applyMultiplier,
    requestSpin,
    syncHud,
    formatCurrency,
  };
})();

