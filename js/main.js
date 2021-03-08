$(document).ready(() => {
    const isPortraitMode = window.innerWidth <= 1081
    const isMobile = window.innerWidth <= 768
    const theme = 'dark' // light | dark
    const MAINSTREAM_COIN = ['FTM', 'RVN', 'ALGO']
    const SUPPORT_COIN = ['BTC', 'BNB', 'ETH']

    function detectMob(defaultWH, fallbackWH) {
        if (isMobile) {
            return {
                w: 12,
                h: 1,
                x: 0,
                y: 0
            }
        }

        if (isPortraitMode) {
            if (fallbackWH) {
                return fallbackWH
            }

            return {
                w: 12,
                h: 3
            }
        }

        return defaultWH
    }

    const $common = {
        "autosize": true,
        "symbol": "BINANCE:RVNUSDT",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": theme,
        "style": "1",
        "locale": "en",
        "toolbar_bg": "rgba(0, 0, 0, 1)",
        "enable_publishing": false,
        "hide_top_toolbar": false,
        "allow_symbol_change": true,
        "save_image": false,
        "hideideas": false,
        "withdateranges": true,
        "hide_side_toolbar": isMobile,
        "studies": [
            'RSI@tv-basicstudies',
            'MASimple@tv-basicstudies',
        ],
        "container_id": "tradingview_66eb0"
    }

    const $commonSingleTicker = {
        "interval": "1h",
        "width": '100%',
        "isTransparent": true,
        "height": '100%',
        "symbol": "BINANCE:ALGOUSDT",
        "showIntervalTabs": true,
        "locale": "en",
        "colorTheme": theme
    }

    const WIDGET_TYPE = {
        NORMAL: 0,
        TECHNICAL_ANALYSIS: 1,
        Custom: 2,
        SINGLE_TICKER: 3
    }

    const widgets = [
        // Small
        {
            ...detectMob({w: 3, h: 2}, {w: 12, h: 2}),
            config: {
                content: `<div id="vue-app">
    <div class="vue-app-container">
        <div class="total"><span :class="className()">Total invested:</span> <span class="title-total">{{ roundNum(total) }} USDT | {{ roundNum(convertUSTCtoVND(total)) }} VND</span></div>
        <div class="total-realtime"><span :class="className()">Equity value :</span> <span class="title-total">{{ roundNum(totalNew) }} USDT | {{ roundNum(convertUSTCtoVND(totalNew)) }} VND</span></div>
        <div class="total-realtime"><span :class="className()">Gap:</span> <transition name="slide-fade" mode="out-in"><span :key="profit.percent" :class="className(profit.money)">{{ profit.money }} USDT | {{ roundNum(convertUSTCtoVND(profit.money)) }} VND / {{ profit.percent }} %</span></div></trainsition>
        <div class="title-total" style="padding: 2px 0 2px 0; font-weight: bold; font-size: 1.1rem">Breakdown profit & loss</div>
        <div v-for="(item, index) in profitBreakDown" :key="index">
            <span :class="className()">{{ item.name }}:</span>
            <transition name="slide-fade" mode="out-in">
                <span :class="className(item.gap)" :key="item.percent" style="font-size: 0.8rem">{{ roundNum(item.gap) }} USDT | {{ roundNum(convertUSTCtoVND(item.gap)) }} VND / {{ roundNum(item.percent) }} % ({{ item.volume }} / {{ roundNum(item.realTimeMoney) }} USDT)</span>
            </transition>
        </div>

<!--        <button style="margin-top: 5px" v-on:click="getCoinListFromApi">Refresh</button>-->
<!--        <button v-on:click="handleCopy">Copy</button>-->
    </div>
</div>`
            },
            type: WIDGET_TYPE.Custom,
            mobileSort: 100,
        },

        // GENERATE SINGLE TICKET
            ...[...MAINSTREAM_COIN, ...SUPPORT_COIN].map(item => {
            return {
                    ...detectMob({w: 3, h: 1}, {w: 6, h: 2}),
                    config: {
                        ...$commonSingleTicker,
                        "symbol": `BINANCE:${item}USDT`,
                    },
                    type: WIDGET_TYPE.SINGLE_TICKER,
                    mobileSort: 90,
            }
        }),
        // END GENERATE SINGLE TICKET

        // GENERATE CHART
        ...MAINSTREAM_COIN.map(item => {
            return {
                ...detectMob({w: 6, h: 3,}),
                config: {...$common, symbol: `BINANCE:${item}USDT`},
                type: WIDGET_TYPE.NORMAL,
                mobileSort: 73,
            }
        }),
        ...MAINSTREAM_COIN.map(item => {
            return {
                ...detectMob({w: 6, h: 3,}),
                config: {...$common, symbol: `BINANCE:${item}USDT`, interval: `60`},
                type: WIDGET_TYPE.NORMAL,
                mobileSort: 70,
            }
        }),
        ...SUPPORT_COIN.map(item => {
            return {
                ...detectMob({w: 6, h: 3,}),
                config: {...$common, "symbol": `BINANCE:${item}USDT`},
                type: WIDGET_TYPE.NORMAL,
                mobileSort: 60,
            }
        }),
        // END GENERATE CHART
    ]

    const grid = GridStack.init({
        itemClass: 'custom-item',
        draggable: {
            scroll: false
        }
    });
    const widgetsGrid = widgets.map((item, k) => {
        return {
            w: item.w,
            h: item.h,
            content: `<div class="full-wh widget-content">
    <div id="widget-${k}" class="full-wh grid-stack-item_content-js"></div>
    <div class="lock-js clicked"></div>
</div>`,
            mobileSort: item.mobileSort
        }
    })
    grid.load(isMobile ? widgetsGrid.sort((a, b) => a.mobileSort - b.mobileSort) : widgetsGrid);

    widgets.map((item, k) => {
        const widgetId = `widget-${k}`

        if (item.type === WIDGET_TYPE.NORMAL) {
            if (document.getElementById(widgetId)) {
                // debugger
                document.getElementById(widgetId).value = new TradingView.widget({
                    ...item.config,
                    "container_id": widgetId
                })
            }
        }

        if (item.type === WIDGET_TYPE.TECHNICAL_ANALYSIS) {
            const script = document.createElement('script')
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js'
            script.async = true
            script.innerHTML = JSON.stringify(item.config)
            document.getElementById(widgetId).appendChild(script)
        }

        if (item.type === WIDGET_TYPE.SINGLE_TICKER) {
            const script = document.createElement('script')
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js'
            script.async = true
            script.innerHTML = JSON.stringify(item.config)
            document.getElementById(widgetId).appendChild(script)
        }

        // --------------------------------------------------------------------------------------------------------- BEGIN VUEJS APPLICATION
        if (item.type === WIDGET_TYPE.Custom) {
            document.getElementById(widgetId).innerHTML = item.config.content

            new Vue({
                el: `#${widgetId}`,
                data: {
                    soDienSd: 'hix',
                    priceRealTime: {
                        RVN: 0,
                        ALGO: 0,
                        FTM: 0
                    },
                    wallet: [],
                    priceUstcToBvnd: 24000,
                },
                computed: {
                    total() {
                        let total = 0

                        for (const item of this.wallet) {
                            total = item.price * item.volume + total
                        }

                        return total
                    },
                    totalNew() {
                        let tempTotalNew = 0

                        for (const item of this.wallet) {
                            tempTotalNew = item.volume * this.priceRealTime[item.name] + tempTotalNew
                        }

                        return tempTotalNew
                    },
                    profit() {
                        const s = this.totalNew - this.total

                        return {
                            money: this.roundNum(s),
                            percent: this.roundNum(s / this.total * 100),
                        }
                    },
                    profitBreakDown() {
                        let wlBreakDown = {}

                        for (const item of this.wallet) {
                            if (wlBreakDown[item.name]) {
                                wlBreakDown[item.name] = {
                                    money: wlBreakDown[item.name].money + item.volume * item.price,
                                    volume: wlBreakDown[item.name].volume + item.volume,
                                }
                            } else {
                                wlBreakDown[item.name] = {
                                    money: item.volume * item.price,
                                    volume: item.volume
                                }
                            }
                        }

                        for (const [coinName, item] of Object.entries(wlBreakDown)) {

                            const realTimeMoney = item.volume * this.priceRealTime[coinName]

                            wlBreakDown[coinName] = {
                                ...wlBreakDown[coinName],
                                realTimeMoney,
                                gap: realTimeMoney - item.money,
                                percent: ((realTimeMoney - item.money) / item.money) * 100,
                                name: coinName
                            }
                        }


                        return Object.values(wlBreakDown)
                    }
                },
                created() {
                    this.getWallet()
                    setInterval(this.getWallet, 10000)
                    this.getCoinList()
                    setInterval(this.getUSTCToVND, 10000)
                },

                methods: {
                    getCoinList() {
                        //     // this is where you paste your api key
                        //     const apiKey = "2131626c800f620f4d84eebe376cd298a4709ce80230600d53b8ae06309323c1";
                        //     const ccStreamer = new WebSocket('wss://streamer.cryptocompare.com/v2?api_key=' + apiKey);
                        //     ccStreamer.onopen = function onStreamOpen() {
                        //         const subRequest = {
                        //             "action": "SubAdd",
                        //             "subs": ["2~Binance~RVN~USDT", "2~Binance~ALGO~USDT"]
                        //         };
                        //         ccStreamer.send(JSON.stringify(subRequest));
                        //     }
                        //
                        //     ccStreamer.onmessage = (message) => {
                        //         const data = JSON.parse(message.data)
                        //         // FLAGS: 2
                        //         // FROMSYMBOL: "ALGO"
                        //         // LASTTRADEID: "16013507"
                        //         // LASTUPDATE: 1614765592
                        //         // LASTVOLUME: 14.16
                        //         // LASTVOLUMETO: 16.214616
                        //         // MARKET: "Binance"
                        //         // PRICE: 1.1451
                        //         // TOSYMBOL: "USDT"
                        //         // TYPE: "2"
                        //         // VOLUME24HOUR: 79662923.7
                        //         // VOLUME24HOURTO: 88486140.375477
                        //         // VOLUMEDAY: 31079802.16
                        //         // VOLUMEDAYTO: 34884722.128181
                        //         // VOLUMEHOUR: 3423258.23
                        //         // VOLUMEHOURTO: 3927222.191424
                        //         if (data.TYPE === "2" && data.PRICE) {
                        //             this.priceRealTime[data.FROMSYMBOL] = data.PRICE
                        //         }
                        //
                        //         if (data.TYPE === "429") {
                        //             ccStreamer.close()
                        //             this.getCoinListFromApi()
                        //         }
                        //     }

                        this.getCoinListFromApi()
                        setInterval(this.getCoinListFromApi, 1000)
                    },
                    getCoinListFromApi() {
                        MAINSTREAM_COIN.map(item => {
                            fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${item}USDT`).then(
                                response => {
                                    if (response.ok) {
                                        response.json().then(
                                            json => {
                                                this.priceRealTime[item] = Number(json.price)
                                            }
                                        )
                                    }
                                }
                            )
                        })
                    },
                    roundNum: (number, digit = 2) => {
                        let round = 1
                        for (let i = 0; i < digit; i++) {
                            round = round * 10
                        }

                        return Number(Math.round(number * round) / round).toLocaleString()
                    },
                    className: (number) => {
                        let df = "title"

                        if (number < 0) {
                            df = df + " down"
                        } else if (number >= 0) {
                            df = df + " up"
                        }

                        return df
                    },
                    refreshPrice() {
                        this.priceRealTime = {
                            RVN: this.priceRealTime.RVN + 0.1,
                            ALGO: this.priceRealTime.ALGO + 0.2,
                        }
                    },
                    getUSTCToVND() {
                        fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTBVND').then(
                            response => {
                                if (response.ok) {
                                    response.json().then(
                                        json => {
                                            this.priceUstcToBvnd = Number(json.price)
                                        }
                                    )
                                } else {
                                    alert('HTTP-ERROR')
                                }
                            }
                        )
                    },
                    convertUSTCtoVND(ustc) {
                        return ustc * this.priceUstcToBvnd
                    },
                    copyToClipboard(text) {
                        if (window.clipboardData && window.clipboardData.setData) {
                            // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
                            return clipboardData.setData("Text", text);

                        } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
                            var textarea = document.createElement("textarea");
                            textarea.textContent = text;
                            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
                            document.body.appendChild(textarea);
                            textarea.select();
                            try {
                                return document.execCommand("copy");  // Security exception may be thrown by some browsers.
                            } catch (ex) {
                                console.warn("Copy to clipboard failed.", ex);
                                return false;
                            } finally {
                                document.body.removeChild(textarea);
                            }
                        }
                    },
                    handleCopy() {
                        let text = $('.vue-app-container')[0].innerText
                        text = text.replace('Refresh', '')
                        text = text.replace('Copy', '')
                        this.copyToClipboard(text)
                    },
                    getWallet() {
                        fetch(`https://crypto-be.ioabc.xyz/wallets`).then(
                            response => {
                                if (response.ok) {
                                    response.json().then(
                                        json => {
                                            this.wallet = json
                                        }
                                    )
                                }
                            }
                        )
                    },
                }
            })
        }
    })

    setTimeout(() => {
        var a = [...document.getElementsByClassName('lock-js')].map(item => {
            item.addEventListener('click', () => {
                if (item.className === 'lock-js clicked') {
                    item.className = 'lock-js'
                } else {
                    item.className = 'lock-js clicked'
                }
            })
        })
    }, 2000)

    if (isMobile) {
        setTimeout(() => {
            const a = [...(document.getElementsByClassName('custom-item'))].map(item => {
                const height = item.getElementsByClassName('grid-stack-item_content-js')[0].firstChild.style.height

                if (height && height !== '100%') {
                    item.style.height = `calc(30px + ${height})`
                    item.style.minHeight = `calc(30px + ${height})`
                } else {
                    item.style.height = `${item.offsetHeight + 40}px`
                    item.style.minHeight = `${item.offsetHeight + 40}px`
                }
            })

            document.getElementsByClassName('custom-item')[0].style.height = '250px'
            document.getElementsByClassName('custom-item')[0].style.minHeight = '250px'
        }, 1000)
    }
})