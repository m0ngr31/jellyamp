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

import Player from '../components/Player';
import PlayerService from '../services/player';
import UpdateService from '../services/update';

import { getItemOrDefault } from '../services/localstorage';

@Component({
  name: 'Main',
  components: {
    Player
  },
})
export default class Main extends Vue {
  isElectron = window.ipcRenderer ? true : false;
  player = Player;

  async mounted() {

    const checkForUpdates = getItemOrDefault('check-for-updates', true);

    if(checkForUpdates && await UpdateService.isUpdateAvailable()) {
      this.$buefy.toast.open({
        duration: 5000,
        message: 'An update for Jellyamp is available.',
        type: 'is-info'
      });
    }
  }
}
</script>
