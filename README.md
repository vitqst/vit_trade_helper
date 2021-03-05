# Purpose
Create a dashboard, where can quick look profit, lost, realtime data from tradingview

# Get Start
RUN

```yaml
npm install # install packet

npm run dev # run server to develop, it not realtime at the moment 

npm run pwa # create cache for pwa app
```

# Target
- [x] develop fall back for web socket & refresh button
- [ ] call api from somewhere to get wallet status 
- [ ] develop lazy load for blocks, which are don't see at the view port

# Function List
- [X] use gridstack for drag, resize of container
- [X] use Vuejs for react data, caculate profit & lost base on status of wallet & realtime tracking price 
- [X] use web socket for reduce data & increase performance 
- [X] optimize for mobile UX ( space for touch, UI, pwa )
