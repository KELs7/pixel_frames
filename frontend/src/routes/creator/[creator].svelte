<script>
    import Creator from "../../components/Creator.svelte";

	import { formatAccountAddress } from '../$lib/js/utils'

    export let created
	export let creator
</script>

<svelte:head>
	<title>{`NFTs created by ${formatAccountAddress(creator)}`}</title>
</svelte:head>

<Creator {created} {creator}/>