<template>
  <div class="columns is-mobile is-centered is-gapless">
    <div class="column max-width">
      <section class="top">
        <div>
          <div class="columns is-mobile is-centered">
            <div class="column is-11-mobile is-two-thirds-tablet">
              <div style="display: inline-flex; width: 100%;">
                <div style="width: 100vw">
                  <b-field>
                    <b-input
                      v-model="search"
                      type="search"
                      placeholder="Search..."
                      icon="magnify"
                      @input="doSearch"
                    ></b-input>
                  </b-field>
                </div>
                <div style="width: 15px"/>
                <div>
                  <div style="padding-top: 4px;" @click="gotoSettings" class="no-grab">
                    <b-icon level-item size="is-medium" icon="cog-outline" class="pointer"></b-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="columns is-centered is-gapless no-grab scrolling-area"
            ref="searchme"
            id="searchArea"
            :style="`height: calc(100vh ${player.player ? '- 60px' : ''} - 120px)`"
          >
            <div class="column" v-if="!searchService.searchTerm">
              <b-carousel
                v-model="carousel"
                animated="slide"
                :has-drag="true"
                :autoplay="false"
                :indicator="false"
                @change="carouselChanged()"
              >
                <b-carousel-item>
                  <div class="level-bottom level is-mobile">
                    <div
                      level-item
                      class="ends"
                      style="text-align: right; width: 30px;"
                      @click="prev"
                    >
                      <b-icon level-item icon="chevron-left" class="pointer"></b-icon>
                    </div>
                    <div level-item class="middle" style="width: 100%; text-align: center">
                      <p class="title">Artists</p>
                    </div>
                    <div
                      level-item
                      class="ends"
                      style="text-align: right; width: 30px; margin-right: 15px"
                      @click="next"
                    >
                      <b-icon
                        style="padding-top: 2em"
                        level-item
                        icon="chevron-right"
                        class="pointer"
                      ></b-icon>
                    </div>
                  </div>

                  <div class="columns is-mobile is-gapless is-multiline">
                    <ItemTile
                      v-for="artist of searchService.all_artists"
                      v-bind:key="artist.Id"
                      :item="artist"
                      item-type="artist"
                    ></ItemTile>
                  </div>
                </b-carousel-item>
                <b-carousel-item>
                  <div class="level-bottom level is-mobile">
                    <div
                      level-item
                      class="ends"
                      style="text-align: right; width: 30px;"
                      @click="prev"
                    >
                      <b-icon level-item icon="chevron-left" class="pointer"></b-icon>
                    </div>
                    <div level-item class="middle" style="width: 100%; text-align: center">
                      <p class="title">Albums</p>
                    </div>
                    <div
                      level-item
                      class="ends"
                      style="text-align: right; width: 30px; margin-right: 15px"
                      @click="next"
                    >
                      <b-icon
                        style="padding-top: 2em"
                        level-item
                        icon="chevron-right"
                        class="pointer"
                      ></b-icon>
                    </div>
                  </div>

                  <div class="columns is-mobile is-gapless is-multiline">
                    <ItemTile
                      v-for="album of searchService.all_albums"
                      v-bind:key="album.Id"
                      :item="album"
                      item-type="album"
                    ></ItemTile>
                  </div>
                </b-carousel-item>
                <b-carousel-item>
                  <div class="level-bottom level is-mobile">
                    <div
                      level-item
                      class="ends"
                      style="text-align: right; width: 30px;"
                      @click="prev"
                    >
                      <b-icon level-item icon="chevron-left" class="pointer"></b-icon>
                    </div>
                    <div level-item class="middle" style="width: 100%; text-align: center">
                      <p class="title">Genres</p>
                    </div>
                    <div
                      level-item
                      class="ends"
                      style="text-align: right; width: 30px; margin-right: 15px"
                      @click="next"
                    >
                      <b-icon
                        style="padding-top: 2em"
                        level-item
                        icon="chevron-right"
                        class="pointer"
                      ></b-icon>
                    </div>
                  </div>

                  <div class="columns is-mobile is-gapless is-multiline">
                    <ItemTile
                      v-for="genre of searchService.all_genres"
                      v-bind:key="genre.Id"
                      :item="genre"
                      item-type="genre"
                    ></ItemTile>
                  </div>
                </b-carousel-item>
                <b-carousel-item>
                  <div class="level-bottom level is-mobile">
                    <div
                      level-item
                      class="ends"
                      style="text-align: right; width: 30px;"
                      @click="prev"
                    >
                      <b-icon level-item icon="chevron-left" class="pointer"></b-icon>
                    </div>
                    <div level-item class="middle" style="width: 100%; text-align: center">
                      <p class="title">Playlists</p>
                    </div>
                    <div
                      level-item
                      class="ends"
                      style="text-align: right; width: 30px; margin-right: 15px"
                      @click="next"
                    >
                      <b-icon
                        style="padding-top: 2em"
                        level-item
                        icon="chevron-right"
                        class="pointer"
                      ></b-icon>
                    </div>
                  </div>

                  <div class="columns is-mobile is-gapless is-multiline">
                    <ItemTile
                      v-for="playlist of searchService.all_playlists"
                      v-bind:key="playlist.Id"
                      :item="playlist"
                      item-type="playlist"
                    ></ItemTile>
                  </div>
                </b-carousel-item>
                <b-carousel-item>
                  <div class="level-bottom level is-mobile">
                    <div
                      level-item
                      class="ends"
                      style="text-align: right; width: 30px;"
                      @click="prev"
                    >
                      <b-icon level-item icon="chevron-left" class="pointer"></b-icon>
                    </div>
                    <div level-item class="middle" style="width: 100%; text-align: center">
                      <p class="title">Favorites</p>
                    </div>
                    <div
                      level-item
                      class="ends"
                      style="text-align: right; width: 30px; margin-right: 15px"
                      @click="next"
                    >
                      <b-icon
                        style="padding-top: 2em"
                        level-item icon="chevron-right"
                        class="pointer"
                      ></b-icon>
                    </div>
                  </div>

                  <b-tooltip
                    label="Shuffle"
                    position="is-right"
                    v-if="searchService.all_favorites && searchService.all_favorites.length"
                  >
                    <div @click="playFavorites()">
                      <b-icon
                        level-item
                        size="is-medium"
                        icon="shuffle-variant"
                        style="margin-left: 10px;"
                        class="pointer"
                      ></b-icon>
                    </div>
                  </b-tooltip>

                  <div class="columns is-mobile is-gapless is-multiline">
                    <ItemTile
                      v-for="favorite of searchService.all_favorites"
                      v-bind:key="favorite.Id"
                      :item="favorite"
                      item-type="song"
                    ></ItemTile>
                  </div>
                </b-carousel-item>
              </b-carousel>
            </div>
            <div class="column" v-else>
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
              <p class="title" v-if="searchService.search.playlists.length">Playlists</p>
              <div class="columns is-mobile is-gapless is-multiline">
                <ItemTile
                  v-for="playlist of searchService.search.playlists"
                  v-bind:key="playlist.Id"
                  :item="playlist"
                  item-type="playlist"
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
import Vue from 'vue';
import Component from 'vue-class-component';
import _ from 'lodash';

