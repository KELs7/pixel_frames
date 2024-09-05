import fs from "fs";
import BN from "bignumber.js";
import util from "util";

//store states from con_pixel_frames_info

export const creatNewThing = async (db, processedResult) => {
  const uid = processedResult.uid;
  //let blacklist = JSON.parse(fs.readFileSync("./blacklist.json", "utf8"));

  let exists = await db.models.PixelFrame.findOne({ uid });
  if (exists) {
    console.log("Already exists in DB, ignoring update");
    return;
  } else {
    console.log("Creating New Thing");
  }

  let thing = await new db.models.PixelFrame({
    txCreationHash: processedResult.txHash,
    // creationBlock: blockNum,
    datetimeCreated: processedResult.created,
    uid,
    thing: processedResult.thing,
    type: processedResult.type,
    name: processedResult.name,
    name_uid: processedResult["names.uid"],
    description: processedResult.description,
    owner: processedResult.owner,
    creator: processedResult.creator,
    likes: 0,
    price_amount: "0",
    price_hold: "",
    speed: processedResult["meta.speed"],
    num_of_frames: processedResult["meta.num_of_frames"],
    royalty_percent: processedResult["meta.royalty_percent"],
    royalties_earned: "0",
    num_of_owners: 1,
    stamps_used: processedResult.stamps_used,
    lastSaleDate: null,
    lastprocessedResult: processedResult.created,
    //blacklist:
    //  blacklist.art.includes(uid) ||
    //  blacklist.creators.includes(processedResult.creator),
  });
  console.log(util.inspect({ thing }, false, null, true));

  await thing.save();
  console.log("Create thing saved");
};

const likeThing = async (db, processedResult) => {
  const uid = processedResult.uid;
  const sender = processedResult.sender;

  let pixel_frame = await db.models.PixelFrame.findOne({ uid });

  if (!pixel_frame) {
    console.log("UID doesn't exist");
    return;
  }
  // if (pixel_frame.last_likes_tx_uid >= tx_uid) {
  // console.log("Already processed this LIKE tx")
  // return
  // }

  pixel_frame.likes = processedResult.likes;
  pixel_frame.lastUpdate = processedResult.created;

  await pixel_frame.save((err, doc) => {
    // console.log({liked: err})
    // console.log({likedDoc: doc})
  });

  await update_uid_likes(uid, sender);
  await update_user_likes(uid, sender);
};

const update_uid_likes = async (uid, vk) => {
  let likes = await db.models.Likes.findOne({ vk });
  if (!likes) {
    likes = await new db.models.Likes({
      uid,
      liked_by: [vk],
    });
  } else {
    // if (likes.last_likes_tx_uid >= tx_uid) {
    //   console.log("Already processed this LIKE tx")
    //   return
    // }
    likes.liked_by.push(vk);
    likes.isNew = false;
  }

  await likes.save((err, doc) => {
    // console.log({"likes": err})
    // console.log({likesDoc: doc})
  });
};

const update_user_likes = async (uid, vk) => {
  let likedByUser = await db.models.LikedByUser.findOne({ vk });
  if (!likedByUser) {
    likedByUser = await new db.models.LikedByUser({
      vk,
      likes: [uid],
    });
  } else {
    // if (likedByUser.last_likes_tx_uid >= tx_uid) {
    //   console.log("Already processed this LIKE tx")
    //   return
    // }
    likedByUser.likes.push(uid);
  }
  await likedByUser.save((err, doc) => {
    // console.log({"likedByUser": err})
    // console.log({likedByUserDoc: doc})
  });
};

export const sellThing = async (db, processedResult) => {
  const uid = processedResult.uid;

  let pixel_frame = await db.models.PixelFrame.findOne({ uid });
  if (!pixel_frame) return;

  pixel_frame.price_hold = processedResult["price.hold"] || "";
  pixel_frame.price_amount = processedResult["price.amount"] || amount;
  pixel_frame.lastUpdate = processedResult.created;
  pixel_frame.lastSaleDate = processedResult.created;

  await pixel_frame.save((err, doc) => {
    //if (!loader) socket_server.to(`market-updates`).emit("market-update", { type: 'new-listing', update: doc })
  });
};

export const soldThing = async (db, processedResult) => {
  const uid = processedResult.uid;

  let pixel_frame = await db.models.PixelFrame.findOne({ uid });
  if (!pixel_frame) {
    console.log({ uid_not_found: processedResult });
    return;
  }

  let newOwner = processedResult.owner;
  let seller = pixel_frame.owner;
  let wasHeld = pixel_frame.price_hold !== "";
  let priceBN = new BN(pixel_frame.price_amount);
  let royaltyPaidBN = new BN("0");

  if (pixel_frame.royalty_percent > 0) {
    royaltyPaidBN = priceBN.multipliedBy(pixel_frame.royalty_percent / 100);
    if (royaltyPaidBN.isNaN()) royaltyPaidBN = new BN("0");
    if (royaltyPaidBN.isGreaterThan(0)) {
      let currentRoyaltiesBN = new BN(pixel_frame.royalties_earned);
      pixel_frame.royalties_earned = currentRoyaltiesBN.plus(royaltyPaidBN);
    }
  }

  await new db.models.SalesHistory({
    uid,
    saleDate: processedResult.created,
    price: pixel_frame.price_amount,
    royaltyPaid: royaltyPaidBN.toString(),
    seller,
    buyer: newOwner,
    wasHeld: wasHeld,
    gift: false,
    auction: false,
  }).save();

  pixel_frame.price_hold = "";
  pixel_frame.price_amount = "0";
  pixel_frame.owner = newOwner;
  pixel_frame.lastUpdate = processedResult.created;
  pixel_frame.lastSaleDate = processedResult.created;

  await pixel_frame.save(async (err, doc) => {});
};

