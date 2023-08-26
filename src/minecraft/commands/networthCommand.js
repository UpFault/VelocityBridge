const minecraftCommand = require("../../contracts/minecraftCommand.js");
const { getNetworth } = require("skyhelper-networth");
const { getLatestProfile } = require("../../../API/functions/getLatestProfile.js");
const { formatNumber, formatUsername } = require("../../contracts/helperFunctions.js");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 604800 }); // 1 week in seconds
const commandCooldowns = new Set();

class NetWorthCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "networth";
    this.aliases = ["nw"];
    this.description = "Networth of specified user.";
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
      if (commandCooldowns.has(username)) {
        this.send(`/gc Please wait a bit before using this command again.`);
        return;
      }

      commandCooldowns.add(username);
      setTimeout(() => {
        commandCooldowns.delete(username);
      }, 15000); // 15 seconds in milliseconds

      username = this.getArgs(message)[0] || username;

      let data = cache.get(username);

      if (!data) {
        data = await getLatestProfile(username, { museum: true });
        cache.set(username, data);
      }

      username = formatUsername(username, data.profileData?.game_mode);

      const profile = await getNetworth(data.profile, data.profileData?.banking?.balance || 0, {
        cache: true,
        onlyNetworth: true,
        museumData: data.museum,
      });

      if (profile.noInventory === true) {
        return this.send(`/gc ${username} has an Inventory API off!`);
      }

      const networth = formatNumber(profile.networth);
      const unsoulboundNetworth = formatNumber(profile.unsoulboundNetworth);
      const purse = formatNumber(profile.purse);
      const bank = profile.bank ? formatNumber(profile.bank) : "N/A";
      const museum = data.museum ? formatNumber(profile.types.museum?.total ?? 0) : "N/A";

      this.send(
        `/gc ${username}'s Networth is ${networth} | Unsoulbound Networth: ${unsoulboundNetworth} | Purse: ${purse} | Bank: ${bank} | Museum: ${museum}`
      );
    } catch (error) {
      console.log(error);
      this.send(`/gc ERROR: ${error}`);
    }
  }
}

module.exports = NetWorthCommand;