import ItemTile from '../components/ItemTile.vue';

import PlayerService from '../services/player';
import JellyfinService from '../services/jellyfin';
import SearchService from '../services/search';
import {getItemOrDefault} from '../services/localstorage';

@Component({
  name: 'Search',
  components: {
    ItemTile,
  },
})
class Search extends Vue {
  isElectron = !!window.ipcRenderer;
  search = '';
  carousel = 0;
  defaultView = null;

  player = PlayerService;
  searchService = SearchService;

  isLoading = false;
  loadingComponent = null;

  doSearch = _.throttle(async txt => {
    this.startLoading();

    if (!txt || txt.length === 0) {
      SearchService.searchTerm = null;
    } else {
      try {
        const [artists, songs, albums, playlists] = await JellyfinService.search(txt);

        SearchService.search.albums = albums || [];
        SearchService.search.artists = artists || [];
        SearchService.search.songs = songs || [];
        SearchService.search.playlists = playlists || [];
        SearchService.searchTerm = txt;
      } catch (e) {
        console.log(e);
      }
    }

    this.stopLoading();
  }, 500, {leading: false, trailing: true});

  startLoading() {
    if (this.loadingComponent) {
      this.stopLoading();
    }

    this.loadingComponent = this.$buefy.loading.open({
      container: this.$refs.searchme,
    });
  }

