<template>
  <div class="container overflowY" :style="`height: calc(100vh ${player.player ? '- 60px' : ''} ${isElectron ? '- 28px' : ''})`">
    <b-loading :active.sync="isLoading"></b-loading>
    <div v-if="!isLoading" style="padding: 10px;">
      <p level-item class="title">{{ song.Name }}</p>
      <div class="level is-mobile">
        <div level-left @click="goBack()">
          <b-tooltip label="Back" position="is-right">
            <b-icon level-item size="is-medium" icon="arrow-left" class="pointer"></b-icon>
          </b-tooltip>
        </div>
        <div level-right>
          <b-tooltip label="Play Song Radio" position="is-left">
            <div @click="getRadio">
              <b-icon level-item size="is-medium" icon="radio" class="pointer"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Play Song" position="is-left">
            <div @click="playSongs()">
              <b-icon level-item size="is-medium" icon="play-circle" style="margin-left: 10px; margin-right: 10px;" class="pointer"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Inject Song into current queue" position="is-left">
            <div @click="playSongs(true)">
              <b-icon v-if="player.player" level-item size="is-medium" icon="needle" class="pointer"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Add Song to current queue" position="is-left" style="margin-left: 10px;">
            <div @click="playSongs(false, true)">
              <b-icon v-if="player.player" level-item size="is-medium" icon="playlist-plus" class="pointer"></b-icon>
            </div>
          </b-tooltip>
        </div>
      </div>
      <ItemTile v-if="song.Id" :item="song" item-type="song" :disable-click="true"></ItemTile>
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
    PlayerService.setQueue(songs);

    this.$buefy.toast.open({
      message: 'Starting song radio',
      type: 'is-success'
    });
  }

  playSongs(inject = false, add = false) {
    let songs = [_.cloneDeep(this.song)];

    let message;

    if (inject) {
      PlayerService.injectQueue(songs);
      message = 'Injected song into queue';
    } else if (add) {
      PlayerService.addToQueue(songs);
      message = 'Added song to queue';
    } else {
      PlayerService.setQueue(songs);
      message = 'Playing song';
    }

    this.$buefy.toast.open({
      message,
      type: 'is-success'
    });
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
