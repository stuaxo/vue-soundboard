<template>
  <div class="sound-player">
    <h1 class="sound-player-title">// SOUNDGRID</h1>
    <div class="sound-grid">
      <div
        v-for="{ file, key } in pads"
        :key="file"
        class="sound-button"
        :class="{ active: activeButtons[file] }"
        @click="playSound(file)"
      >
        <span class="key-hint">{{ key }}</span>
        <div class="sound-label">{{ removeExtension(file) }}</div>
      </div>

      <div
        v-for="index in inactiveButtonCount"
        :key="index"
        class="sound-button inactive"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
// audioList is updated by running yarn update-audio-list
import audioList from "@/assets/audioList";

const HOME_ROW = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];

let audioContext: AudioContext | null = null;
// Stores Promise<AudioBuffer> so rapid double-clicks await the same fetch
// rather than racing to start a second one.
const audioBufferCache = new Map<string, Promise<AudioBuffer>>();
const activeButtons = ref<Record<string, boolean>>({});

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    // Lazy init satisfies browser autoplay policy — AudioContext must be
    // created inside a user gesture handler, not on mount.
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioContext = new AudioCtx();
  }
  return audioContext;
};

const fetchAndDecode = (
  file: string,
  ctx: AudioContext,
): Promise<AudioBuffer> => {
  if (!audioBufferCache.has(file)) {
    const p = fetch(`${import.meta.env.BASE_URL}sounds/${file}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then((buf) => ctx.decodeAudioData(buf));
    audioBufferCache.set(file, p);
  }
  return audioBufferCache.get(file)!;
};

const removeExtension = (filename: string): string =>
  filename.replace(/\.[^.]+$/, "");

const playSound = async (audioFile: string) => {
  const ctx = getAudioContext();

  // Flash immediately — visual feedback is decoupled from audio duration.
  activeButtons.value[audioFile] = true;
  setTimeout(() => delete activeButtons.value[audioFile], 150);

  try {
    const buffer = await fetchAndDecode(audioFile, ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (err) {
    console.error(`Failed to play ${audioFile}:`, err);
  }
};

const pads = audioList.map((file, i) => ({ file, key: HOME_ROW[i] }));
const keyToFile = Object.fromEntries(pads.map(({ file, key }) => [key, file]));

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  const file = keyToFile[e.key.toLowerCase()];
  if (file) playSound(file);
};

onMounted(() => window.addEventListener("keydown", handleKeyDown));
onUnmounted(() => window.removeEventListener("keydown", handleKeyDown));

const audioFiles = audioList;

const inactiveButtonCount = computed(() => {
  const nearestSquare = Math.ceil(Math.sqrt(audioFiles.length));
  return nearestSquare * nearestSquare - audioFiles.length;
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
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    "Open Sans",
    "Helvetica Neue",
    sans-serif;
  font-size: 24px;
  margin-bottom: 0;
  text-align: right;
  color: #ec9163cc;
  width: 100%;
}

.sound-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  max-width: 800px;
  margin-top: 20px;
}

.sound-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Light grey rubber — close to original #d6d6d6 with slight translucency */
  background-color: rgba(214, 214, 214, 0.96);
  border-radius: 6px;
  cursor: pointer;
  height: 200px;
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  /* Fade out — on the base element so it applies when .active is removed */
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.sound-button:hover {
  background-color: rgba(242, 242, 242, 0.98);
}

.sound-button.active {
  background-color: rgba(224, 220, 216, 0.96);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.35),
    0 0 20px rgba(200, 84, 0, 0.75),
    inset 0 0 18px rgba(200, 84, 0, 0.35);
  /* No transition on the way in — light snaps on instantly */
  transition: none;
}

.sound-button.inactive {
  /* Same rubber, no backlight — darker but same family as populated buttons */
  background-color: rgba(160, 158, 155, 0.92);
  cursor: default;
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.sound-button ::selection {
  background-color: transparent;
  color: inherit;
}

.key-hint {
  position: absolute;
  top: 10px;
  left: 12px;
  font-size: 13px;
  font-weight: 400;
  text-transform: uppercase;
  color: #999;
  user-select: none;
}

.sound-button.active .key-hint {
  color: #b86020;
}

.sound-label {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #888;
  user-select: none;
}

.sound-button.active .sound-label {
  color: #b86020;
}
</style>
