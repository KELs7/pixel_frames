<!-- /frontend/src/routes/_layout.svelte -->

<script>
	// TODO - Royalties displayed on buy page
	// TODO - Backup Warning for Wallet connection
	// TODO - disclaimer when creating NFT
	// TODO - disclaimer when buying NFT
	// TODO - disclaimer when selling NFT

	import {onMount, beforeUpdate, setContext} from 'svelte';

	// Components
	import Nav from '../components/Nav.svelte';
	import XianWalletUtils from "../js/xian-dapp-utils";
	import Snackbar from "../components/Snackbar.svelte";
	import Modal from "../components/Modal.svelte";
	import CreatedWithLove from "../components/CreatedWithLove.svelte";
	import AuctionUpdates from "../components/AuctionUpdates.svelte";

	// Misc
	import {approvalRequest} from '../js/wallet_approval';
	import { config, stampLimits } from '../js/config.js';
	import { walletInfo, showModal, userAccount, stampRatio, currency, tabHidden, tauPrice} from '../js/stores.js';
	import {stringToFixed, toBigNumber} from '../js/utils.js';
	import {processTxResults, createSnack, refreshTAUBalance, checkForApproval} from '../js/store-utils.js';
	import { TransactionResultHandler } from '../js/transaction_result_handler'
	import * as socketservice from '../js/socketservice'


	export let segment;

	let xdu;
	let xduWalletInstalled = false;
	let lastCurrencyCheck = new Date()
	let txResultsHandler = TransactionResultHandler(createSnack)
	let socket = socketservice.start()

	onMount(async() => {
		XianWalletUtils.init('https://testnet.xian.org');
		xdu = XianWalletUtils;
		xduWalletInstalled = true;
		const xduWalletInfo = await xdu.requestWalletInfo().catch(()=>xduWalletInstalled = false);
		
		handleWalletInfo(xduWalletInfo);

		document.addEventListener("visibilitychange", setTabActive);
		refreshCurrencyBalance()
		refreshTauPrice()
		checkForApproval(config.masterContract)

		return () => {
			document.removeEventListener("visibilitychange", setTabActive);
		}
	})

	beforeUpdate(() => {
		// if (xdu) {
		// 	if (!$userAccount && xduWalletInfo.address) userAccount.set(xduWalletInfo.address)
		// }
		if (!$stampRatio) fetchStampRatio();
	})

	const fetchStampRatio = () => {
		fetch(`./stampRatio.json`)
				.then(res => res.json())
				.then(res => stampRatio.set(res.currentRatio))
	}

	setContext('app_functions', {
		sendTransaction: (transaction, callback) => sendTransaction(transaction, callback),
		xdu: () => {
			return xdu
		},
		socket,
		isInstalled: ()=>{
			return xduWalletInstalled
		},
	})

	const sendTransaction = async(transaction, callback) => {
		// let usersStamps = determineUsersTotalStamps()
		let contractName = transaction.contractName || config.masterContract
		// let stampsToSendTx = transaction.stampLimit;
		// if (!stampsToSendTx) stampsToSendTx = stampLimits[contractName][transaction.methodName]

		// if (usersStamps < stampsToSendTx){
		// 	createSnack({
        //         title: `Insufficient ${config.currencySymbol}`,
        //         body: `
		// 			It will cost ${stringToFixed(toBigNumber(stampsToSendTx / $stampRatio), 4)} ${config.currencySymbol} to send this transaction.
		// 			Please transfer more ${config.currencySymbol} to your Pixel Whale account using the Xian Wallet.
        //         `,
        //         type: "error",
		// 		delay: 7000
        //     })
		// }else{
		// 	transaction.stampLimit = stampsToSendTx

		// 	const txResults = await xdu.sendTransaction(contractName, transaction.methodName, transaction.kwargs)
		// 	.catch(txResultsHandler.handleTransactionError)
		// 	txResultsHandler.handleTransaction(txResults)
		// }

		const txResults = await xdu.sendTransaction(contractName, transaction.methodName, transaction.kwargs, transaction.stampLimit)
			.catch(txResultsHandler.handleTransactionError)
		txResultsHandler.handleTransaction(txResults, callback)
	}

	const determineUsersTotalStamps = () => {
		return parseInt($currency * $stampRatio)
	}

	const handleWalletInfo = (info) => {
		// autoTx.set(xdu.autoTransactions)
		userAccount.set(info.address)
		walletInfo.set(info)
	}


	const handleTxResults = (results) => {
		let errors = processTxResults(results)
		if (errors.length > 0) {
			if (errors[0].includes('have not been approved for')) xdu.sendConnection(approvalRequest, true)
		}
	}

	const refreshCurrencyBalance = async  () => {
		if ($tabHidden || !$userAccount) setTimeout(refreshCurrencyBalance, 10000)
		else{
			await refreshTAUBalance()
			lastCurrencyCheck = new Date()
			setTimeout(refreshCurrencyBalance, 10000)
		}
	}

	const refreshTauPrice = async  () => {
		if ($tabHidden || !$userAccount) setTimeout(refreshTauPrice, 60000)
		else{
			tauPrice.refreshPrice()
			setTimeout(refreshTauPrice, 60000)
		}
	}

	const setTabActive = () => {
		tabHidden.set(document.hidden)
		if (!$tabHidden && $userAccount && new Date() - lastCurrencyCheck > 5000 ) refreshTAUBalance()
		if (!$tabHidden && $userAccount && new Date() - tauPrice.lastCheck > 60000 ) tauPrice.refreshPrice()
	}
</script>

<style>
	main {
		position: relative;
		max-width: 1600px;
		padding: 0 28px 10rem;
		margin: 1rem auto 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex-grow: 1;
	}
	@media (min-width: 450px) {
		main {
			padding: 0 28px 10rem;
			margin: 0 auto 0;
		}
	}
</style>

{#if $showModal.show}
	<Modal/>
{/if}
<Snackbar />
<Nav {segment} {xdu}/>
<main>
	<slot></slot>
</main>
<CreatedWithLove />
<AuctionUpdates />
