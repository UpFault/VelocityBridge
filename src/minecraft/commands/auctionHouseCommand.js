const config = require("../../../config.json");
const { addCommas, timeSince } = require("../../contracts/helperFunctions.js");
const minecraftCommand = require("../../contracts/minecraftCommand.js");
const { renderLore } = require("../../contracts/renderItem.js");
const getRank = require("../../../API/stats/rank.js");
const axios = require("axios");
const { getUUID } = require("../../contracts/API/PlayerDBAPI.js");
const { uploadImage } = require("../../contracts/API/imgurAPI.js");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 604800 }); // 1 week in seconds

class AuctionHouseCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "auction";
    this.aliases = ["ah", "auctions"];
    this.description = "Listed Auctions of specified user.";
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

      username = this.getArgs(message)[0] || username;

      let string = "";

      const uuid = await getUUID(username);

      let data = cache.get(uuid);

      if (!data) {
        const { hypixelAPIkey } = config.minecraft.API;
        const [auctionResponse, playerResponse] = await Promise.all([
          axios.get(`https://api.hypixel.net/skyblock/auction?key=${hypixelAPIkey}&player=${uuid}`),
          axios.get(`https://api.hypixel.net/player?key=${hypixelAPIkey}&uuid=${uuid}`),
        ]);

        data = { auctions: auctionResponse.data?.auctions || [], player: playerResponse.data?.player || {} };
        cache.set(uuid, data);
      }

      const auctions = data.auctions;
      const player = data.player;

      if (auctions.length === 0) {
        return this.send(`/gc This player has no active auctions.`);
      }

      const activeAuctions = auctions.filter((auction) => auction.end >= Date.now());

      for (const auction of activeAuctions) {
        const lore = auction.item_lore.split("\n");

        lore.push("§8§m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯", `§7Seller: ${getRank(player)} ${player.displayname}`);

        if (auction.bin === undefined) {
          if (auction.bids.length === 0) {
            lore.push(`§7Starting Bid: §6${addCommas(auction.starting_bid)} coins`, `§7`);
          } else if (auction.bids.length > 0) {
            const bidderUUID = auction.bids[auction.bids.length - 1].bidder;

            let bidderData = cache.get(bidderUUID);

            if (!bidderData) {
              const bidderResponse = await axios.get(
                `https://api.hypixel.net/player?key=${hypixelAPIkey}&uuid=${bidderUUID}`
              );

              bidderData = bidderResponse.data?.player || {};
              cache.set(bidderUUID, bidderData);
            }

            const bidder = bidderData;

            if (bidder === undefined) {
              throw `Failed to get bidder for auction ${auction.uuid}`;
            }

            const { amount } = auction.bids[auction.bids.length - 1];
            const bidOrBids = auction.bids.length === 1 ? "bids" : "bid";

            lore.push(
              `§7Bids: §a${auction.bids.length} ${bidOrBids}`,
              `§7`,
              `§7Top Bid: §6${amount.toLocaleString()} coins`,
              `§7Bidder: ${getRank(bidder)} ${bidder.displayname}`,
              `§7`
            );
          }
        } else {
          lore.push(`§7Buy it now: §6${auction.starting_bid.toLocaleString()} coins`, `§7`);
        }

        lore.push(`§7Ends in: §e${timeSince(auction.end)}`, `§7`, `§eClick to inspect`);

        const renderedItem = await renderLore(` ${auction.item_name}`, lore);
        const upload = await uploadImage(renderedItem);

        string += string === "" ? upload.data.link : " | " + upload.data.link;
      }

      this.send(`/gc ${`${username}'s Active Auctions: ${string}`}`);
    } catch (error) {
      console.log(error);
      this.send(`/gc [ERROR] ${error}`);
    }
  }
}

module.exports = AuctionHouseCommand;