  stopLoading() {
    this.loadingComponent.close();
  }

  prev() {
    const index = this.carousel - 1;

    if (index < 0) {
      this.carousel = 4;
    } else {
      this.carousel = index;
    }
  }

  next() {
    const index = this.carousel + 1;

    if (index > 4) {
      this.carousel = 0;
    } else {
      this.carousel = index;
    }
  }

  mounted() {
    if (SearchService.lastView > -1) {
      this.carousel = SearchService.lastView;
    } else {
      this.defaultView = getItemOrDefault('view', 'Artists');

      switch (this.defaultView) {
        case 'Albums':
          this.carousel = 1;
          break;
        case 'Genres':
          this.carousel = 2;
          break;
        case 'Playlists':
          this.carousel = 3;
          break;
        case 'Favorites':
          this.carousel = 4;
          break;
        case 'Artists':
        default:
          this.carousel = 0;
          break;
      }
    }

    this.getData();

    if (SearchService.searchTerm) {
      this.search = SearchService.searchTerm;
    }
  }

  gotoSettings() {
    this.$router.push({name: 'Settings'});
  }

  carouselChanged() {
    this.getData();
  }

  getData() {
    switch (this.carousel) {
      case 1:
        this.defaultView = 'Albums';
        SearchService.lastView = 1;
        if (!this.searchService.all_albums.length) {
          this.getAlbums();
        }
        break;
      case 2:
        this.defaultView = 'Genres';
        SearchService.lastView = 2;
        if (!this.searchService.all_genres.length) {
          this.getGenres();
        }
        break;
      case 3:
        this.defaultView = 'Playlists';
        SearchService.lastView = 3;
        if (!this.searchService.all_playlists.length) {
          this.getPlaylists();
        }
        break;
      case 4:
        this.defaultView = 'Favorites';
        SearchService.lastView = 4;
        if (!this.searchService.all_favorites.length) {
          this.getFavorites();
        }
        break;
      case 0:
      default:
        this.defaultView = 'Artists';
        SearchService.lastView = 0;
        if (!this.searchService.all_artists.length) {
          this.getArtists();
        }
        break;
    }
  }

  async getArtists() {
    this.startLoading();

    try {
      this.searchService.all_artists = await JellyfinService.getArtists();
    } catch (e) {
      console.log(e);
    } finally {
      this.stopLoading();
    }
  }

  async getAlbums() {
    this.startLoading();

    try {
      this.searchService.all_albums = await JellyfinService.getAlbums();
    } catch (e) {
      console.log(e);
    } finally {
      this.stopLoading();
    }
  }

  async getGenres() {
    this.startLoading();

    try {
      this.searchService.all_genres = await JellyfinService.getGenres();
    } catch (e) {
      console.log(e);
    } finally {
      this.stopLoading();
    }
  }

  async getPlaylists() {
    this.startLoading();

    try {
      this.searchService.all_playlists = await JellyfinService.getPlaylists();
    } catch (e) {
      console.log(e);
    } finally {
      this.stopLoading();
    }
  }

  async getFavorites() {
    this.startLoading();

    try {
      this.searchService.all_favorites = await JellyfinService.getFavorites();
    } catch (e) {
      console.log(e);
    } finally {
      this.stopLoading();
    }
  }

  playFavorites() {
    const songs = _.shuffle(_.cloneDeep(this.searchService.all_favorites));

    PlayerService.setQueue(songs);

    this.$buefy.toast.open({
      message: 'Starting favorites',
      type: 'is-success',
    });
  }
}

export default Search;
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

#searchArea > .loading-overlay {
  height: inherit;
  top: 115px;
}
</style>
