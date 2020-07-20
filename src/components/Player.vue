<template>
  <div v-if="player.player">
    <Playlist v-if="player.showPlaylist"></Playlist>
    <div class="player" v-show="!miniPlayer" :style="`height: calc(100vh ${isElectron ? '- 26px' : ''});`">
      <img class="bg-album update-img">
      <div class="container">
        <div class="level-bottom level is-mobile" style="padding: 15px 15px 0px 15px;">
          <div level-left @click="togglePlayer()">
            <b-icon level-item size="is-medium" icon="chevron-down" class="pointer"></b-icon>
          </div>
          <div level-right @click="player.showPlaylist = true">
            <b-icon level-item size="is-medium" icon="playlist-music" class="pointer"></b-icon>
          </div>
        </div>
        <div class="container" style="padding: 0px 20px">
          <div class="level-bottom level is-mobile">
            <div level-item></div>
            <img
              level-item style="max-width: 300px; max-height: 300px; min-height: 300px; min-width: 300px"
              class="update-img"
              src="../assets/logo.png"
            >
            <div level-item></div>
          </div>
          <div class="level-bottom level is-mobile">
            <div level-item style="width: 30px"></div>
            <div level-item class="middle" style="width: 100%; text-align: center">
              <h6 class="title is-5 song-title">{{ player.playlist[player.index].Name }}</h6>
              <h6 class="subtitle is-6 song-title">{{ player.playlist[player.index].artist }}</h6>
            </div>
            <div level-item class="ends" style="text-align: right; width: 30px;" @click="likeSong">
              <b-icon level-item :icon="`${player.playlist[player.index].loved ? 'heart' : 'heart-outline'}`" :type="`${player.playlist[player.index].loved ? 'is-danger' : ''}`" class="pointer"></b-icon>
            </div>
          </div>
          <div class="level-bottom level is-mobile" style="margin-bottom: 0">
            <div level-left></div>
            <div level-item style="width: 100%" id="scrubber">
              <b-slider
                size="is-small"
                type="is-success"
                :tooltip="false"
                rounded :value="currentProgress"
                lazy @change="seekHere"
              ></b-slider>
            <div level-left></div>
            </div>
          </div>
          <div class="level-bottom level is-mobile" style="margin-top: -.75em">
            <div level-left>
              {{ currentPlayTime | duration }}
            </div>
            <div level-left>
              {{ player.player.duration() | duration }}
            </div>
          </div>
          <div class="level-bottom level is-mobile" style="margin-top: 4em">
            <div level-left></div>
            <div level-item id="big-icons">
              <span @click="prev">
                <b-icon level-item size="is-large" icon="skip-previous" class="pointer"></b-icon>
              </span>
              <span @click="playPause">
                <b-icon
                  level-item size="is-large"
                  :icon="`${player.playing ? 'pause-circle' : 'play-circle'}`"
                  style="margin-left: 25px; margin-right: 25px;"
                  class="pointer"
                ></b-icon>
              </span>
              <span @click="skip">
                <b-icon level-item size="is-large" icon="skip-next" class="pointer"></b-icon>
              </span>
            </div>
            <div level-right></div>
          </div>
        </div>
      </div>
    </div>
    <div class="mini-player" v-show="miniPlayer">
      <progress class="progress playing-progress is-success" :value="currentProgress" max="100" style="z-index: 30"></progress>
      <div class="level is-mobile pointer" style="max-height: 58px;">
        <div level-left class="ends" @click="miniPlayer = false">
          <img level-item src="../assets/logo.png" class="album-art update-img">
        </div>
        <div level-item class="middle" @click="miniPlayer = false">
          <h6 class="title is-6 song-title">{{ player.playlist[player.index].Name }}</h6>
          <h6 class="subtitle is-6 song-title">{{ player.playlist[player.index].artist }}</h6>
        </div>
        <div level-right class="ends">
          <span @click="likeSong">
            <b-icon level-item :icon="`${player.playlist[player.index].loved ? 'heart' : 'heart-outline'}`" :type="`${player.playlist[player.index].loved ? 'is-danger' : ''}`"></b-icon>
          </span>
          <span @click="playPause">
            <b-icon level-item :icon="`${player.playing ? 'pause' : 'play'}`"></b-icon>
          </span>
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

import Playlist from '../components/Playlist';

@Component({
  name: 'Player',
  components: {
    Playlist,
  }
})
export default class Player extends Vue {
  isElectron = window.ipcRenderer ? true : false;
  miniPlayer = true;
  player = PlayerService;
  currentPlayTime = 0;
  currentProgress = 0;

  mounted() {
    PlayerService.viewModel = this;
  }

  togglePlayer() {
    this.miniPlayer = !this.miniPlayer;
  }

  playPause() {
    PlayerService.playPause();
  }

  skip() {
    PlayerService.skip('next');
  }

  prev() {
    PlayerService.handleBack();
  }

  seekHere(val) {
    PlayerService.seek(val);
  }

  likeSong() {
    PlayerService.likeItem();
  }
}
</script>

<style scoped>
/* Mini-Player */
.mini-player {
  height: 60px;
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #000B25;
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

/* Big player */
.player {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 100;
  background-color: #000B25;
}

.level-bottom {
  margin-bottom: .75em;
}

.bg-album {
  min-height: calc(100vh + 30px);
  min-width: calc(100vw + 30px);
  overflow: hidden;
  position: fixed;
  top: 0;
}

img.bg-album {
  filter:blur(15px) opacity(80%);
  margin: -15px;
}
</style>

<style>
#big-icons > .mdi-48px.mdi-set, .mdi-48px.mdi:before {
  font-size: 64px;
}

#scrubber > .b-slider .b-slider-thumb-wrapper .b-slider-thumb {
  background: #2ecc71 !important;
  border: 1px solid #2ecc71 !important;
}
</style>
