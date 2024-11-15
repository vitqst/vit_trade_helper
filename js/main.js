// config.js
const CONFIG = {
  THEME: "dark",
  INTERVAL: {
    m5: "5",
    m15: "15",
    m30: "30",
    h1: "60",
    h4: "240",
    d: "D",
    w: "W",
  },
  EXCHANGE: "MEXC",
  TIMEZONE: "Asia/Ho_Chi_Minh",
  DEFAULT_COIN: "ETH",
};

// utils.js
const Utils = {
  isMobile: () => window.innerWidth <= 768,
  isPortraitMode: () => window.innerWidth <= 1081,

  detectMob: (defaultWH, fallbackWH, fallBackMobile) => {
    if (Utils.isMobile()) {
      return fallBackMobile || { w: 12, h: 1 };
    }
    if (Utils.isPortraitMode()) {
      return fallbackWH || { w: 12, h: 5 };
    }
    return defaultWH;
  },

  getUrlParam: (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  setUrlParam: (param, value) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set(param, value);
    window.location.search = urlParams;
  },
};

// tradingViewConfig.js
const TradingViewConfig = {
  COMMON_NORMAL: {
    autosize: true,
    symbol: "BINANCE:BTCUSDT",
    interval: "D",
    timezone: CONFIG.TIMEZONE,
    theme: CONFIG.THEME,
    style: "1",
    locale: "en",
    toolbar_bg: "rgba(0, 0, 0, 1)",
    enable_publishing: false,
    hide_top_toolbar: false,
    allow_symbol_change: true,
    save_image: false,
    hideideas: false,
    withdateranges: true,
    hide_side_toolbar: Utils.isMobile(),
    hideideas: 1,
    studies: ["RSI@tv-basicstudies", "BB@tv-basicstudies"],
    container_id: "tradingview_66eb0",
    disabled_features: [],
    enabled_features: ["countdown"],
  },

  WIDGET_TYPE: {
    NORMAL: 0,
    VUEJS: 1,
  },
};

// widgetManager.js
class WidgetManager {
  constructor(coin) {
    this.coin = coin;
  }

  gridItemBuilder(pair, timeFrame, w, h) {
    return {
      ...Utils.detectMob({ w, h }),
      config: {
        ...TradingViewConfig.COMMON_NORMAL,
        symbol: pair,
        interval: timeFrame,
      },
      type: TradingViewConfig.WIDGET_TYPE.NORMAL,
    };
  }

  getWidgets() {
    const listWidgetData = [
      {
        pair: `${CONFIG.EXCHANGE}:${this.coin}USDT.P`,
        timeFrame: CONFIG.INTERVAL.m15,
      },
      {
        pair: `${CONFIG.EXCHANGE}:${this.coin}USDT.P`,
        timeFrame: CONFIG.INTERVAL.h1,
      },
      {
        pair: `${CONFIG.EXCHANGE}:${this.coin}USDT.P`,
        timeFrame: CONFIG.INTERVAL.h4,
      },
      {
        pair: `${CONFIG.EXCHANGE}:${this.coin}USDT.P`,
        timeFrame: CONFIG.INTERVAL.d,
      },
    ];

    return listWidgetData.map((item) =>
      this.gridItemBuilder(item.pair, item.timeFrame, 6, 3)
    );
  }
}

// gridManager.js
class GridManager {
  constructor(widgets) {
    this.widgets = widgets;
    this.grid = null;
  }

  init() {
    this.grid = GridStack.init({
      itemClass: "custom-item",
      draggable: { scroll: false },
    });

    const widgetsGrid = this.widgets.map((item, k) => ({
      w: item.w,
      h: item.h,
      content: `<div class="full-wh widget-content">
        <div id="widget-${k}" class="full-wh grid-stack-item_content-js"></div>
        <div class="lock-js clicked"></div>
      </div>`,
      mobileSort: item.mobileSort,
    }));

    this.grid.load(
      Utils.isMobile()
        ? widgetsGrid.sort((a, b) => a.mobileSort - b.mobileSort)
        : widgetsGrid
    );
  }

  renderWidgets() {
    this.widgets.forEach((item, k) => {
      const widgetId = `widget-${k}`;
      if (
        item.type === TradingViewConfig.WIDGET_TYPE.NORMAL &&
        document.getElementById(widgetId)
      ) {
        document.getElementById(widgetId).value = new TradingView.widget({
          ...item.config,
          container_id: widgetId,
        });
      }
    });
  }

  adjustMobileLayout() {
    if (Utils.isMobile()) {
      setTimeout(() => {
        document.querySelectorAll(".custom-item").forEach((item) => {
          const height = item.querySelector(".grid-stack-item_content-js")
            .firstChild.style.height;
          item.style.height =
            height && height !== "100%"
              ? `calc(30px + ${height})`
              : `${item.offsetHeight + 40}px`;
          item.style.minHeight = item.style.height;
        });

        const vueAppHeight =
          document.querySelector(".vue-app-container").offsetHeight;
        document.querySelector(".custom-item").style.height = "400px";
        document.querySelector(".custom-item").style.minHeight = "400px";
      }, 3000);
    }
  }
}

// uiManager.js
class UIManager {
  constructor() {
    this.btnLockUnlock = document.getElementById("btn-lock-unlock-js");
    this.selectCoin = document.getElementById("select-coin-js");
  }

  init(coin) {
    this.selectCoin.value = coin;
    this.addEventListeners();
  }

  addEventListeners() {
    this.btnLockUnlock.addEventListener(
      "click",
      this.handleLockUnlock.bind(this)
    );
    this.selectCoin.addEventListener(
      "change",
      this.handleCoinChange.bind(this)
    );
  }

  handleLockUnlock() {
    const clicked = document.querySelectorAll(".clicked");
    const isLocking = this.btnLockUnlock.textContent === "LOCK";

    clicked.forEach((item) => item.classList.toggle("lock-js", isLocking));
    this.btnLockUnlock.textContent = isLocking ? "UNLOCK" : "LOCK";
  }

  handleCoinChange(e) {
    Utils.setUrlParam("coin", e.target.value);
  }
}

// main.js
$(document).ready(() => {
  const main = () => {
    const coin = Utils.getUrlParam("coin") || CONFIG.DEFAULT_COIN;

    const widgetManager = new WidgetManager(coin);
    const widgets = widgetManager.getWidgets();

    const gridManager = new GridManager(widgets);
    gridManager.init();
    gridManager.renderWidgets();
    gridManager.adjustMobileLayout();

    const uiManager = new UIManager();
    uiManager.init(coin);
  };

  main();
});
