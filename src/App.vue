<template>
  <div id="app">
    <v-titlebar
      v-if="showTitle"
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

import {Notifications} from './services/notifications';

@Component({
  name: 'App',
})
export default class App extends Vue {
  isElectron = window.ipcRenderer ? true : false;
  distro = window.electronRemote.process.platform;

  showTitle = this.isElectron && this.distro !== 'linux';

  mounted() {
    Notifications.service = this.$buefy.toast;
  }

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

::-webkit-scrollbar {
  width: 0px;
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

.overflowY {
  overflow-y: auto;
}

html, body {
  /* height: 100vh; */
  margin: 0;
  color: white;
  overflow: hidden !important;
  -webkit-user-select: none;
  -webkit-app-region: drag
}

button, input, .player, .no-grab, .container, .mini-player {
  -webkit-app-region: no-drag;
}

.max-width {
  width: 100%;
}

@keyframes slide-up {
  0% {
    top: 100vh;
  }
  100% {
    top: 0px;
  }
}

.pointer {
  cursor: pointer;
}

.columns:not(:last-child) {
  margin-bottom: 0;
}
</style>
