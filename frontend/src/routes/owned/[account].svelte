<script>
    import Owned from "../../components/Owned.svelte";

    import { formatAccountAddress } from '$lib/js/utils'

    export let account
	export let owned

</script>

<svelte:head>
	<title>{`NFTs owned by ${formatAccountAddress(account)}`}</title>
</svelte:head>

<Owned owned={owned} {account}/>