export const transferThing = async (db, processedResult) => {
  const uid = processedResult.uid;

  let pixel_frame = await db.models.PixelFrame.findOne({ uid });

  pixel_frame.price_hold = "";
  pixel_frame.price_amount = "0";
  pixel_frame.lastUpdate = processedResult.created;
  await pixel_frame.save(async (err, doc) => {});
};

export const updateAuthCodes = async (db, processedResult) => {
  const uid = processedResult.uid;

  let authCodeInfo = await db.models.AuthCodes.findOne({ uid });

  if (!authCodeInfo) return;

  if (authCodeInfo.code === processedResult.proof) {
    authCodeInfo.validated = true;
    //dateValidated: processedResult.created
  }
  await authCodeInfo.save();
};

//store states from con_pixel_frames_aunction

export const newAuction = async (db, processedResult) => {
  //console.log(util.inspect({newAuction: update}, false, null, true))

  const { end_date, start_date, reserve_price} = processedResult
  const [end_year, end_month, end_day, end_hour, end_minute, end_second, end_ms] = end_date.__time__
  const [start_year, start_month, start_day, start_hour, start_minute, start_second, start_ms] = start_date.__time__

  let reserve_price_BN = new BN(reserve_price)

  let auction = await new db.models.AuctionHistory({
      uid: processedResult.uid,
      created_date: processedResult.created,
      start_date: Date.UTC(start_year, start_month-1, start_day, start_hour, start_minute, start_second, start_ms),
      scheduled_end_date: Date.UTC(end_year, end_month-1, end_day, end_hour, end_minute, end_second, end_ms),
      ended: false,
      ended_early: false,
      old_owner: processedResult.current_owner,
      new_owner: "",
      reserve_price: reserve_price_BN.toString(),
      reserve_met: reserve_price_BN.isEqualTo(0),
      winning_bid: "0",
      bid_history: [],
      winner: "",
      paid_to_owner: "0",
      paid_to_creator: "0",
      royalty_percent: processedResult.royalty_percent,
      creator: processedResult.creator,
  })
  //console.log({auction})
  auction.save((err, doc) => {
      //console.log({err, doc})
      // if (!loader) socket_server.to(`auction-updates`).emit("auction-update", {type: 'new-auction', auction: doc})
  })


}

const newBid = async (db, processedResult) => {
  //console.log(util.inspect({newBid: update}, false, null, true))

  let auction = await db.models.AuctionHistory.findOne({uid: processedResult.uid, ended: false})
  if (!auction) return

  let current_bid_BN = new BN(processedResult.current_bid)

  auction.bid_history.unshift({
      bid: current_bid_BN.toString(), bidder: processedResult.current_winner, timestamp: processedResult.created
  })
  auction.reserve_met = current_bid_BN.isGreaterThanOrEqualTo(new BN(auction.reserve_price));

  auction.save((err, doc) => {
      //console.log({err, doc})
      // if (!loader) socket_server.to(`auction-updates`).emit("auction-update", {type: 'new-bid', auction: doc})
  })


}

const endAuction = async (db, processedResult) => {
  // const { uid, update, infoContractUpdate, timestamp, loader } = args
  const uid = processedResult.uid;
  //console.log(util.inspect({endAuction: update, uid, infoContractUpdate}, false, null, true))

  let auction = await db.models.AuctionHistory.findOne({uid, ended: false})
  if (!auction) return

  let pixel_frame = await db.models.PixelFrame.findOne({uid})
  if (!pixel_frame) return

  let ended_date = processedResult.created
  // let new_owner = infoContractUpdate[uid].owner

  let winning_bid_info = auction.bid_history.shift()
  if (winning_bid_info && auction.reserve_met) {
      auction.winning_bid = winning_bid_info.bid
      auction.winner = winning_bid_info.bidder

      let royaltyPaidToCreator_BN = new BN(0)
      let paidToOwner_BN = new BN(winning_bid_info.bid)

      if (auction.royalty_percent > 0) {
          let winning_bid_BN = new BN(winning_bid_info.bid)
          royaltyPaidToCreator_BN = winning_bid_BN.multipliedBy(pixel_frame.royalty_percent / 100)
          if (royaltyPaidToCreator_BN.isNaN()) royaltyPaidToCreator_BN = new BN("0")
          if (royaltyPaidToCreator_BN.isGreaterThan(0)) {
              let currentRoyalties_BN = new BN(pixel_frame.royalties_earned)
              pixel_frame.royalties_earned = currentRoyalties_BN.plus(royaltyPaidToCreator_BN)
          }
      }
      auction.paid_to_owner = paidToOwner_BN.minus(royaltyPaidToCreator_BN).toString()
      auction.paid_to_creator = royaltyPaidToCreator_BN.toString()

      // pixel_frame.owner = new_owner
      pixel_frame.lastSaleDate = processedResult.created
      pixel_frame.lastUpdate = processedResult.created

      await new db.models.SalesHistory({
          uid,
          saleDate: processedResult.created,
          price: winning_bid_info.bid,
          royaltyPaid: royaltyPaidToCreator_BN.toString(),
          seller: auction.old_owner,
          // buyer: new_owner,
          wasHeld: false,
          gift: false,
          auction: true
      }).save()
  }

  auction.ended = true
  auction.ended_early = ended_date < auction.scheduled_end_date
  auction.ended_early_date = ended_date
  // auction.new_owner = new_owner

  auction.save((err, doc) => {
      //console.log({err, doc})
      // if (!loader) socket_server.to(`auction-updates`).emit("auction-update", {type: 'auction-ended', auction: doc})
  })

  await pixel_frame.save()
}