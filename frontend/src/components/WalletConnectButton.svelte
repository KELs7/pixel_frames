<script>
    import { onMount } from 'svelte'
	import { createEventDispatcher, getContext } from 'svelte';
	const dispatch = createEventDispatcher();

    const { xduWalletInstalled, xduWalletInfo } = getContext('app_functions')

	export let lwc ;

    $: installed = false;
    $: connected = false;
    $: locked = false;

    let storeURL = "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim"

    onMount(() => {
        setState()
	})

    const setState = () => {
        installed = xduWalletInstalled
        connected = xduWalletInfo.address;
        locked = xduWalletInfo.locked
    }

    const openLink = (url) => {
        if (!installed) window.open(storeURL, '_blank');
	}

</script>



{#if !installed}
    <a href="https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim"
       target="_blank"
       rel="noopener noreferrer"
       class="button">Install Wallet</a>
{:else}
     {#if locked}
        <button class="button" disabled={true}>Wallet Locked</button>
    {:else}
         {#if !connected}
            <button class="button" on:click={() => lwc.sendConnection()}> Connect to Wallet</button>
         {/if}
    {/if}
{/if}





