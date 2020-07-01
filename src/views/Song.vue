<template>
  <div class="container overflowY" :style="`height: calc(100vh ${player.player ? '- 60px' : ''} ${isElectron ? '- 28px' : ''})`">
    <b-loading :active.sync="isLoading"></b-loading>
    <div v-if="!isLoading" style="padding: 10px;">
      <p level-item class="title">{{ song.Name }}</p>
      <div class="level is-mobile">
        <div level-left @click="goBack()">
          <b-tooltip label="Back" position="is-right">
            <b-icon level-item size="is-medium" icon="arrow-left"></b-icon>
          </b-tooltip>
        </div>
        <div level-right>
          <b-tooltip label="Play Song Radio" position="is-left">
            <div @click="getRadio">
              <b-icon level-item size="is-medium" icon="radio"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Play Song" position="is-left">
            <div @click="playSongs()">
              <b-icon level-item size="is-medium" icon="play-circle" style="margin-left: 10px; margin-right: 10px;"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Inject Song into current playlist" position="is-left">
            <div @click="playSongs(true)">
              <b-icon v-if="player.player" level-item size="is-medium" icon="playlist-plus"></b-icon>
            </div>
          </b-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';

import JellyfinService from '../services/jellyfin';
import ItemTile from "../components/ItemTile";
import PlayerService from '../services/player';

@Component({
  name: 'Song',
  components: {
    ItemTile
  }
})
export default class Song extends Vue {
  isLoading = false;
  song = {};
  isElectron = window.ipcRenderer ? true : false;
  player = PlayerService;

  mounted() {
    this.getSongData();
  }

  goBack() {
    this.$router.go(-1);
  }

  async getSongData() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    try {
      this.song = await JellyfinService.getItem(this.$route.params.id);
    } catch (e) {
      console.log(e);
      this.$buefy.toast.open({
        message: 'Could not get song',
        type: 'is-danger'
      });

      this.goBack();
    } finally {
      this.isLoading = false;
    }
  }

  async getRadio() {
    const songs = await JellyfinService.getInstantMix(this.$route.params.id);
    PlayerService.setPlaylist(songs);
  }

  playSongs(inject = false) {
    let songs = [_.cloneDeep(this.song)];

    if (inject) {
      PlayerService.injectPlaylist(songs);
    } else {
      PlayerService.setPlaylist(songs);
    }
  }
}
</script>

<style>
.title {
  text-transform: unset;
  letter-spacing: unset;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
