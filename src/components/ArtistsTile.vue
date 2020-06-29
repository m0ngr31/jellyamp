<template>
  <div class="column is-half-mobile is-1-tablet artist-tile">
    <img src="../assets/jellyfin_logo.png">
    <p class="subtitle is-6 artist-name">{{ artist.Name }}</p>
  </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';

import JellyfinService from '../services/jellyfin';

@Component({
  name: 'ArtistsTile',
  props: {
    artist: {
      type: Object,
      required: true,
    },
  },
})
export default class ArtistsTile extends Vue {
  mounted() {
    const artistUrl = JellyfinService.getArtistUrl(this.artist);

    if (artistUrl) {
      this.$el.children[0].setAttribute('src', artistUrl);
    }
  }
}
</script>

<style>
.columns.is-gapless > .column .artist-tile {
  padding: 5px 5px 5px 0px !important;
  text-align: center;
  margin-top: auto;
}

.artist-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
