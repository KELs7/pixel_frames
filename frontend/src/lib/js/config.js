export const config = {
    frameWidth: 25,
    totalPixels: 625,
    totalFrames: 8,
    infoContract: "con_pw_info_3", // CHANGE
    masterContract: "con_pw_master_3", // CHANGE
    networkType: "testnet", // CHANGE
    currencySymbol: "DTAU", // CHANGE
    domainName: "https://localhost", // CHANGE
    //blockExplorer: "http://localhost:1337", // CHANGE
    blockExplorer: "https://testnet.lamden.io", // CHANGE
    masternode: "https://testnet-master-1.lamden.io" // CHANGE
}

export const socket_config = {
    host: "https://localhost",
    port: 5137
}

export const featureLocks = {
    auctions: {
        locked: true
    }
}


export const stampLimits = (()=>{
    let stampValues = {}
    stampValues[config.masterContract] = {
        sell_thing: 90, // CHANGE
        like_thing: 90, // CHANGE
        transfer: 105, // CHANGE
        prove_ownership: 95 // CHANGE
    }
    stampValues['currency'] = {
        approve: 25
    }
    return stampValues
})()
