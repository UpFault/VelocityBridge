const minecraftCommand = require("../../contracts/minecraftCommand.js");
const hypixel = require("../../contracts/API/HypixelRebornAPI.js");
const config = require ("../../../config.json");
class EightBallCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "megawalls";
    this.aliases = ["mw"];
    this.description = "View the Megawalls stats of a player";
    this.isOnCooldown = false;
    this.options = [
      {
        name: "username",
        description: "Minecraft username",
        required: false,
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

      return;
      username = this.getArgs(message)[0] || username;

      const {
        stats: { megawalls },
      } = await hypixel.getPlayer(username);

      const { selectedClass = "None", finalKills, finalKDRatio, wins, WLRatio, kills, KDRatio, assists } = megawalls;

      this.send(
        `/gc ${username}'s Megawalls: Class: ${
          selectedClass ?? "None"
        } | FK: ${finalKills} | FKDR: ${finalKDRatio} | W: ${wins} | WLR: ${WLRatio} | K: ${kills} | KDR: ${KDRatio} | A: ${assists}`
      );
    } catch (error) {
      this.send(`/gc ${error.toString().replace("[hypixel-api-reborn] ", "")}`);
    }
  }
}

module.exports = EightBallCommand;
