$(document).ready(() => {
    const beginRender = (mainStreamCoins, supportCoins) => {
        const isPortraitMode = window.innerWidth <= 1081
        const isMobile = window.innerWidth <= 768
        const THEME = 'dark' // light | dark

        function detectMob(defaultWH, fallbackWH, fallBackMobile) {
            if (isMobile) {
                if (fallBackMobile) {
                    return fallBackMobile
                }

                return {
                    w: 12,
                    h: 1,
                }
            }

            if (isPortraitMode) {
                if (fallbackWH) {
                    return fallbackWH
                }

                return {
                    w: 12,
                    h: 5
                }
            }

            return defaultWH
        }

        const COMMON_NORMAL = {
            "autosize": true,
            "symbol": "BINANCE:RVNUSDT",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": THEME,
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

        const COMMON_SINGLE_TIKKET = {
            "interval": "1h",
            "width": '100%',
            "isTransparent": true,
            "height": '100%',
            "symbol": "BINANCE:ALGOUSDT",
            "showIntervalTabs": true,
            "locale": "en",
            "colorTheme": THEME
        }

        const COMMON_MARKET_DATA_CONFIG = {
            "width": "100%",
            "height": "100%",
            "colorTheme": "dark",
            "dateRange": "1D",
            "showChart": false,
            "locale": "en",
            "largeChartUrl": "",
            "isTransparent": false,
            "showSymbolLogo": true,
            "plotLineColorGrowing": "rgba(25, 118, 210, 1)",
            "plotLineColorFalling": "rgba(255, 0, 0, 1)",
            "gridLineColor": "rgba(42, 46, 57, 1)",
            "scaleFontColor": "rgba(120, 123, 134, 1)",
            "belowLineFillColorGrowing": "rgba(33, 150, 243, 0.12)",
            "belowLineFillColorFalling": "rgba(33, 150, 243, 0.12)",
            "symbolActiveColor": "rgba(33, 150, 243, 0.12)",
            "tabs": [
                {
                    "title": "Indices",
                    "symbols": [
                        ...[...new Set([...mainStreamCoins, ...supportCoins])].map(item => {
                            return {
                                "s": `BINANCE:${item}USDT`,
                                "d": `${item}`
                            }
                        })
                    ],
                    "originalTitle": "Indices"
                }
            ]
        }

        const WIDGET_TYPE = {
            NORMAL: 0,
            TECHNICAL_ANALYSIS: 1,
            Custom: 2,
            SINGLE_TICKER: 3,
            MARKET_DATA: 4
        }

        /////////////////////////////////     BEGIN repair data                 ////////////////////////////////////////

        const widgets = [
            // Small
            {
                ...detectMob({w: 12, h: 2}, {w: 12, h: 6}),
                config: {
                    // language=HTML
                    content: `
                        <div id="vue-app">
                            <div class="vue-app-container">
                                <div class="total"><span :class="className()">Total invested:</span> <span
                                        class="title-total">{{ roundNum(total) }} USDT | {{ roundNum(convertUSTCtoVND(total), 0) }} VND</span>
                                </div>
                                <div class="total-realtime"><span :class="className()">Equity value :</span> <span
                                        class="title-total">{{ roundNum(totalNew) }} USDT | {{ roundNum(convertUSTCtoVND(totalNew), 0) }} VND</span>
                                </div>
                                <div class="total-realtime"><span :class="className()">Gap:</span>
                                    <transition name="slide-fade" mode="out-in"><span :key="profit.percent"
                                                                                      :class="className(profit.money)">{{ profit.money }} USDT | {{ roundNum(convertUSTCtoVND(profit.money)) }} VND / {{ profit.percent }} %</span>
                                </div>
                                </trainsition>
                                <div class="title-total"
                                     style="padding: 2px 0 2px 0; font-weight: bold; font-size: 1.1rem">Breakdown profit
                                    &
                                    loss
                                </div>
                                <!--        <div v-for="(item, index) in profitBreakDown" :key="index">-->
                                <!--            <span :class="item.order > 0 ? 'title' : 'title support'">{{ item.name }}:</span>-->
                                <!--            <transition name="slide-fade" mode="out-in">-->
                                <!--                <span :class="className(item.gap)" :key="item.percent" style="font-size: 0.8rem">{{ roundNum(item.gap) }} USDT | {{ roundNum(convertUSTCtoVND(item.gap)) }} VND / {{ roundNum(item.percent) }} % ({{ item.volume }} / {{ roundNum(item.realTimeMoney) }} USDT)</span>-->
                                <!--            </transition>-->
                                <!--        </div>-->

                                <div class="table-box">
                                    <div class="table-body">
                                        <table id="main-table" class="table">
                                            <thead>
                                            <tr>
                                                <th>NAME</th>
                                                <th>Profit / Loss</th>
                                                <th>Percent</th>
                                                <th v-if="!isMobile">Volume</th>
                                                <th>Equity value</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr v-for="(item, index) in profitBreakDown" :key="index"
                                                :class="item.order > 0 ? 'normal' : 'support'">
                                                <td :class="className(item.gap)"><a target="_blank"
                                                                                    :href="linkToTradingView(item.name)">{{
                                                    item.name }}</a></td>
                                                <td :class="className(item.gap)">{{ roundNum(item.gap) }}<br> <span
                                                        class="vnd">{{ roundNum(convertUSTCtoVND(item.gap), 0) }}</span>
                                                </td>
                                                <td :class="className(item.gap)">{{ roundNum(item.percent) }}
                                                    %</span></td>
                                                <td :class="className(item.gap)" v-if="!isMobile">{{
                                                    roundNum(item.volume) }}
                                                </td>
                                                <td :class="className(item.gap)">{{ roundNum(item.realTimeMoney) }}<br>
                                                    <span class="vnd">{{ roundNum(convertUSTCtoVND(item.realTimeMoney), 0) }}
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <button style="margin-right: 100px" v-on:click="turnOnNotification = !turnOnNotification">{{ turnOnNotification ? 'Is ON' : 'Is Off' }}</button>
                            </div>
                        </div>`
                },
                type: WIDGET_TYPE.Custom,
                mobileSort: 100,
            },

            //////////////                            ////////////////////////
            {
                ...detectMob({w: 6, h: 6}, {w: 12, h: 7}, {w: 12, h: 2}),
                config: {
                    ...COMMON_MARKET_DATA_CONFIG,
                },
                type: WIDGET_TYPE.MARKET_DATA,
                mobileSort: 90,
            },
            //////////////                            ////////////////////////

            ///////////// GENERATE CHART ////////////////////////////
            ...mainStreamCoins.map(item => {
                return {
                    ...detectMob({w: 6, h: 3,}),
                    config: {...COMMON_NORMAL, symbol: `BINANCE:${item}USDT`},
                    type: WIDGET_TYPE.NORMAL,
                    mobileSort: 73,
                }
            }),
            //////////////// END GENERATE CHART ///////////////////////////////
        ]

        /////////////////////////////////     END repair data                  /////////////////////////////////////////


        ////////////////////////////////      BEGIN Render GridStack           /////////////////////////////////////////

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

            if (item.type === WIDGET_TYPE.MARKET_DATA) {
                const script = document.createElement('script')
                script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'
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

            //////////////////            BEGIN VUEJS APPLICATION                                         //////////////
            if (item.type === WIDGET_TYPE.Custom) {
                document.getElementById(widgetId).innerHTML = item.config.content

                new Vue({
                    el: `#${widgetId}`,
                    data: {
                        coinsFollowed: [],
                        wallet: [],
                        priceUstcToBvnd: 24000,
                        priceRealTime: {},
                        isMobile,
                        notifications: {},
                        notiRead: {},
                        turnOnNotification: false
                    },
                    computed: {
                        total() {
                            let total = 0

                            for (const item of this.wallet.filter(item => item.order > 0)) {
                                total = item.price * item.volume + total
                            }

                            return this.handleNaN(total)
                        },
                        totalNew() {
                            let tempTotalNew = 0

                            for (const item of this.wallet.filter(item => item.order > 0)) {
                                tempTotalNew = item.volume * this.priceRealTime[item.name] + tempTotalNew
                            }

                            return this.handleNaN(tempTotalNew)
                        },
                        profit() {
                            const s = this.totalNew - this.total

                            return {
                                money: this.handleNaN(this.roundNum(s)),
                                percent: this.handleNaN(this.roundNum(s / this.total * 100)),
                            }
                        },
                        profitBreakDown() {
                            let wlBreakDown = {}

                            const walletSorted = this.wallet.sort((a, b) => b.order - a.order)

                            // Group by name
                            for (const item of walletSorted) {
                                if (this.priceRealTime[item.name]) {
                                    if (wlBreakDown[item.name]) {
                                        wlBreakDown[item.name] = {
                                            money: wlBreakDown[item.name].money + item.volume * item.price,
                                            volume: wlBreakDown[item.name].volume + item.volume,
                                            order: item.order
                                        }
                                    } else {
                                        wlBreakDown[item.name] = {
                                            money: item.volume * item.price,
                                            volume: item.volume,
                                            order: item.order
                                        }
                                    }
                                }
                            }

                            for (const [coinName, item] of Object.entries(wlBreakDown)) {
                                if (this.priceRealTime[coinName]) {
                                    const realTimeMoney = item.volume * this.priceRealTime[coinName]

                                    wlBreakDown[coinName] = {
                                        ...wlBreakDown[coinName],
                                        realTimeMoney,
                                        gap: realTimeMoney - item.money,
                                        percent: ((realTimeMoney - item.money) / item.money) * 100,
                                        name: coinName
                                    }
                                }
                            }


                            return Object.values(wlBreakDown)
                        }
                    },

                    watch: {
                        coinsFollowed(newVal) {
                            newVal.map(item => {
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
                    },

                    created() {
                        this.getWallet()
                        setInterval(this.getWallet, 3000)
                        this.getUSTCToVND()
                        setInterval(this.getUSTCToVND, 10000)

                        this.checkMutationOfCoin()
                        setTimeout(this.checkMutationOfCoin, 5000)

                        setInterval(() => {
                            if (this.turnOnNotification) {
                                const notiAsArray = Object.entries(this.notifications)
                                let time = 1000
                                let message = ''
                                let i = 0

                                for (let [coinName, value] of notiAsArray) {
                                    i++
                                    message = `${message} ${value} \n`

                                    if (i % 3 === 0) {
                                        setTimeout(() => {
                                            this.notifyMe({
                                                title: 'UP & DOWN Notification', message: message
                                            })
                                        }, time)
                                    }

                                    time = time + 250

                                    delete this.notifications[coinName]
                                    this.pushMessageToNotiRead(coinName, value)
                                }

                                console.log(JSON.stringify(this.notifications))
                            }
                        }, 30000)
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
                        },
                        linkToTradingView(name) {
                            return `https://www.tradingview.com/chart?symbol=BINANCE%3A${name}USDT`
                        },
                        getCoinListFromApi() {
                            this.coinsFollowed.map(item => {
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
                                                this.coinsFollowed = [...new Set(json.map(item => item.name))]
                                            }
                                        )
                                    }
                                }
                            )
                        },
                        handleNaN(number) {
                            return isNaN(number) ? 0 : number
                        },
                        /**
                         * @param payload || Object {title: string, message: string, img?: string, }
                         */
                        notifyMe(payload) {
                            const send = () => {
                                new Notification(payload.title, {
                                    body: payload.message,
                                    icon: '/contract.png'
                                });
                            }

                            // Let's check if the browser supports notifications
                            if (!("Notification" in window)) {
                                alert("This browser does not support desktop notification");
                            } else if (Notification.permission === "granted") {
                                send()
                            } else if (Notification.permission !== "denied") {
                                Notification.requestPermission().then(function (permission) {
                                    if (permission === "granted") {
                                        send()
                                    }
                                });
                            }
                        },
                        checkMutationOfCoin() {
                            const t0 = performance.now()
                            const value = this.profitBreakDown
                            if (value.length > 0) {
                                let a = null
                                let item = null
                                let rangeDefine = [
                                    [2, 5, 2, 'UP'],
                                    [5, 10, 5, 'UP'],
                                    [10, 15, 10, 'UP'],
                                    [15, 20, 15, 'UP'],
                                    [20, 1000, 20, 'UP'],
                                    [-10, -5, -5, 'DOWN'],
                                    [-15, -10, -10, 'DOWN'],
                                    [-20, -15, -15, 'DOWN'],
                                ]

                                for (let j = 0; j < value.length; j++) {
                                    item = value[j]
                                    for (let i = 0; i < rangeDefine.length; i++) {
                                        if (rangeDefine[i][0]<=item.gap&item.gap<rangeDefine[i][1]) {
                                            this.pushMessageToNotification(item.name, `${item.name} has ${rangeDefine[i][3]} > ${rangeDefine[i][2]} USDT`)
                                        }
                                    }
                                }
                            }


                            const t1 = performance.now()
                            console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
                        },
                        pushMessageToNotification(name, message) {
                            if (
                                this.notiRead[name] && message.localeCompare(this.notiRead[name]) === 0 ||
                                this.notifications[name] && message.localeCompare(this.notifications[name]) === 0
                            ) {
                                return
                            }

                            this.notifications[name] = message
                        },

                        pushMessageToNotiRead(name, message) {
                            if (this.notiRead[name] && message.localeCompare(this.notiRead[name]) === 0) {
                                return
                            }

                            this.notiRead[name] = message
                        },
                    }
                })
            }
            //////////////////            END VUEJS APPLICATION                                           //////////////
        })

        ////////////////////////////////      END Render GridStack             /////////////////////////////////////////

        ////////////////////////////////      Start support UI JS              /////////////////////////////////////////

        const onClickWidgetItemHandle = (e) => {
            if (e.target.className === 'lock-js clicked') {
                e.target.className = 'lock-js'
            } else {
                e.target.className = 'lock-js clicked'
            }
        }

        setTimeout(() => {
            var a = [...document.getElementsByClassName('lock-js')].map(item => {
                item.addEventListener('click', onClickWidgetItemHandle)
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

                const vueAppHeight = Number($('.vue-app-container')[0].offsetHeight)
                document.getElementsByClassName('custom-item')[0].style.height = `400px`
                document.getElementsByClassName('custom-item')[0].style.minHeight = `400pxpx`
            }, 3000)
        }

        ///////////////////////////////       End support UI JS                /////////////////////////////////////////


        [...new Set([...supportCoins, ...mainStreamCoins])].map((item => {
            document.getElementById('add-widget-js').appendChild($(`<option value="${item}">${item}</option>`)[0])
        }))

        $('#add-widget-js').on('change', (e) => {
            const date = new Date()
            const widgetId = `widget-${date.getMilliseconds()}`

            grid.addWidget({
                ...detectMob({w: 6, h: 3,}),
                content: `<div class="full-wh widget-content">
    <div id="${widgetId}" class="full-wh grid-stack-item_content-js"></div>
    <div class="lock-js clicked"></div>
</div>`,
                mobileSort: 73
            })

            if (document.getElementById(widgetId)) {
                document.getElementById(widgetId).value = new TradingView.widget({
                    ...COMMON_NORMAL,
                    symbol: `BINANCE:${e.target.value}USDT`,
                    container_id: widgetId
                })

                if (document.getElementById(widgetId).parentElement.querySelector('.lock-js')) {
                    document.getElementById(widgetId).parentElement.querySelector('.lock-js').addEventListener('click', onClickWidgetItemHandle)
                }
            }
        })

        return grid
    }

    ///////////////////////////////////       START APPLICATION                /////////////////////////////////////////

    const main = () => {
        const MAINSTREAM_COIN = ['FTM', 'RVN', 'ALGO']
        const SUPPORT_COIN = ['BTC', 'BNB', 'ETH']


        fetch(`https://crypto-be.ioabc.xyz/coin-followeds`).then(
            response => {
                if (response.ok) {
                    response.json().then(
                        json => {
                            const coinFollowed = json[json.findIndex(item => item.group_name === 'COIN_FOLLOWED')].coins
                            const supportCoin = json[json.findIndex(item => item.group_name === 'SUPPORT_COIN')].coins

                            beginRender(
                                coinFollowed || MAINSTREAM_COIN,
                                supportCoin || SUPPORT_COIN
                            )
                        }
                    )
                }
            }
        )
    }

    main()
})
