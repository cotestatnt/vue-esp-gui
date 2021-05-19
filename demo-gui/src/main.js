import Vue from 'vue'
import App from './App.vue'

import '@/style/bulma.scss';
import '@/style/tooltip.css';


import VueNativeSock from 'vue-native-websocket'

let wsaddress = 'ws://' + window.location.hostname + ':81'  //'ws://192.168.249.157:81'
//let wsaddress = 'ws://192.168.2.62:81'  //'ws://192.168.249.157:81'

Vue.use(VueNativeSock, wsaddress, {
  format: 'json',
  reconnection: true,       // (Boolean) whether to reconnect automatically (false)
  reconnectionAttempts: 0,  // (Number) number of reconnection attempts before giving up (Infinity),
  reconnectionDelay: 3000,  // (Number) how long to initially wait before attempting a new (1000)
})

Vue.config.productionTip = false
new Vue({
  render: h => h(App),
}).$mount('#app')
