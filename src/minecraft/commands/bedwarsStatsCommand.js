const minecraftCommand = require("../../contracts/minecraftCommand.js");
const hypixel = require("../../contracts/API/HypixelRebornAPI.js");
const { capitalize } = require("../../contracts/helperFunctions.js");
const config = require ("../../../config.json");
class BedwarsCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "bedwars";
    this.aliases = ["bw", "bws"];
    this.description = "BedWars stats of specified user.";
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
      const msg = this.getArgs(message).map((arg) => arg.replaceAll("/", ""));
      const modes = ["solo", "doubles", "threes", "fours", "4v4"];

      const mode = modes.includes(msg[0]) ? msg[0] : "overall";
      username = modes.includes(msg[0]) ? msg[1] : msg[0] || username;

      const player = await hypixel.getPlayer(username);

      if (["overall", "all"].includes(mode)) {
        const { level, finalKills, finalKDRatio, wins, WLRatio, winstreak } = player.stats.bedwars;
        const { broken, BLRatio } = player.stats.bedwars.beds;

        this.send(
          `/gc [${level}✫] ${
            player.nickname
          } FK: ${finalKills.toLocaleString()} FKDR: ${finalKDRatio} W: ${wins} WLR: ${WLRatio} BB: ${broken} BLR: ${BLRatio} WS: ${winstreak}`
        );
      } else if (mode !== undefined) {
        const { level } = player.stats.bedwars;
        const { finalKills, finalKDRatio, wins, WLRatio, winstreak } = player.stats.bedwars[mode];
        const { broken, BLRatio } = player.stats.bedwars[mode].beds;

        this.send(
          `/gc [${level}✫] ${player.nickname} ${capitalize(
            mode
          )} FK: ${finalKills.toLocaleString()} FKDR: ${finalKDRatio} Wins: ${wins} WLR: ${WLRatio} BB: ${broken} BLR: ${BLRatio} WS: ${winstreak}`
        );
      } else {
        this.send("/gc Invalid mode. Valid modes: overall, solo, doubles, threes, fours, 4v4");
      }
    } catch (error) {
      this.send(`/gc ${error.toString().replace("[hypixel-api-reborn] ", "")}`);
    }
  }
}

module.exports = BedwarsCommand;
