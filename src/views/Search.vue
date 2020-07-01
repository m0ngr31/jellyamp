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
          <div
            class="columns is-centered is-gapless no-grab scrolling-area"
            v-if="searchService.all_artists.length"
            :style="`height: calc(100vh ${player.player ? '- 60px' : ''} - 120px ${isElectron ? '- 28px' : ''})`"
          >
            <div class="column">
              <p class="title">Artists</p>
              <div class="columns is-mobile is-gapless is-multiline">
                <ItemTile
                  v-for="artist of searchService.all_artists"
                  v-bind:key="artist.Id"
                  :item="artist"
                  item-type="artist"
                ></ItemTile>
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

import ItemTile from "../components/ItemTile";

import PlayerService from "../services/player";
import JellyfinService from "../services/jellyfin";
import SearchService from "../services/search";

@Component({
  name: "Search",
  components: {
    ItemTile
  }
})
export default class Search extends Vue {
  isElectron = window.ipcRenderer ? true : false;
  search = "";

  player = PlayerService;
  searchService = SearchService;

  isLoading = false;
  isSearching = false;

  mounted() {
    if (!this.searchService.all_artists.length) {
      this.getArtists();
    }
  }

  async getArtists() {
    this.isLoading = true;

    try {
      this.searchService.all_artists = await JellyfinService.getArtists();
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

.scrolling-area {
  padding-left: 10px;
  overflow-y: auto;
}
</style>

<style>
.columns.is-gapless:not(:last-child) {
  margin-bottom: 0 !important;
}
</style>
