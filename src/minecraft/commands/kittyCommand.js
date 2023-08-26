const minecraftCommand = require("../../contracts/minecraftCommand.js");
const { uploadImage } = require("../../contracts/API/imgurAPI.js");
const axios = require("axios");
const commandCooldowns = new Map();
class KittyCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "kitty";
    this.aliases = ["cat", "cutecat"];
    this.description = "Random image of cute cat.";
    this.options = [];
  }

  async onCommand(username, message) {
    try {
      const currentTime = Date.now();
      const lastCommandTime = commandCooldowns.get(username);

      if (lastCommandTime !== undefined && currentTime - lastCommandTime < 30000) {
        this.send(`/gc Please wait a bit before using this command again.`);
        return;
      }

      const { data } = await axios.get(`https://api.thecatapi.com/v1/images/search`);

      if (data === undefined) {
        throw "An error occurred while fetching the image. Please try again later.";
      }

      const link = data[0].url;
      const upload = await uploadImage(link);

      this.send(`/gc Cute Cat: ${upload.data.link}`);

      // Update last command time for the user
      commandCooldowns.set(username, currentTime);
    } catch (error) {
      this.send(`/gc Error: ${error ?? "Something went wrong.."}`);
    }
  }
}

module.exports = KittyCommand;
