<template>
  <div class="columns is-mobile is-centered">
    <div class="column is-three-quarters-mobile is-one-third-widescreen">
      <div class="logo">
        <img src="../assets/logo.png" width="150">
        <h1 class="title is-2">Jellyamp</h1>
      </div>
      <section v-if="!showUser">
        <b-field label="Server URL">
          <b-input
            v-model="serverUri"
            type="text"
            :use-html5-validation="false"
            placeholder="http://192.168.1.100:8096"
            @keyup.native.enter="checkServer"
          ></b-input>
        </b-field>
        <b-button
          type="is-primary"
          class="float-right"
          :loading="serverLoading"
          @click="checkServer"
        >Test Connection</b-button>
      </section>
      <section v-if="showUser">
        <b-field label="Username">
          <b-input v-model="username" type="text" @keyup.native.enter="login"></b-input>
        </b-field>
        <b-field label="Password">
          <b-input v-model="password" type="password" password-reveal @keyup.native.enter="login"></b-input>
        </b-field>
        <b-button type="is-primary" inverted outlined class="float-left" @click="showUser = false">Back</b-button>
        <b-button type="is-primary" class="float-right" :loading="isLoggingIn" @click="login">Login</b-button>
      </section>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';

import JellyfinService from '../services/jellyfin';

@Component({
  name: 'Login',
})
class Login extends Vue {
  serverUri = '';
  username = '';
  password = '';

  serverLoading = false;
  isLoggingIn = false;
  showUser = false;

  mounted() {
    this.serverUri = JellyfinService.getServer().uri;

    if (this.serverUri) {
      this.showUser = true;
    }
  }

  async checkServer() {
    if (this.serverLoading) {
      return;
    }

    this.serverLoading = true;

    try {
      await JellyfinService.checkServer(this.serverUri);

      this.$buefy.toast.open({
        message: 'Successfully connected',
        type: 'is-success',
      });

      this.showUser = true;
    } catch (e) {
      this.$buefy.toast.open({
        message: 'Could not connect to server',
        type: 'is-danger',
      });
    } finally {
      this.serverLoading = false;
    }
  }

  async login() {
    if (this.isLoggingIn) {
      return;
    }

    this.isLoggingIn = true;

    try {
      await JellyfinService.login(this.username, this.password);

      this.$buefy.toast.open({
        message: 'Successfully logged in',
        type: 'is-success',
      });

      this.$router.push({name: 'Main'});
    } catch (e) {
      this.$buefy.toast.open({
        message: 'Could not login. Check username and password',
        type: 'is-danger',
      });
    } finally {
      this.isLoggingIn = false;
    }
  }
}

export default Login;
</script>

<style scoped>
.float-right {
  float: right;
}

.float-left {
  float: left;
}

.logo {
  margin-top: 35px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 35px;
  text-align: center;
}
</style>
