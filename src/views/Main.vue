<template>
  <div>
    <div style="height: 85vh">
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
  mounted() {
    if (this.$route.name !== 'Search') {
      this.$router.push({ name: 'Search' });
    }
  }
}
</script>
