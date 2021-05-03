<template>
  <div id="app">
    <span style="max-with: 100px" v-html="espLogo"></span>
    <gpio msg="GPIO status list" />
  </div>
</template>

<script>
import gpio from './components/gpio.vue'
import svg from './assets/svg'

export default {
  name: 'App',
  components: {
    gpio
  },

   data() {
    return {
      espLogo: svg.espLogo,
    };
  },


}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body {
  background: #f2f2f2;
}
</style>
