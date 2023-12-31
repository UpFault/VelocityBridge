const { getLatestProfile } = require("../../../API/functions/getLatestProfile.js");
const { uploadImage } = require("../../contracts/API/imgurAPI.js");
const { decodeData, formatUsername } = require("../../contracts/helperFunctions.js");
const minecraftCommand = require("../../contracts/minecraftCommand.js");
const { renderLore } = require("../../contracts/renderItem.js");
const NodeCache = require("node-cache");
const config = require ("../../../config.json");
const cache = new NodeCache({ stdTTL: 604800 }); // 1 week in seconds

class RenderCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "render";
    this.aliases = ["inv", "i", "inventory", "i", "show"];
    this.description = "Renders item of specified user.";
    this.isOnCooldown = false;
    this.options = [
      {
        name: "username",
        description: "Minecraft username",
        required: false,
      },
      {
        name: "slot",
        description: "Slot number of item to render (1-36)",
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

      return;

      if (this.isOnCooldown) {
        return this.send(`/gc ${username} Command is on cooldown`);
      }

      this.isOnCooldown = true;

      setTimeout(() => {
        this.isOnCooldown = false;
      }, 30000);

      let itemNumber = 0;
      const arg = this.getArgs(message);
      if (!arg[0]) {
        this.send("/gc Wrong Usage: !render [name] [slot] | !render [slot]");
        return;
      }
      if (!isNaN(Number(arg[0]))) {
        itemNumber = arg[0];
        username = arg[1] || username;
      } else {
        username = arg[0];
        if (!isNaN(Number(arg[1]))) {
          itemNumber = arg[1];
        } else {
          this.send("/gc Wrong Usage: !render [name] [slot] | !render [slot]");
          return;
        }
      }

      let profile = cache.get(username);

      if (!profile) {
        profile = await getLatestProfile(username);
        cache.set(username, profile);
      }

      username = formatUsername(username, profile.profileData?.game_mode);

      if (profile.profile?.inv_contents?.data === undefined) {
        return this.send(`/gc This player has an Inventory API off.`);
      }

      const { i: inventoryData } = await decodeData(Buffer.from(profile.profile.inv_contents.data, "base64"));

      if (
        inventoryData[itemNumber - 1] === undefined ||
        Object.keys(inventoryData[itemNumber - 1] || {}).length === 0
      ) {
        return this.send(`/gc Player does not have an item at slot ${itemNumber}.`);
      }

      const Name = inventoryData[itemNumber - 1]?.tag?.display;
      const Lore = inventoryData[itemNumber - 1]?.tag?.display;

      const renderedItem = await renderLore(Name, Lore);

      const upload = await uploadImage(renderedItem);

      this.send(`/gc ${username}'s item at slot ${itemNumber}: ${upload.data.link}`);
    } catch (error) {
      this.send(`/gc Error: ${error}`);
    }
  }
}

module.exports = RenderCommand;
