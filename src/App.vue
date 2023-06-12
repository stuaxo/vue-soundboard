<template>
  <div id="app">
    <SoundBoard />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SoundBoard from "./components/SoundBoard.vue";

export default defineComponent({
  components: {
    SoundBoard,
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
