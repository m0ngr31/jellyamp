<template>
  <div
    class="container overflowY"
    :style="`height: calc(100vh ${player.player ? '- 60px' : ''} ${isElectron ? '- 28px' : ''})`"
  >
    <b-loading :active.sync="isLoading"></b-loading>
    <div v-if="!isLoading" style="padding: 10px;">
      <p level-item class="title">{{ genre.Name }}</p>
      <div class="level is-mobile">
        <div level-left @click="goBack()">
          <b-tooltip label="Back" position="is-right">
            <b-icon level-item size="is-medium" icon="arrow-left" class="pointer"></b-icon>
          </b-tooltip>
        </div>
        <div level-right>
          <b-tooltip label="Play Genre Radio" position="is-left">
            <div @click="getRadio">
              <b-icon level-item size="is-medium" icon="radio" class="pointer"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Play Genre Songs" position="is-left" v-if="genre && genre.songs && genre.songs.length">
            <div @click="playSongs()">
              <b-icon
                level-item
                size="is-medium"
                icon="play-circle"
                style="margin-left: 10px; margin-right: 10px;" class="pointer"
              ></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip label="Shuffle Genre Songs" position="is-left" v-if="genre && genre.songs && genre.songs.length">
            <div @click="playSongs(true)">
              <b-icon
                level-item
                size="is-medium"
                icon="shuffle-variant"
                style="margin-right: 10px;"
                class="pointer"
              ></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip
            label="Inject Genre Songs into current queue"
            position="is-left"
            v-if="genre && genre.songs && genre.songs.length"
          >
            <div @click="playSongs(false, true)">
              <b-icon v-if="player.player" level-item size="is-medium" icon="needle" class="pointer"></b-icon>
            </div>
          </b-tooltip>
          <b-tooltip
            label="Add Genre Songs to current queue"
            position="is-left"
            v-if="genre && genre.songs && genre.songs.length"
            style="margin-left: 10px;"
          >
            <div @click="playSongs(false, false, true)">
              <b-icon v-if="player.player" level-item size="is-medium" icon="playlist-plus" class="pointer"></b-icon>
            </div>
          </b-tooltip>
        </div>
      </div>
      <div class="columns is-centered is-gapless">
        <div class="column" v-if="genre && genre.songs && genre.songs.length">
          <p class="title">Songs</p>
          <div class="columns is-mobile is-gapless is-multiline">
            <ItemTile
              v-for="song of genre.songs"
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
import ItemTile from '../components/ItemTile.vue';
import PlayerService from '../services/player';

@Component({
  name: 'Genre',
  components: {
    ItemTile,
  },
})
class Genre extends Vue {
  isLoading = false;
  genre = {};
  isElectron = !!window.ipcRenderer;
  player = PlayerService;

  mounted() {
    this.getGenreData();
  }

  goBack() {
    this.$router.go(-1);
  }

  async getGenreData() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    try {
      this.genre = await JellyfinService.getItem(this.$route.params.id);
      this.genre.songs = await JellyfinService.getGenreSongs(this.$route.params.id);
    } catch (e) {
      console.log(e);
      this.$buefy.toast.open({
        message: 'Could not get genre',
        type: 'is-danger',
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
      message: 'Starting genre radio',
      type: 'is-success',
    });
  }

  playSongs(shuffle = false, inject = false, add = false) {
    let songs = _.cloneDeep(this.genre.songs);

    if (shuffle) {
      songs = _.shuffle(songs);
    }

    let message;

    if (inject) {
      PlayerService.injectQueue(songs);
      message = 'Injected genre into queue';
    } else if (add) {
      PlayerService.addToQueue(songs);
      message = 'Added genre to queue';
    } else {
      PlayerService.setQueue(songs);
      message = 'Starting genre';
    }

    this.$buefy.toast.open({
      message,
      type: 'is-success',
    });
  }
}

export default Genre;
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
