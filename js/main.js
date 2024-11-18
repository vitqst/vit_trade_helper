// config.js
const CONFIG = {
  THEME: "dark",
  INTERVAL: {
    m1: "1",
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

class MEXCPriceUpdater {
  constructor(
    symbol,
    titleTemplate = (symbol, price) => `${symbol.toUpperCase()}: $${price}`
  ) {
    this.symbol = symbol.toUpperCase(); // MEXC uses uppercase symbols
    this.titleTemplate = titleTemplate; // Template for updating the title
    this.socket = null;
  }

  get socketUrl() {
    return `wss://wbs.mexc.com/ws`;
  }

  connect() {
    if (this.socket) {
      this.disconnect(); // Ensure any existing connection is closed
    }

    this.socket = new WebSocket(this.socketUrl);

    this.socket.onopen = () => {
      console.log(`WebSocket connection opened for ${this.symbol}`);
      // Subscribe to the ticker channel for the specified symbol
      const subscribeMessage = {
        method: "SUBSCRIPTION",
        params: [`spot@public.deals.v3.api@${this.symbol}`],
        id: Date.now(),
      };
      this.socket.send(JSON.stringify(subscribeMessage));
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Check if the message is for the expected symbol
      if (data.c && data.c.endsWith(this.symbol)) {
        const deals = data.d?.deals;
        if (deals && deals.length > 0) {
          const latestTrade = deals[0];
          const price = parseFloat(latestTrade.p).toFixed(2); // Extract the price
          document.title = this.titleTemplate(this.symbol, price); // Update the title
        }
      }
    };

    this.socket.onclose = () => {
      console.warn(`WebSocket connection closed for ${this.symbol}`);
      document.title = `Connection Closed for ${this.symbol.toUpperCase()}`;
    };

    this.socket.onerror = (error) => {
      console.error(`WebSocket error for ${this.symbol}:`, error);
      document.title = `Error Fetching Price for ${this.symbol.toUpperCase()}`;
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      console.log(`WebSocket connection closed manually for ${this.symbol}`);
      this.socket = null;
    }
  }

  changeSymbol(newSymbol) {
    console.log(`Changing symbol to ${newSymbol}`);
    this.symbol = newSymbol.toUpperCase();
    this.connect(); // Reconnect with the new symbol
  }
}

class BinancePriceUpdater {
  constructor(
    initialSymbol,
    titleTemplate = (symbol, price) => `${symbol.toUpperCase()}: $${price}`
  ) {
    this.symbol = initialSymbol.toLowerCase(); // Binance requires lowercase symbols
    this.titleTemplate = titleTemplate; // Template for the title
    this.socket = null;
  }

  get socketUrl() {
    return `wss://stream.binance.com:9443/ws/${this.symbol}@trade`;
  }

  connect() {
    if (this.socket) {
      this.disconnect(); // Disconnect existing WebSocket before reconnecting
    }

    this.socket = new WebSocket(this.socketUrl);

    this.socket.onopen = () => {
      console.log(`WebSocket connection opened for ${this.symbol}`);
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const price = parseFloat(data.p).toFixed(2); // Get price from trade data
      document.title = this.titleTemplate(this.symbol, price); // Update the title
    };

    this.socket.onclose = () => {
      console.warn(`WebSocket connection closed for ${this.symbol}`);
      document.title = `Connection Closed for ${this.symbol.toUpperCase()}`;
    };

    this.socket.onerror = (error) => {
      console.error(`WebSocket error for ${this.symbol}:`, error);
      document.title = `Error Fetching Price for ${this.symbol.toUpperCase()}`;
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      console.log(`WebSocket connection closed manually for ${this.symbol}`);
      this.socket = null;
    }
  }

  changeSymbol(newSymbol) {
    console.log(`Changing symbol to ${newSymbol}`);
    this.symbol = newSymbol.toLowerCase();
    this.connect(); // Reconnect with the new symbol
  }
}

// widgetManager.js
class WidgetManager {
  constructor(coin) {
    this.coin = coin;
  }

  gridItemBuilder(pair, timeFrame, w, h, customConfig) {
    return {
      ...Utils.detectMob({ w, h }),
      config: {
        ...TradingViewConfig.COMMON_NORMAL,
        symbol: pair,
        interval: timeFrame,
        ...customConfig,
      },
      type: TradingViewConfig.WIDGET_TYPE.NORMAL,
    };
  }

  getWidgets() {
    const listWidgetData = [
      {
        pair: `${CONFIG.EXCHANGE}:${this.coin}USDT.P`,
        timeFrame: CONFIG.INTERVAL.m1,
        w: 6,
        h: 6,
        customConfig: {
          studies: [
            {
              id: "MASimple@tv-basicstudies",
              inputs: {
                length: 50,
              },
            },
            {
              id: "MASimple@tv-basicstudies",
              inputs: {
                length: 200,
              },
            },
            {
              id: "STD;MACD",
            },
            {
              id: "STD;Bollinger_Bands",
            },
          ],
        },
      },
      {
        pair: `${CONFIG.EXCHANGE}:${this.coin}USDT.P`,
        timeFrame: CONFIG.INTERVAL.m5,
        w: 6,
        h: 6,
        customConfig: {
          studies: [
            {
              id: "MASimple@tv-basicstudies",
              inputs: {
                length: 50,
              },
            },
            {
              id: "MASimple@tv-basicstudies",
              inputs: {
                length: 200,
              },
            },
            {
              id: "STD;MACD",
            },
            {
              id: "STD;Bollinger_Bands",
            },
          ],
        },
      },
      {
        pair: `${CONFIG.EXCHANGE}:${this.coin}USDT.P`,
        timeFrame: CONFIG.INTERVAL.h1,
        w: 6,
        h: 6,
        customConfig: {
          studies: [
            {
              id: "STD;RSI",
            },
            {
              id: "STD;MACD",
            },
            {
              id: "STD;Bollinger_Bands",
            },
            {
              id: "MASimple@tv-basicstudies",
              inputs: {
                length: 50,
              },
            },
            {
              id: "MASimple@tv-basicstudies",
              inputs: {
                length: 200,
              },
            },
          ],
        },
      },
      {
        pair: `${CONFIG.EXCHANGE}:${this.coin}USDT.P`,
        timeFrame: CONFIG.INTERVAL.h4,
        w: 6,
        h: 6,
        customConfig: {
          studies: [
            {
              id: "STD;RSI",
            },
            {
              id: "STD;MACD",
            },
            {
              id: "STD;Bollinger_Bands",
            },
            {
              id: "MASimple@tv-basicstudies",
              inputs: {
                length: 50,
              },
            },
            {
              id: "MASimple@tv-basicstudies",
              inputs: {
                length: 200,
              },
            },
          ],
        },
      },
    ];

    return listWidgetData.map((item) =>
      this.gridItemBuilder(
        item.pair,
        item.timeFrame,
        item.w,
        item.h,
        item.customConfig
      )
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
        new TradingView.widget({
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

    // bind events
    let priceUpdater;

    if (!priceUpdater) {
      const initialSymbol = `${coin}USDT`;
      priceUpdater = new MEXCPriceUpdater(initialSymbol);
      priceUpdater.connect();
    }
  };

  main();
});
