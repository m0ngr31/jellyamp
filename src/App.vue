<template>
  <div id="app">
    <v-titlebar
      v-if="isElectron"
      theme="dark"
      :platform="distro"
      :is-maximizable="false"
      :is-closable="true"
      :is-minimizable="true"
      :show-icon="false"
      :show-title="false"
      :on-minimize="minimize"
      :on-close="close"
    >
      <template slot="icon">
        <img src="./assets/logo.png" alt="icon" />
      </template>
    </v-titlebar>
    <router-view/>
  </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  name: 'App',
})
export default class App extends Vue {
  isElectron = window.ipcRenderer ? true : false;
  distro = process.env.VUE_APP_OS;

  close() {
    if (this.isElectron) {
      window.electronRemote.getCurrentWindow().close();
    }
  }

  minimize() {
    if (this.isElectron) {
      window.electronRemote.getCurrentWindow().minimize();
    }
  }
}
</script>

<style lang="sass">
$bulmaswatch-import-font: false

@import '~bulmaswatch/darkly/_variables'
@import '~bulma/bulma'
@import '~bulmaswatch/darkly/_overrides'

$app-background: #000B25
$loading-background: $app-background
$loading-background-legacy: $app-background

@import "~buefy/src/scss/buefy"

html, body
  background-color: $app-background
</style>

<style>
@import '~@mdi/font/css/materialdesignicons.css';

@font-face {
  font-family: 'quicksand';
  src: url("./assets/Quicksand-Regular.ttf");
}

#app {
  font-family: 'quicksand', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.titlebar.titlebar-style-dark {
  background: unset !important;
}

.titlebar .titlebar-buttons-osx {
  width: 50px !important;
}

.scroller {
  /* height: 75vh; */
  overflow-y: auto;
  height: calc(85vh - 125px);
}

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

html, body {
  /* height: 100vh; */
  margin: 0;
  color: white;
  overflow: hidden !important;
  -webkit-user-select: none;
  -webkit-app-region: drag
}

button, input, .scroller, audio {
  -webkit-app-region: no-drag;
}
</style>
