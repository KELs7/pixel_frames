<script>
	import { getContext } from 'svelte';
	import { walletInfo } from '$lib/js/stores.js';

    export let xdu;

    const { isInstalled } = getContext('app_functions')

    $: installed = isInstalled();

</script>

{#if !installed}
    <a href="https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim"
       target="_blank"
       rel="noopener noreferrer"
       class="button">Install Wallet</a>
{:else}
     {#if $walletInfo?.locked ?? true}
        <button class="button" disabled={true}>Wallet Locked</button>
    {:else}
         {#if !$walletInfo?.address ?? false}
            <button class="button" on:click={() => xdu.sendConnection()}> Connect to Wallet</button>
         {/if}
    {/if}
{/if}