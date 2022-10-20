/* eslint-disable no-param-reassign */
/* eslint-disable object-curly-spacing */
import {Howl, Howler} from 'howler';
import Vue from 'vue';
import _ from 'lodash';

import JellyfinService from './jellyfin';
import Notifications from './notifications';

import placeholderImg from '../assets/logo.png';

const ticksInSecond = 10000000;
const microSecondsinSecond = 1000000;
const ticksInMs = 10;

Vue.filter('duration', value => {
  if (!value) {
    value = 0;
  }

  const minutes = Math.floor(value / 60) || 0;
  const seconds = Math.round((value - minutes * 60) || 0);

  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
});

class Player {
  queue = [];
  index = null;
  player = null;
  viewModel = null;
  showQueue = false;
  playing = true;
  repeat = null;
  numErrors = 0;

  errorIndex = -1;
  lastPrev = -1;

  updateProgress = _.throttle(ticks => {
    const data = {
      IsPaused: false,
      PositionTicks: ticks,
      PlayMethod: 'Transcode',
      PlaySessionId: this.queue[this.index].params.PlaySessionId,
      ItemId: this.queue[this.index].Id,
      EventName: 'timeupdate',
    };

    JellyfinService.updateProgress(data);
  }, 10000);

  updateProgressMpris = _.throttle(seconds => {
    if (window.ipcRenderer) {
      window.ipcRenderer.send('updateTime', seconds * microSecondsinSecond); // seconds to microseconds
    }

    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      // Sometimes there is a race condition on skip where the position is greater than the duration
      try {
        navigator.mediaSession.setPositionState({
          duration: this.queue[this.index].duration,
          playbackRate: 1,
          position: seconds,
        });
      } catch {}
    }
  }, 1000, {leading: false, trailing: true});

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
    this.queue[this.index].howl = null;
  }

  changeVolume(val) {
    Howler.volume(val / 100);
  }

  setQueue(queue) {
    if (this.player) {
      this.player.stop();
      this.player = null;
    }

    Howler.stop();

    this.queue = _.map(queue, (item, index) => {
      const songUrl = JellyfinService.getItemImageUrl(item);
      item.thumbnailImage = songUrl || placeholderImg;

      item.artist = item.Artists[0] || item.AlbumArtist;
      item.loved = item.UserData.IsFavorite || false;
      item.duration = Math.floor(item.RunTimeTicks / ticksInSecond);

      // Preload the first 3 items in the queue
      if (index < 3) {
        item.howl = this.createHowl(item);
      }

      return item;
    });

    this.play(0);
  }

  injectQueue(queue) {
    const updateQueue = _.map(queue, item => {
      const songUrl = JellyfinService.getItemImageUrl(item);
      item.thumbnailImage = songUrl || placeholderImg;

      item.artist = item.Artists[0] || item.AlbumArtist;
      item.loved = item.UserData.IsFavorite || false;
      item.duration = Math.floor(item.RunTimeTicks / ticksInSecond);

      return item;
    });

    if (this.index === this.queue.length - 1) {
      this.queue = [...this.queue, ...updateQueue];
    } else {
      this.queue.splice(this.index + 1, 0, ...queue);
    }
  }

  addToQueue(queue) {
    const updateQueue = _.map(queue, item => {
      const songUrl = JellyfinService.getItemImageUrl(item);
      item.thumbnailImage = songUrl || placeholderImg;

      item.artist = item.Artists[0] || item.AlbumArtist;
      item.loved = item.UserData.IsFavorite || false;
      item.duration = Math.floor(item.RunTimeTicks / ticksInSecond);

      return item;
    });

    this.queue = [...this.queue, ...updateQueue];
  }

  removeItem(index) {
    this.queue.splice(index, 1);

    if (index < this.index) {
      this.index -= 1;
    }
  }

  async likeItem() {
    if (!this.player) {
      return;
    }

    try {
      if (this.queue[this.index].loved) {
        await JellyfinService.unlikeId(this.queue[this.index].Id);
        this.queue[this.index].loved = false;
      } else {
        await JellyfinService.likeId(this.queue[this.index].Id);
        this.queue[this.index].loved = true;
      }
    } catch (e) {
      console.log('error liking item: ', e);
    }
  }

  createHowl(item) {
    const [url, params] = JellyfinService.getItemPlayUrl(item.Id);
    item.params = params;

    const howl = new Howl({
      src: [url],
      html5: true,
      preload: 'metadata',
      format: ['aac'],
      onplay: () => {
        this.playing = true;

        if (this.viewModel && this.viewModel.$el) {
          const images = this.viewModel.$el.querySelectorAll('.update-img');
          images.forEach((image, index) => {
            image.setAttribute('src', this.queue[this.index].thumbnailImage);

            if (this.queue[this.index].thumbnailImage === placeholderImg && index === 0) {
              image.removeAttribute('src');
            }
          });
        }

        JellyfinService.updatePlaying({
          IsPaused: false,
          PositionTicks: 0,
          PlayMethod: 'Transcode',
          PlaySessionId: item.params.PlaySessionId,
          ItemId: item.Id,
        });

        requestAnimationFrame(() => this.step());

        if (window.ipcRenderer) {
          const data = {
            name: item.Name,
            artist: item.Artists,
            album: item.Album,
            img: item.thumbnailImage,
            duration: Math.floor(item.RunTimeTicks / ticksInMs), // nanoseconds to microseconds
          };

          window.ipcRenderer.send('play', data);
        }

        if ('mediaSession' in navigator) {
          // eslint-disable-next-line no-undef
          navigator.mediaSession.metadata = new MediaMetadata({
            title: item.Name,
            artist: item.Artists,
            album: item.Album,
            artwork: [{ src: item.thumbnailImage }],
          });

          navigator.mediaSession.playbackState = 'playing';

          if ('setPositionState' in navigator.mediaSession) {
            navigator.mediaSession.setPositionState({
              duration: Math.floor(item.RunTimeTicks / ticksInSecond),
            });
          }
        }
      },
      onend: () => {
        if (this.repeat === 1) { // Single song repeat
          this.play(this.index);
        } else if (this.index + 1 === this.queue.length) { // Last song in queue
          if (this.repeat === 2) { // Repeat all
            this.play(0);
          } else { // Don't nuke queue after it ends
            this.play(0, false);
          }
        } else {
          this.skip('next');
        }

        JellyfinService.stopPlaying({
          IsPaused: false,
          PlayMethod: 'Transcode',
          PositionTicks: item.progressInTicks,
          PlaySessionId: item.params.PlaySessionId,
          ItemId: item.Id,
        });
      },
      onpause: () => {
        this.playing = false;

        if (window.ipcRenderer) {
          window.ipcRenderer.send('pause');
        }

        if ('mediaSession' in navigator) {
          setTimeout(() => {
            navigator.mediaSession.playbackState = 'paused';
          });
        }
      },
      onseek: () => {
        // Just make sure seek takes off eventually
        // Can get stuck after something is buffering
        // eslint-disable-next-line no-plusplus
        for (let a = 1; a <= 100; a++) {
          _.delay(() => this.step(), 250 * a);
        }
      },
      onstop: () => {
        this.playing = false;

        if (window.ipcRenderer) {
          window.ipcRenderer.send('stop');
        }

        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'none';
        }

        JellyfinService.stopPlaying({
          IsPaused: false,
          PlayMethod: 'Transcode',
          PositionTicks: item.progressInTicks,
          PlaySessionId: item.params.PlaySessionId,
          ItemId: item.Id,
        });
      },
      onloaderror: err => {
        console.log('onloaderror: ', err);

        Notifications.throttle({
          duration: 5000,
          message: 'Playback failed.',
          position: 'is-top',
          type: 'is-danger',
        });

        this.numErrors += 1;

        if (this.numErrors < 3) {
          if (!this.errorIndex) {
            this.errorIndex = this.index;
          }
          this.skip('next');
        }
      },
      onplayerror: err => {
        console.log('onplayerror: ', err);

        Notifications.throttle({
          duration: 5000,
          message: 'Could not play song.',
          position: 'is-top',
          type: 'is-danger',
        });

        this.skip('next');
      },
    });

    return howl;
  }

  play(index, autoPlay = true) {
    if (!this.queue.length || index < 0 || index >= this.queue.length) {
      return;
    }

    if (this.player) {
      this.player.stop();
    }

    this.index = index;
    const data = this.queue[index];

    if (!data.howl) {
      data.howl = this.createHowl(data);
    }

    this.player = data.howl;

    if (autoPlay) {
      this.player.play();
    }
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
      this.player.seek(this.queue[this.index].duration * (percentage / 100));
    }
  }

  step() {
    if (!this.player) {
      return;
    }

    const seek = this.player.seek() || 0;

    if (this.viewModel && seek) {
      this.viewModel.currentPlayTime = Math.round(seek);
      this.viewModel.currentProgress = ((seek / this.queue[this.index].duration) * 100) || 0;
    }

    if (this.player.playing()) {
      // requestAnimationFrame(() => this.step()); // This binds up the CPU
      setTimeout(() => this.step(), 250);

      const ticks = Math.round(seek * ticksInSecond);

      this.queue[this.index].progressInTicks = ticks;
      this.updateProgress(ticks);
      this.updateProgressMpris(seek);
    }
  }

  handleRepeat() {
    if (!this.repeat) {
      this.repeat = 1;
    } else if (this.repeat === 1) {
      this.repeat = 2;
    } else {
      this.repeat = null;
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
    let {index} = this;

    if (dir === 'next') {
      if (this.repeat === 1) {
        this.repeat = null;
      }

      index += 1;

      if (index >= this.queue.length) {
        index = this.queue.length - 1;
        this.skipTo(0, false);
      } else {
        this.skipTo(index);
      }
    } else {
      index -= 1;

      if (index < 0) {
        // Don't nuke playlist when you hit back on the first item in queue
        index = this.index;
      }

      this.skipTo(index);
    }
  }

  skipTo(index, autoPlay = true) {
    if (!this.player) {
      return;
    }

    this.clearHowl();
    this.play(index, autoPlay);
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

if ('mediaSession' in navigator) {
  navigator.mediaSession.playbackState = 'none';

  const actionHandlers = [
    ['play', () => PlayerService.playPause()],
    ['pause', () => PlayerService.playPause()],
    ['previoustrack', () => PlayerService.handleBack()],
    ['nexttrack', () => PlayerService.skip('next')],
    ['stop', () => PlayerService.stop()],
    // ['seekto', (details) => { /* ... */ }],
  ];

  actionHandlers.forEach(([action, handler]) => {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch (error) {
      console.log(`The media session action "${action}" is not supported yet.`);
    }
  });
}

window.PlayerService = PlayerService;
