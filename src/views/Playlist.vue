<template>
  <div class="container overflowY" :style="`height: calc(100vh ${player.player ? '- 60px' : ''} ${isElectron ? '- 28px' : ''})`">
    <b-loading :active.sync="isLoading"></b-loading>
    <div v-if="!isLoading" style="padding: 10px;">
      <p level-item class="title">{{ playlist.Name }}</p>
      <div class="level is-mobile">
        <div level-left @click="goBack()">
          <b-tooltip label="Back" position="is-right">
            <b-icon level-item size="is-medium" icon="arrow-left" class="pointer"></b-icon>
          </b-tooltip>
        </div>
        <div level-right>
          <b-tooltip label="Play Playlist Radio" position="is-left">
            <div @click="getRadio">
              <b-icon level-item size="is-medium" icon="radio" class="pointer"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Play Playlist Songs" position="is-left" v-if="playlist && playlist.songs && playlist.songs.length">
            <div @click="playSongs()">
              <b-icon level-item size="is-medium" icon="play-circle" style="margin-left: 10px; margin-right: 10px;" class="pointer"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Shuffle Playlist Songs" position="is-left" v-if="playlist && playlist.songs && playlist.songs.length">
            <div @click="playSongs(true)">
              <b-icon level-item size="is-medium" icon="shuffle-variant" style="margin-right: 10px;" class="pointer"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Inject Playlist Songs into current queue" position="is-left" v-if="playlist && playlist.songs && playlist.songs.length">
            <div @click="playSongs(false, true)">
              <b-icon v-if="player.player" level-item size="is-medium" icon="playlist-plus" class="pointer"></b-icon>
            </div>
          </b-tooltip>
        </div>
      </div>
      <div class="columns is-centered is-gapless">
        <div class="column" v-if="playlist && playlist.songs && playlist.songs.length">
          <p class="title">Songs</p>
          <div class="columns is-mobile is-gapless is-multiline">
            <ItemTile
              v-for="song of playlist.songs"
              v-bind:key="song.Id"
              :item="song"
              item-type="song"
            ></ItemTile>
          </div>
        </div>
        <div class="column" v-else>
          <h6 level-item class="title is-5">No songs found</h6>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import _ from 'lodash';

import JellyfinService from '../services/jellyfin';
import ItemTile from "../components/ItemTile";
import PlayerService from '../services/player';

@Component({
  name: 'Playlist',
  components: {
    ItemTile
  }
})
export default class Playlist extends Vue {
  isLoading = false;
  playlist = {};
  isElectron = window.ipcRenderer ? true : false;
  player = PlayerService;

  mounted() {
    this.getPlaylistData();
  }

  goBack() {
    this.$router.go(-1);
  }

  async getPlaylistData() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    try {
      this.playlist = await JellyfinService.getItem(this.$route.params.id);
      this.playlist.songs = await JellyfinService.getPlaylistSongs(this.$route.params.id);
    } catch (e) {
      console.log(e);
      this.$buefy.toast.open({
        message: 'Could not get playlist',
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
      message: 'Starting playlist radio',
      type: 'is-success'
    });
  }

  playSongs(shuffle = false, inject = false) {
    let songs = _.cloneDeep(this.playlist.songs);

    if (shuffle) {
      songs = _.shuffle(songs);
    }

    let message;

    if (inject) {
      PlayerService.injectQueue(songs);
      message = 'Injected playlist into queue';
    } else {
      PlayerService.setQueue(songs);
      message = 'Starting playlist';
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
