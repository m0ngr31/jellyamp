<template>
  <div class="columns is-mobile is-centered is-gapless">
    <div class="column">
      <section class="top">
        <b-loading :is-full-page="false" :active.sync="isLoading"></b-loading>
        <div v-if="!isLoading">
          <div class="columns is-mobile is-centered">
            <div class="column is-three-quarters-mobile is-two-thirds-tablet">
              <b-field>
                <b-input v-model="search" type="search" placeholder="Search..." icon="magnify"></b-input>
              </b-field>
              <progress class="progress is-small is-info" max="100" v-if="isSearching"></progress>
              <div class="progress is-small" v-if="!isSearching"></div>
            </div>
          </div>
          <div class="columns is-centered scroller is-gapless" style="padding-left: 10px" v-if="player.all_artists.length">
            <div class="column">
              <p class="title">Artists</p>
              <div class="columns is-mobile is-gapless is-multiline">
                <ArtistsTile
                  v-for="artist of player.all_artists"
                  v-bind:key="artist.Id"
                  :artist="artist"
                ></ArtistsTile>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Component from "vue-class-component";

import ArtistsTile from "../components/ArtistsTile";

import PlayerService from "../services/player";
import JellyfinService from "../services/jellyfin";

@Component({
  name: "Search",
  components: {
    ArtistsTile
  }
})
export default class Search extends Vue {
  search = "";

  player = PlayerService;

  isLoading = false;
  isSearching = false;

  mounted() {
    if (!this.player.all_artists.length) {
      this.getArtists();
    }
  }

  async getArtists() {
    this.isLoading = true;

    try {
      this.player.all_artists = await JellyfinService.getArtists();
    } catch (e) {
      console.log(e);
    } finally {
      this.isLoading = false;
    }
  }
}
</script>

<style scoped>
.top {
  margin-top: 35px;
}
</style>

<style>
.columns.is-gapless:not(:last-child) {
  margin-bottom: 0 !important;
}
</style>
