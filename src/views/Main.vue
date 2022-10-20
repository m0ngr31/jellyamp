<template>
  <div>
    <div :style="`height: calc(100vh ${player.player ? '- 60px' : ''} ${isElectron ? '- 28px' : ''})`">
      <router-view />
    </div>
    <Player />
  </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';

import Player from '../components/Player.vue';

import { getItemOrDefault } from '../services/localstorage';

@Component({
  name: 'Main',
  components: {
    Player,
  },
})
class Main extends Vue {
  isElectron = !!window.ipcRenderer;
  player = Player;

  async mounted() {
    const checkForUpdates = getItemOrDefault('notify-of-updates', true);

    window.ipcRenderer.on('update-available', (event, versionInfo) => {
      if (checkForUpdates) {
        this.$buefy.toast.open({
          duration: 5000,
          message: `Version ${versionInfo.version} for Jellyamp is available.`,
          type: 'is-info',
        });
      }
    });
  }
}

export default Main;
</script>
