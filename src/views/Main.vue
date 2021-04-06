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

@Component({
  name: 'Main',
  components: {
    Player
  },
})
export default class Main extends Vue {
  isElectron = window.ipcRenderer ? true : false;
  player = Player;
}
</script>
