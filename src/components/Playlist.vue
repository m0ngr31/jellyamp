<template>
  <div
    class="playlist overflowY"
    :style="`height: calc(100vh ${isElectron ? '- 26px' : ''}); top: ${isElectron ? 26 : 0}px`"
  >
    <div class="container">
      <div class="level is-mobile">
        <div class="level-left" @click="player.showPlaylist = false">
          <b-icon level-item size="is-medium" icon="chevron-left"></b-icon>
          <p level-item class="title">Playlist</p>
        </div>
      </div>
      <div
        class="playlist-item"
        v-for="(song, index) of player.playlist"
        v-bind:key="`${song.Id}${index}`"
      >
        <div class="level is-mobile">
          <div level-left class="ends" @click="playSong(index)">
            <img level-item :src="song.thumbnailImage" loading="lazy" class="album-art">
          </div>
          <div level-item class="middle" @click="playSong(index)">
            <h6 class="title is-6 song-title">{{ song.Name }}</h6>
            <h6 class="subtitle is-6 song-title">{{ song.artist }}</h6>
          </div>
          <div level-right class="ends" @click="removeItem(index)" style="text-align: right">
            <b-icon v-if="index !== player.index" level-item icon="close-circle-outline"></b-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';

import JellyfinService from '../services/jellyfin';
import PlayerService from '../services/player';

@Component({
  name: 'Playlist',
})
export default class Playlist extends Vue {
  isElectron = window.ipcRenderer ? true : false;
  player = PlayerService;

  removeItem(index) {
    PlayerService.removeItem(index);
  }

  playSong(index) {
    PlayerService.skipTo(index);
  }
}
</script>

<style scoped>
.playlist {
  padding: 15px;
  background-color: #000B25;
  z-index: 150;
  position: fixed;
  width: 100%;
}

.playlist-item {
  height: 60px;
  width: 100%;
}

.album-art {
  height: 58px;
  max-width: 58px;
  width: auto;
}

.playing-progress {
  border-radius: 0px !important;
  height: 2px !important;
  margin-bottom : 0 !important;
}

.ends {
  width: 60px;
}

.middle {
  overflow: hidden;
  white-space: nowrap;
  margin-right: 10px;
  margin-left: 10px;
  width: calc(100% - 120px);
}

.song-title {
  text-transform: unset;
  letter-spacing: unset;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #fff;
}
</style>
