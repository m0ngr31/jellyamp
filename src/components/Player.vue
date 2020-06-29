<template>
  <div style="height: 15vh">
    eyy lmao!!
  </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';

import JellyfinService from '../services/jellyfin';
import PlayerService from '../services/player';

@Component({
  name: 'Player',
})
export default class Player extends Vue {
  mounted() {
    // Just for test
    PlayerService.playlist = [
      {
        Id: '2d77ddfccca705a067958d8ea3a53654',
      },
      {
        Id: '1435b88e4775860f25cb6d5bc25f9e17',
      },
    ];

    PlayerService.play(0);

    setTimeout(() => {
      PlayerService.seek(95);
    }, 10000);

    setTimeout(() => {
      // PlayerService.play(1);
    }, 20000);
  }
}
</script>

