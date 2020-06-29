import {Howl} from 'howler';

import Jellyfin from './jellyfin';

class Player {
  all_artists = [];
  playlist = [];
  index = null;
  player = null;
  search = {
    artists: [],
    albums: [],
    songs: [],
    genres: [],
  };

  // Make it a singleton
  constructor() {
    if (!Player.instance) {
      Player.instance = this;
    }

    return Player.instance;
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
      data.howl = new Howl({
        src: [Jellyfin.getItemPlayUrl(data.Id)],
        html5: true,
        format: ['aac'],
        onplay: () => {
          console.log('eyy lmao');
        },
        onend: () => {
          console.log('song ended! sukkafish');
          this.skip('next');
        },

      });
    }

    this.player = data.howl;

    this.player.play();
  }

  pause() {
    if (!this.player) {
      return;
    }

    this.player.pause();
  }

  seek(percentage) {
    if (!this.player) {
      return;
    }

    if (this.player.playing()) {
      this.player.seek(this.player.duration() * (percentage / 100));
    }
  }

  skip(dir) {
    let index = this.index;

    if (dir === 'next') {
      index = index + 1;
      if (index >= this.playlist.length) {
        this.player.stop();
      }
    } else {
      index = index - 1;
      if (index < 0) {
        this.player.stop();
      }
    }

    this.skipTo(index);
  }

  skipTo(index) {
    if (!this.player) {
      return;
    }

    this.player.stop();
    this.play(index);
  }
}

const PlayerService = new Player();

export default PlayerService;
