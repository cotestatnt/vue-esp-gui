<template>
  <div>
    <h3 class="box">{{ msg }}</h3>
    <div class="box">
      <table class="table">
      <thead>
        <tr>
          <th>Pin Name</th>
          <th>Pin number</th>
          <th>Type</th>
          <th>Level</th>
        </tr>
      </thead>
      <tbody>
        <!-- Con la direttiva v-for, viebe eseguito il rendering dei componenti per ciascuno degli elementi contenuti in gpioList[] -->
        <tr v-for="(item, index) in gpioList" :key="index">
          <td>{{ item.label }}</td>
          <td>{{ item.pin }}</td>
          <td>{{ item.type }}</td>
          <td>
            <!-- Con la direttiva v-if / v-else eseguiamo il rendering del DOM solo se la condizione è verificata -->
            <!-- Le immagini mostrate sono in formato vettoriale SVG e sono definite in svg.vue -->
            <div v-if="item.level" v-html="lightON"></div>
            <div v-else v-html="lightOFF"></div>
          </td>

          <!-- Se si tratta di un'uscita mostriamo anche un pulsante per controllarne lo stato -->
          <!-- Altra funzionalità di vue: binding condizionato della classe! -->
          <!-- Se il pin è quello associato a LED_BUILTIN aggiungiamo la classe 'tooltip' per visualizzere un tip al passaggio del mouse -->
          <td v-if="item.type=='output'" v-bind:class="{'tooltip' : item.pin==2}" >
            <button v-if="item.level" type="button" class="button is-danger" @click="setOut(item.pin, item.level)">OFF</button>
            <button v-else type="button" class="button is-success" @click="setOut(item.pin, item.level)">ON</button>
            <span v-if="item.pin==2" class="tooltiptext">This is usually LED_BUILTIN pin<br> LED will be ON when output is LOW</span>
          </td>

        </tr>


      </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import svg from '../assets/svg'
import '../style/tooltip.css'

export default {
  // Nome del components
  name: "gpio",

  // Le props possono essere usate per passare al componente child (questo) un valore dal parent (App.vue)
  props: {
    msg: String,
  },

  data() {
    return {
      // handler della connessione WebSocket
      connection: null,
      // gpioList è un'array di object contenente le caratteristiche di ciascun gpio
      gpioList: [],
      // Immagini SVG
      lightON: svg.lightON,
      lightOFF: svg.lightOFF,
    };
  },

  mounted() {
    // Chiama il metodo startConnection quando la pagina è stata renderizzata
    this.startConnection();
  },

  methods: {

    // Connessione al server websocket (ESP)
    startConnection() {
      this.$options.sockets.onmessage = (ev) => {
        this.parseMessage(ev.data)
      }
    },

    sendMessage(msg) {
      this.$socket.send(msg)
    },

    parseMessage(msg) {
      var obj = JSON.parse(msg);
      if ('gpios' in obj) {
        this.gpioList = obj.gpios
        //console.log(this.gpioList)
      }
    },

    // Questo metodo invia un messaggio websocket per eseguire il toggle dell'uscita sul micro
    setOut(pin, level){
      let obj = {}
      obj.cmd = 'writeOut'
      obj.pin = pin
      obj.level = !level
      this.sendMessage(JSON.stringify(obj));
      console.log(JSON.stringify(obj))
    }
  }

};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.box {
  border: 1px solid rgb(182, 184, 182);
  max-width: 600px;
  border-radius: 15px;
  margin: auto;
}

.table {
  width: 90%;
  margin: auto;
}

.table td {
  vertical-align: middle;
  padding: 0px;
  height: 60px;
}

.button{
  width: 50px;
}

</style>
