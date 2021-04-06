<template>
  <div class="columns is-mobile is-centered is-gapless">
    <div class="column max-width">
      <section class="top no-grab">
        <div>
          <div>
            <div class="level is-mobile">
              <div level-left style="display: inline-flex;">
                <div level-item @click="goBack()">
                  <b-tooltip label="Back" position="is-right">
                    <b-icon size="is-medium" icon="arrow-left" class="pointer"></b-icon>
                  </b-tooltip>
                </div>
                <p level-item class="title" style="padding-left: 10px;">Settings</p>
              </div>
            </div>
          </div>
          <div
            class="columns is-centered is-gapless no-grab scrolling-area"
            :style="`height: calc(100vh ${player.player ? '- 60px' : ''} - 120px ${isElectron ? '- 28px' : ''})`"
          >
            <div class="column">
              <b-field label="Quality" style="margin-top: 20px;">
                <b-select placeholder="Select a bitrate" v-model="quality" @input="bitrateChanged">
                  <option value="12444445">Unlimited</option>
                  <option value="320000">320 Kbps</option>
                  <option value="256000">256 Kbps</option>
                  <option value="128000">128 Kbps</option>
                </b-select>
              </b-field>
            </div>
            <div class="column">
              <b-field label="Default View" style="margin-top: 20px;">
                <b-select placeholder="Select a view" v-model="view" @input="viewChanged">
                  <option value="Artists">Artists</option>
                  <option value="Albums">Albums</option>
                  <option value="Genres">Genres</option>
                  <option value="Playlists">Playlists</option>
                  <option value="Favorites">Favorites</option>
                </b-select>
              </b-field>
            </div>
            <div class="column">
              <b-switch style="margin-top: 25px;" v-model="notifyOfUpdates" @input="toggleNotifyOfUpdates" type="is-success">Notify of updates</b-switch>
            </div>
            <div class="column">
              <b-button type="is-primary" @click="logout" style="margin-top: 50px;">Log out</b-button>
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
import _ from "lodash";

import {getItemOrDefault, setItem} from '../services/localstorage';
import JellyfinService from "../services/jellyfin";
import PlayerService from "../services/player";

@Component({
  name: "Settings",
})
export default class Settings extends Vue {
  isElectron = window.ipcRenderer ? true : false;
  quality = null;
  notifyOfUpdates = null;
  view = null;
  player = PlayerService;

  mounted() {
    this.quality = getItemOrDefault('bitrate', '12444445');
    this.notifyOfUpdates = getItemOrDefault('notify-of-updates', true);
    this.view = getItemOrDefault('view', 'Artists');
  }

  bitrateChanged() {
    setItem('bitrate', this.quality);
  }

  viewChanged() {
    setItem('view', this.view);
  }

  logout() {
    JellyfinService.logout();
  }

  toggleNotifyOfUpdates() {
    setItem('notify-of-updates', this.notifyOfUpdates);
  }

  goBack() {
    this.$router.go(-1);
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
