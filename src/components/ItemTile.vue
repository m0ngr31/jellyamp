<template>
  <div class="column is-half-mobile is-1-tablet item-title pointer" @click="gotoItem">
    <img src="../assets/logo.png" loading="lazy" class="logo" width="185" height="185">
    <p class="subtitle is-6 item-name" v-if="!disableClick">{{ item.Name }}</p>
  </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';

import JellyfinService from '../services/jellyfin';

@Component({
  name: 'ItemTile',
  props: {
    item: {
      type: Object,
      required: true,
    },
    itemType: {
      type: String,
      required: true,
    },
    disableClick: {
      type: Boolean,
      required: false,
    },
  },
})
class ItemTile extends Vue {
  mounted() {
    const itemUrl = JellyfinService.getItemImageUrl(this.item);

    if (itemUrl) {
      this.$el.children[0].setAttribute('src', itemUrl);
    }
  }

  gotoItem() {
    if (this.disableClick) {
      return;
    }
    if (this.itemType === 'artist') {
      this.$router.push({ name: 'Artist', params: { id: this.item.Id }});
    } else if (this.itemType === 'song') {
      this.$router.push({ name: 'Song', params: { id: this.item.Id }});
    } else if (this.itemType === 'album') {
      this.$router.push({ name: 'Album', params: { id: this.item.Id }});
    } else if (this.itemType === 'playlist') {
      this.$router.push({ name: 'Playlist', params: { id: this.item.Id }});
    } else if (this.itemType === 'genre') {
      this.$router.push({ name: 'Genre', params: { id: this.item.Id }});
    }
  }
}

export default ItemTile;
</script>

<style scoped>
.item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logo {
  max-width: 185px;
  max-height: 185px;
  min-width: 185px;
  min-height: 185px;
}
</style>

<style>
.columns.is-gapless > .column .item-title {
  padding: 5px 5px 5px 0px !important;
  text-align: center;
  margin-top: auto;
}
</style>
