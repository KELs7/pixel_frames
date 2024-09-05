export const getStateChangesQuery = (contractType, offset = 0) => {
  const infoQuery = `
  query MyQuery {
    allStateChanges(
      filter: { key: { startsWith: "con_pixel_frames_info_v0_1" } }
      offset: ${offset}
    ) {
      totalCount
      nodes {
        created
        txHash
        key
        value
        transactionByTxHash {
          function
          stamps
          sender
        }
      }
    }
  }
  `;

  const auctionQuery = `
  query MyQuery {
    allStateChanges(
      filter: { key: { startsWith: "con_pixel_frames_auction_v0_1" } }
      offset: ${offset}
    ) {
      totalCount
      nodes {
        created
        txHash
        key
        value
        transactionByTxHash {
          function
          stamps
          sender
        }
      }
    }
  }
  `;
  
  const queries = {
    "info": infoQuery,
    "auction": auctionQuery
  }
  return queries[contractType]
};

