<template>
  <div class="columns is-mobile is-centered is-gapless">
    <div class="column max-width">
      <section class="top">
        <b-loading :is-full-page="false" :active.sync="isLoading"></b-loading>
        <div v-if="!isLoading">
          <div class="columns is-mobile is-centered">
            <div class="column is-11-mobile is-two-thirds-tablet">
              <div style="display: inline-flex; width: 100%;">
                <div style="width: 100vw">
                  <b-field>
                    <b-input v-model="search" type="search" placeholder="Search..." icon="magnify" @input="doSearch"></b-input>
                  </b-field>
                </div>
                <div style="width: 15px"/>
                <div>
                  <div style="padding-top: 4px;" @click="gotoSettings" class="no-grab">
                    <b-icon level-item size="is-medium" icon="cog-outline" class="pointer"></b-icon>
                  </div>
                </div>
              </div>
              <div class="progress is-small" v-if="!isSearching"></div>
            </div>
          </div>
          <div
            class="columns is-centered is-gapless no-grab scrolling-area"
            v-if="searchService.all_artists.length"
            :style="`height: calc(100vh ${player.player ? '- 60px' : ''} - 120px ${isElectron ? '- 28px' : ''})`"
          >
            <div class="column" v-if="!searchService.searchTerm">
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
            <div class="column" v-if="searchService.searchTerm">
              <p class="title" v-if="searchService.search.artists.length">Artists</p>
              <div class="columns is-mobile is-gapless is-multiline">
                <ItemTile
                  v-for="artist of searchService.search.artists"
                  v-bind:key="artist.Id"
                  :item="artist"
                  item-type="artist"
                ></ItemTile>
              </div>
              <p class="title" v-if="searchService.search.albums.length">Albums</p>
              <div class="columns is-mobile is-gapless is-multiline">
                <ItemTile
                  v-for="album of searchService.search.albums"
                  v-bind:key="album.Id"
                  :item="album"
                  item-type="album"
                ></ItemTile>
              </div>
              <p class="title" v-if="searchService.search.songs.length">Songs</p>
              <div class="columns is-mobile is-gapless is-multiline">
                <ItemTile
                  v-for="song of searchService.search.songs"
                  v-bind:key="song.Id"
                  :item="song"
                  item-type="song"
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
import _ from 'lodash';

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
  search = '';

  player = PlayerService;
  searchService = SearchService;

  isLoading = false;
  isSearching = false;

  doSearch = _.throttle(async txt => {
    this.isSearching = true;

    try {
      const [artists, songs, albums] = await JellyfinService.search(txt);

      SearchService.search.albums = albums || [];
      SearchService.search.artists = artists || [];
      SearchService.search.songs = songs || [];
      SearchService.searchTerm = txt;
    } catch (e) {
      console.log(e);
    } finally {
      this.isSearching = false;
    }
  }, 500, {leading: false, trailing: true});

  mounted() {
    if (!this.searchService.all_artists.length) {
      this.getArtists();
    }

    if (SearchService.searchTerm) {
      this.search = SearchService.searchTerm;
    }
  }

  gotoSettings() {
    this.$router.push({name: 'Settings'});
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
