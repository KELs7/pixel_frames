export const TransactionResultHandler = (createSnack) => {
	function handleTransaction(response, callback){
		if (response.errors) {
			console.error('Transaction failed:', response.errors);
			createSnack({
				title: 'Transaction failed',
				body: response.errors,
				type: 'error'
			})
			return;
		}
		console.log('Transaction succeeded:', response);
		if(typeof callback === 'function') callback(response);
	}
	
	function handleTransactionError(error){
		console.error('Transaction error:', error);
		createSnack({
			title: 'Transaction Error',
			body: error,
			type: 'error'
		})
	}

	return {
		handleTransaction,
		handleTransactionError
	}
}