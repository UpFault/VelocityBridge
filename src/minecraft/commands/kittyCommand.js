const minecraftCommand = require("../../contracts/minecraftCommand.js");
const { uploadImage } = require("../../contracts/API/imgurAPI.js");
const axios = require("axios");
const config = require ("../../../config.json");

class KittyCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "kitty";
    this.aliases = ["cat", "cutecat"];
    this.description = "Random image of cute cat.";
    this.isOnCooldown = false;
    this.options = [];
  }

  async onCommand(username, message) {
    try {

      if (config.minecraft.commands.devMode) {
        if (username !== "UpFault") {
          return; 
        }
      }

      if (this.isOnCooldown) {
        return this.send(`/gc ${username} Command is on cooldown`);
      }

      this.isOnCooldown = true;

      setTimeout(() => {
        this.isOnCooldown = false;
      }, 30000);

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
