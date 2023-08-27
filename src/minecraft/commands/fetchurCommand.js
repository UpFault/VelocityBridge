const minecraftCommand = require("../../contracts/minecraftCommand.js");
const { getFetchur } = require("../../../API/functions/getFetchur.js");
const config = require ("../../../config.json");
class FetchurCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "fetchur";
    this.aliases = [];
    this.description = "Information about an item for Fetchur.";
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

      const { text } = getFetchur();

      this.send(`/gc Fetchur Requests: ${text}`);
    } catch (error) {
      this.send(`/gc Error: ${error || "Something went wrong.."}`);
    }
  }
}

module.exports = FetchurCommand;
