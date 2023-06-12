<template>
  <div class="sound-player">
    <h1 class="sound-player-title">// SOUNDGRID</h1>
    <div class="sound-grid">
      <div
        v-for="audioFile in audioFiles"
        :key="audioFile"
        class="sound-button"
        @click="playSound(audioFile)"
      >
        <div class="sound-label">{{ removeExtension(audioFile) }}</div>
      </div>

      <!-- Fill in the rest of the grid with blank buttons -->
      <div
        v-for="index in inactiveButtonCount"
        :key="index"
        class="sound-button inactive"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
// audioList is updated by running npm run update-audio-list
import audioList from "@/assets/audioList";

export default defineComponent({
  setup() {
    const audioContext = ref<AudioContext | null>(null);
    const audioBuffers = ref<Record<string, AudioBuffer | null>>({});

    const loadSound = async (
      audioFile: string
    ): Promise<AudioBuffer | null> => {
      const response = await fetch(`/sounds/${audioFile}`);
      const arrayBuffer = await response.arrayBuffer();
      return audioContext.value?.decodeAudioData(arrayBuffer) || null;
    };

    const removeExtension = (filename: string): string => {
      return filename.replace(/\.[^.]+$/, "");
    };

    const playSound = async (audioFile: string) => {
      if (!audioBuffers.value[audioFile]) {
        audioBuffers.value[audioFile] = await loadSound(audioFile);
      }

      const audioBuffer = audioBuffers.value[audioFile];
      if (audioContext.value && audioBuffer) {
        const source = audioContext.value.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.value.destination);
        source.start(0);
      }
    };

    const initializeAudioContext = () => {
      try {
        audioContext.value = new AudioContext();
      } catch (error) {
        console.error("Error initializing audio context:", error);
      }
    };

    initializeAudioContext();

    const audioFiles = ref(audioList);

    const inactiveButtonCount = computed(() => {
      const audioFileCount = audioFiles.value.length;
      const nearestSquare = Math.ceil(Math.sqrt(audioFileCount));
      return nearestSquare * nearestSquare - audioFileCount;
    });

    return {
      playSound,
      audioFiles: audioList,
      removeExtension,
      inactiveButtonCount,
    };
  },
});
</script>

<style scoped>
.sound-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: rgb(197, 85, 0);
  width: fit-content;
  margin: 0 auto;
  border-radius: 8px;
}

.sound-player-title {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-size: 24px;
  margin-bottom: 0px;
  text-align: right;
  color: #ec9163cc;
  width: 100%;
}
.sound-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 20px;
  max-width: 800px;
  margin-top: 20px;
}

.sound-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #d6d6d6;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  height: 200px;
}

.sound-button ::selection {
  /* Prevents highlight on click */
}

.sound-button:hover {
  background-color: #f2f2f2;
}

.sound-button.inactive {
  background-color: #f0b598cc;
  cursor: not-allowed;
}

.sound-label {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 16px;
  font-weight: light;
  color: #777;
}
</style>
