import { getDatabase } from "./database.mjs";
import { getStateChangesQuery } from "./graphqlQuries.mjs";
import * as saveToDB from "./contractStatesStorage.mjs";

process.on("SIGTERM", (signal) => {
  console.log(`Process ${process.pid} received a SIGTERM signal`);
  process.exit(0);
});

process.on("SIGINT", (signal) => {
  console.log(`Process ${process.pid} has been interrupted`);
  process.kill(process.pid, "SIGTERM");
});

export const makeGraphQLRequest = async (query) => {
  const url = "https://testnet.xian.org/graphql";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("There was an error:", error);
  }
};

export const groupByTxHashAndFunction = (data) => {
  const nodes = data.data.allStateChanges.nodes;
  const txMap = Object.create(null);

  for (let i = 0, len = nodes.length; i < len; i++) {
    const node = nodes[i];
    const { created, txHash, key, value, transactionByTxHash } = node;

    if (!(txHash in txMap)) {
      txMap[txHash] = {
        created,
        txHash,
        function: transactionByTxHash.function,
        stamps: transactionByTxHash.stamps,
        sender: transactionByTxHash.sender,
        stateChanges: [],
      };
    }

    txMap[txHash].stateChanges.push({ key, value });
  }

  return Object.values(txMap);
};

function* extractValues(groupedData) {
  const extractionRules = {
    create_thing: {
      ":thing": "thing",
      ":type": "type",
      ":name": "name",
      "S:names:": { key: "names.uid", value: "uid" },
      ":description": "description",
      ":owner": "owner",
      ":creator": "creator",
      ":meta:speed": "meta.speed",
      ":meta:num_of_frames": "meta.num_of_frames",
      ":meta:royalty_percent": "meta.royalty_percent",
    },
    set_owner: {
      ":owner": "owner",
    },
    set_proof: {
      ":proof": "proof",
    },
    set_price: {
      ":price:hold": "price.hold",
      ":price:amount": "price.amount",
    },
  };

  for (const group of groupedData) {
    const rules = extractionRules[group.function];
    if (rules) {
      const groupResult = {};
      groupResult["created"] = group.created;
      groupResult["txHash"] = group.txHash;
      groupResult["stamps_used"] = group.stamps;
      groupResult["sender"] = group.sender;
      for (const change of group.stateChanges) {
        const { key, value } = change;
        for (const [endsWith, resultKey] of Object.entries(rules)) {
          if (typeof resultKey === "object") {
            if (key.includes(endsWith)) {
              groupResult[resultKey.key] = key.split(":").pop();
              groupResult[resultKey.value] = value;
            }
          } else if (key.endsWith(endsWith)) {
            groupResult[resultKey] = value;
          }
        }
      }
      if (Object.keys(groupResult).length > 0) {
        yield { function: group.function, data: groupResult };
      }
    }
  }
}

const processExtractedValues = async (groupedData) => {
  let db = await getDatabase();

  for (const result of extractValues(groupedData)) {
    try {
      console.log(`Processing ${result.function}`);
      switch (result.function) {
        case "create_thing":
          await saveToDB.creatNewThing(db, result.data);
          break;
        case "set_owner":
          await saveToDB.transferThing(db, result.data);
          break;
        case "set_proof":
          // await saveToDB.setProof(db, result.data);
          break;
        case "set_price":
          await saveToDB.soldThing(db, result.data);
          await saveToDB.sellThing(db, result.data);
          break;
        default:
          console.log(`Unhandled function: ${result.function}`);
      }
    } catch (error) {
      console.error(`Error processing ${result.function}:`, error);
    }
  }
};

export const drop_collections = async () => {
  let db = await getDatabase();
  await db.queries.drop_collection("PixelFrame");
  await db.queries.drop_collection("Likes");
  await db.queries.drop_collection("LikedByUser");
  await db.queries.drop_collection("SalesHistory");
  await db.queries.drop_collection('AuctionHistory')
  
  // await db.queries.delete_processed("InfoContractUpdates");
  //await db.queries.delete_processed('AuctionHistoryContract')
};

const startLoading = async (offset, drop = true) => {
  if (drop && offset === 0) await drop_collections();

  // Process info contract states
  await processContractStates("info", offset);

  // Process auction contract states
  //await processContractStates("auction", offset);

  process.exit(0);
};

export const processContractStates = async (contractType, offset) => {
  const query = getStateChangesQuery(contractType, offset);
  const queryResults = await makeGraphQLRequest(query);
  let resultsTotalCount = queryResults?.data.allStateChanges.nodes.length;

  if (resultsTotalCount === 0) {
    return;
  }

  const groupedData = groupByTxHashAndFunction(queryResults);
  await processExtractedValues(groupedData);
  console.log(`${contractType} resultsTotalCount: `, resultsTotalCount);

  if (resultsTotalCount < 100) {
    return;
  }

  // Recursive call with a delay to prevent stack overflow
  setTimeout(async () => {
    const newOffset = offset + 100;
    console.log(`${contractType} newOffset: `, newOffset);
    await processContractStates(contractType, newOffset);
  }, 1000); // 1 second delay
};

let [drop] = process.argv.slice(2);

startLoading(0, drop);