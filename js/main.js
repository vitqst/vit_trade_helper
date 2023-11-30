$(document).ready(() => {
  const beginRender = (coin) => {
    const isPortraitMode = window.innerWidth <= 1081;
    const isMobile = window.innerWidth <= 768;
    const THEME = "dark"; // light | dark
    const INTERVAL = {
      m5: "5",
      m15: "15",
      m30: "30",
      h1: "60",
      h4: "240",
      d: "D",
      w: "W",
    };
    const EXCHANGE = "MEXC"; // MEXC

    function detectMob(defaultWH, fallbackWH, fallBackMobile) {
      if (isMobile) {
        if (fallBackMobile) {
          return fallBackMobile;
        }

        return {
          w: 12,
          h: 1,
        };
      }

      if (isPortraitMode) {
        if (fallbackWH) {
          return fallbackWH;
        }

        return {
          w: 12,
          h: 5,
        };
      }

      return defaultWH;
    }

    const COMMON_NORMAL = {
      autosize: true,
      symbol: "BINANCE:BTCUSDT",
      interval: "D",
      timezone: "Asia/Ho_Chi_Minh", // https://www.tradingview.com/charting-library-docs/latest/ui_elements/timezones?_highlight=timezone
      theme: THEME,
      style: "1",
      locale: "en",
      toolbar_bg: "rgba(0, 0, 0, 1)",
      enable_publishing: false,
      hide_top_toolbar: false,
      allow_symbol_change: true,
      save_image: false,
      hideideas: false,
      withdateranges: true,
      hide_side_toolbar: isMobile,
      hideideas: 1,
      studies: ["RSI@tv-basicstudies", "BB@tv-basicstudies"],
      container_id: "tradingview_66eb0",
      disabled_features: [],
      enabled_features: [
        // countdown
        "countdown",
      ],
    };

    const WIDGET_TYPE = {
      NORMAL: 0,
      VUEJS: 1,
    };

    /////////////////////////////////     BEGIN repair data                 ////////////////////////////////////////

    const gridItemBuilder = (pair, timeFrame, w, h) => {
      return {
        ...detectMob({ w, h }),
        config: {
          ...COMMON_NORMAL,
          symbol: pair,
          interval: timeFrame,
        },
        type: WIDGET_TYPE.NORMAL,
      };
    };

    const listWidgetData = [
      {
        pair: `${EXCHANGE}:${coin}USDT.P`,
        timeFrame: INTERVAL.m5,
      },
      {
        pair: `${EXCHANGE}:${coin}USDT.P`,
        timeFrame: INTERVAL.m15,
      },
      {
        pair: `${EXCHANGE}:${coin}USDT.P`,
        timeFrame: INTERVAL.m30,
      },
      {
        pair: `${EXCHANGE}:${coin}USDT.P`,
        timeFrame: INTERVAL.h1,
      },
      {
        pair: `${EXCHANGE}:${coin}USDT.P`,
        timeFrame: INTERVAL.h4,
      },
      {
        pair: `${EXCHANGE}:${coin}USDT.P`,
        timeFrame: INTERVAL.d,
      },
    ];

    const widgets = [
      ...listWidgetData.map((item) => {
        return gridItemBuilder(item.pair, item.timeFrame, 6, 3);
      }),
    ];

    /////////////////////////////////     END repair data                  /////////////////////////////////////////

    ////////////////////////////////      BEGIN Render GridStack           /////////////////////////////////////////

    const grid = GridStack.init({
      itemClass: "custom-item",
      draggable: {
        scroll: false,
      },
    });

    const widgetsGrid = widgets.map((item, k) => {
      return {
        w: item.w,
        h: item.h,
        content: `<div class="full-wh widget-content">
    <div id="widget-${k}" class="full-wh grid-stack-item_content-js"></div>
    <div class="lock-js clicked"></div>
</div>`,
        mobileSort: item.mobileSort,
      };
    });

    grid.load(
      isMobile
        ? widgetsGrid.sort((a, b) => a.mobileSort - b.mobileSort)
        : widgetsGrid
    );

    // it support 4 type of widget
    // 1. Normal
    widgets.map((item, k) => {
      const widgetId = `widget-${k}`;

      if (item.type === WIDGET_TYPE.NORMAL) {
        if (document.getElementById(widgetId)) {
          // debugger
          document.getElementById(widgetId).value = new TradingView.widget({
            ...item.config,
            container_id: widgetId,
          });
        }
      }

      ////////////////////////////////      END Render GridStack             /////////////////////////////////////////

      ////////////////////////////////      Start support UI JS              /////////////////////////////////////////

      if (isMobile) {
        setTimeout(() => {
          const a = [...document.getElementsByClassName("custom-item")].map(
            (item) => {
              const height = item.getElementsByClassName(
                "grid-stack-item_content-js"
              )[0].firstChild.style.height;

              if (height && height !== "100%") {
                item.style.height = `calc(30px + ${height})`;
                item.style.minHeight = `calc(30px + ${height})`;
              } else {
                item.style.height = `${item.offsetHeight + 40}px`;
                item.style.minHeight = `${item.offsetHeight + 40}px`;
              }
            }
          );

          const vueAppHeight = Number($(".vue-app-container")[0].offsetHeight);
          document.getElementsByClassName(
            "custom-item"
          )[0].style.height = `400px`;
          document.getElementsByClassName(
            "custom-item"
          )[0].style.minHeight = `400pxpx`;
        }, 3000);
      }

      return grid;
    });
  };

  const addEventListeners = () => {
    /////// BUTTON LOCK UNLOCK ///////////////////////////////////////////
    const btnLockUnlock = document.getElementById("btn-lock-unlock-js");

    btnLockUnlock.addEventListener("click", () => {
      // get all .widget-content > .clicked
      const clicked = [...document.getElementsByClassName("clicked")];

      // if btnLockUnlock textContent === "LOCK"
      if (btnLockUnlock.textContent === "LOCK") {
        // add class "lock-js" for all .widget-content > .clicked
        clicked.map((item) => item.classList.add("lock-js"));
        // change textContent to "UNLOCK"
        btnLockUnlock.textContent = "UNLOCK";
      } else {
        // remove class "lock-js" for all .widget-content > .clicked
        clicked.map((item) => item.classList.remove("lock-js"));
        // change textContent to "LOCK"
        btnLockUnlock.textContent = "LOCK";
      }
    });

    /////// SELECT COIN ///////////////////////////////////////////
    const selectCoin = document.getElementById("select-coin-js");

    // add default value for selectCoin
    selectCoin.value = coin;

    selectCoin.addEventListener("change", (e) => {
      const coin = e.target.value;

      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("coin", coin);
      window.location.search = urlParams;
    });
  };

  ///////////////////////////////////       START APPLICATION                /////////////////////////////////////////

  const main = () => {
    const urlParams = new URLSearchParams(window.location.search);
    coin = urlParams.get("coin");
    if (coin === null) {
      coin = "ETH";
    }

    beginRender(coin);
    addEventListeners();
  };

  main();
});
