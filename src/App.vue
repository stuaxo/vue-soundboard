<template>
  <div id="app">
    <SoundPlayer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SoundPlayer from "./components/SoundPlayer.vue";

export default defineComponent({
  components: {
    SoundPlayer,
  },
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  background-color: #282c34;
  margin-top: 10vh;
}
</style>
