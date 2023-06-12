const fs = require("fs");

const audioFiles = fs
  .readdirSync("./public/sounds")
  .filter((file) => file.endsWith(".wav"));
const audioList = audioFiles.map((file) => `"${file}"`).join(",\n");

fs.writeFileSync(
  "./src/assets/audioList.js",
  `export default [\n${audioList}\n];`
);
