import {Howl, Howler} from 'howler';
import Vue from 'vue';
import _ from 'lodash';

import JellyfinService from './jellyfin';

import placeholderImg from '../assets/logo.png';
import { isPlaybackStatusValid } from 'mpris-service/dist/constants';

Vue.filter('duration', value => {
  if (!value) {
    value = 0;
  }

  const minutes = Math.floor(value / 60) || 0;
  const seconds = Math.round((value - minutes * 60) || 0);

  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
});

class Player {
  playlist = [];
  index = null;
  player = null;
  viewModel = null;
  showPlaylist = false;
  playing = true;

  lastPrev = -1;

  // Make it a singleton
  constructor() {
    if (!Player.instance) {
      Player.instance = this;
    }

    return Player.instance;
  }

  clearHowl() {
    this.player.unload();
    this.player = null;
    this.playlist[this.index].howl = null;
  }

  setPlaylist(playlist) {
    if (this.player) {
      this.player.stop();
      this.player = null;
    }

    Howler.stop();

    this.playlist = _.map(playlist, (item, index) => {
      const songUrl = JellyfinService.getItemImageUrl(item);
      item.thumbnailImage = songUrl ? songUrl : placeholderImg;

      // Preload the first 3 items in the playlist
      if (index < 3) {
        item.howl = this.createHowl(item);
      }

      return item;
    });

    this.play(0);
  }

  injectPlaylist(playlist) {
    const updatePlaylist = _.map(playlist, item => {
      const songUrl = JellyfinService.getItemImageUrl(item);
      item.thumbnailImage = songUrl ? songUrl : placeholderImg;

      return item;
    });

    if (this.index === this.playlist.length - 1) {
      this.playlist = [...this.playlist, ...updatePlaylist];
    } else {
      this.playlist.splice(this.index + 1, 0, ...playlist);
    }
  }

  removeItem(index) {
    this.playlist.splice(index, 1);
  }

  createHowl(item) {
    const howl = new Howl({
      src: [JellyfinService.getItemPlayUrl(item.Id)],
      html5: true,
      format: ['aac'],
      onplay: () => {
        this.playing = true;

        if (this.viewModel && this.viewModel.$el) {
          const images = this.viewModel.$el.querySelectorAll('.update-img');
          images.forEach((image, index) => {
            image.setAttribute('src', this.playlist[this.index].thumbnailImage);

            if (this.playlist[this.index].thumbnailImage === placeholderImg && index === 0) {
              image.removeAttribute('src');
            }
          });
        }

        requestAnimationFrame(() => this.step());

        if (window.ipcRenderer) {
          const data = {
            name: item.Name,
            artist: item.Artists,
            album: item.Album,
            img: item.thumbnailImage,
          };

          window.ipcRenderer.send('play', data);
        }
      },
      onend: () => {
        this.skip('next');
      },
      onpause: () => {
        this.playing = false;

        if (window.ipcRenderer) {
          window.ipcRenderer.send('pause');
        }
      },
      onstop: () => {
        this.playing = false;

        if (window.ipcRenderer) {
          window.ipcRenderer.send('stop');
        }
      },
      onloaderror: err => {
        console.log(err);
        if (this.viewModel) {
          this.viewModel.$buefy.toast.open({
            message: 'Playback failed.',
            type: 'is-danger'
          });
        }

        this.skip('next');
      },
      onplayerror: err => {
        console.log(err);
        if (this.viewModel) {
          this.viewModel.$buefy.toast.open({
            message: 'Could not play song.',
            type: 'is-danger'
          });
        }

        this.skip('next');
      }
    });

    return howl;
  }

  play(index) {
    if (!this.playlist.length || index < 0 || index >= this.playlist.length) {
      return;
    }

    if (this.player) {
      this.player.stop();
    }

    this.index = index;
    const data = this.playlist[index];

    if (!data.howl) {
      data.howl = this.createHowl(data);
    }

    this.player = data.howl;

    this.player.play();
  }

  playPause() {
    if (!this.player) {
      return;
    }

    if (this.playing) {
      this.player.pause();
    } else {
      this.player.play();
    }
  }

  stop() {
    if (!this.player) {
      return;
    }

    Howler.stop();
  }

  seek(percentage) {
    if (!this.player) {
      return;
    }

    if (this.player.playing()) {
      this.player.seek(this.player.duration() * (percentage / 100));
    }
  }

  step() {
    if (!this.player) {
      return;
    }

    const seek = this.player.seek() || 0;

    if (this.viewModel && seek) {
      this.viewModel.currentPlayTime = Math.round(seek);
      this.viewModel.currentProgress = ((seek / this.player.duration()) * 100) || 0;
    }

    if (this.player.playing()) {
      // requestAnimationFrame(() => this.step()); // This binds up the CPU
      setTimeout(() => this.step(), 250);

      // if (window.ipcRenderer) {
      //   _.defer(() => window.ipcRenderer.send('updateTime', Math.floor(seek * 10000)));
      // }
    }
  }

  handleBack() {
    if (!this.player) {
      return;
    }

    const seek = this.player.seek() || 0;

    if (seek < 5 && this.lastPrev === this.index) {
      this.skip('prev');
    }

    this.lastPrev = this.index;
    this.seek(0);
  }

  skip(dir) {
    let index = this.index;

    if (dir === 'next') {
      index = index + 1;
      if (index >= this.playlist.length) {
        this.clearHowl();
      }
    } else {
      index = index - 1;
      if (index < 0) {
        this.clearHowl();
      }
    }

    this.skipTo(index);
  }

  skipTo(index) {
    if (!this.player) {
      return;
    }

    this.clearHowl();
    this.play(index);
  }
}

const PlayerService = new Player();

export default PlayerService;

// MPRIS event listeners
if (window.ipcRenderer) {
  window.ipcRenderer.on('skip', () => {
    PlayerService.skip('next');
  });

  window.ipcRenderer.on('prev', () => {
    PlayerService.handleBack();
  });

  window.ipcRenderer.on('playPause', () => {
    PlayerService.playPause();
  });

  window.ipcRenderer.on('stop', () => {
    PlayerService.stop();
  });
}

console.log(PlayerService);
