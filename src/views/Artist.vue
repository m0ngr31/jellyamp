<template>
  <div class="container overflowY" :style="`height: calc(100vh ${player.player ? '- 60px' : ''} ${isElectron ? '- 28px' : ''})`">
    <b-loading :active.sync="isLoading"></b-loading>
    <div v-if="!isLoading" style="padding: 10px;">
      <p level-item class="title">{{ artist.Name }}</p>
      <div class="level is-mobile">
        <div level-left @click="goBack()">
          <b-tooltip label="Back" position="is-right">
            <b-icon level-item size="is-medium" icon="arrow-left" class="pointer"></b-icon>
          </b-tooltip>
        </div>
        <div level-right>
          <b-tooltip label="Play Artist Radio" position="is-left">
            <div @click="getRadio">
              <b-icon level-item size="is-medium" icon="radio" class="pointer"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Play Artist Songs" position="is-left" v-if="hasSongs">
            <div @click="playSongs()">
              <b-icon level-item size="is-medium" icon="play-circle" style="margin-left: 10px; margin-right: 10px;" class="pointer"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Shuffle Artist Songs" position="is-left" v-if="hasSongs">
            <div @click="playSongs(true)">
              <b-icon level-item size="is-medium" icon="shuffle-variant" style="margin-right: 10px;" class="pointer"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Inject Artist Songs into current queue" position="is-left" v-if="hasSongs">
            <div @click="playSongs(false, true)">
              <b-icon v-if="player.player" level-item size="is-medium" icon="needle" class="pointer"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Add Artist Songs to current queue" position="is-left" v-if="hasSongs" style="margin-left: 10px;">
            <div @click="playSongs(false, false, true)">
              <b-icon v-if="player.player" level-item size="is-medium" icon="playlist-plus" class="pointer"></b-icon>
            </div>
          </b-tooltip>
        </div>
      </div>
      <div class="columns is-centered is-gapless">
        <div class="column" v-if="hasSongs && hasAlbums">
          <p class="title" v-if="hasAlbums">Albums</p>
          <div class="columns is-mobile is-gapless is-multiline">
            <ItemTile
              v-for="album of artist.albums"
              v-bind:key="album.Id"
              :item="album"
              item-type="album"
            ></ItemTile>
          </div>
          <p class="title" v-if="hasSongs">Songs</p>
          <div class="columns is-mobile is-gapless is-multiline">
            <ItemTile
              v-for="songs of artist.songs"
              v-bind:key="songs.Id"
              :item="songs"
              item-type="song"
            ></ItemTile>
          </div>
        </div>
        <div class="column" v-else>
          <h6 level-item class="title is-5">No songs or albums found</h6>
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
  name: 'Artist',
  components: {
    ItemTile
  }
})
export default class Artist extends Vue {
  isLoading = false;
  artist = {};
  isElectron = window.ipcRenderer ? true : false;
  player = PlayerService;

  mounted() {
    this.getArtistData();
  }

  goBack() {
    this.$router.go(-1);
  }

  async getArtistData() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    try {
      this.artist = await JellyfinService.getItem(this.$route.params.id);
      const [songs, albums] = await JellyfinService.getArtistAlbums(this.$route.params.id);

      this.artist.songs = songs;
      this.artist.albums = albums;
    } catch (e) {
      console.log(e);
      this.$buefy.toast.open({
        message: 'Could not get artist',
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
      message: 'Starting artist radio',
      type: 'is-success'
    });
  }

  playSongs(shuffle = false, inject = false, add = false) {
    let songs = _.cloneDeep(this.artist.songs);

    if (shuffle) {
      songs = _.shuffle(songs);
    }

    let message;

    if (inject) {
      PlayerService.injectQueue(songs);
      message = 'Injected songs into queue';
    } else if (add) {
      PlayerService.addToQueue(songs);
      message = 'Added songs to queue';
    } else {
      PlayerService.setQueue(songs);
      message = 'Playing artist songs';
    }

    this.$buefy.toast.open({
      message,
      type: 'is-success'
    });
  }

  get hasSongs() {
    if (this.artist && this.artist.songs && this.artist.songs.length) {
      return true;
    }

    return false;
  }

  get hasAlbums() {
    if (this.artist && this.artist.albums && this.artist.albums.length) {
      return true;
    }

    return false;
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
