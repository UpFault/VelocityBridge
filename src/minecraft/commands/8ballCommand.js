const minecraftCommand = require("../../contracts/minecraftCommand.js");
const axios = require("axios");
const config = require ("../../../config.json");
class EightBallCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "8ball";
    this.aliases = ["8b"];
    this.description = "Ask an 8ball a question.";
    this.isOnCooldown = false;
    this.options = [
      {
        name: "question",
        description: "The question you want to ask the 8ball",
        required: true,
      },
    ];
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

      if (this.getArgs(message).length === 0) {
        // eslint-disable-next-line no-throw-literal
        throw "You must provide a question.";
      }

      const { data } = await axios.get(`https://www.eightballapi.com/api`);

      this.send(`/gc ${data.reading}`);
    } catch (error) {
      this.send(`/gc Error: ${error}`);
    }
  }
}

module.exports = EightBallCommand;
