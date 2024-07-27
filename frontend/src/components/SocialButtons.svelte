<script>
    import { Reddit, Telegram, Facebook, X } from 'svelte-share-buttons-component';
    import { config } from '$lib/js/config.js'

    export let thingInfo

    let x_url = `${config.domainName}/frames/${thingInfo.uid}`
    let facebook_url = `${config.domainName}/frames/${thingInfo.uid}`
    let telegram_url = `${config.domainName}/gif/${thingInfo.uid}.gif`
    let reddit_url = `${config.domainName}/gif/${thingInfo.uid}.gif`
    // let description = thingInfo.description
    let title = thingInfo.name

</script>
<style>
    p{
        margin-bottom: 0;
    }
    p.subtext{
        margin: 0 0 1rem;
    }

</style>
<p class="text-color-gray-5">Share it on social media! </p>
<div >
    <X class="share-button" text={title} url={x_url} />
    <Facebook class="share-button" url={facebook_url} />
    <Telegram class="share-button" text={title} url={telegram_url} />
    <Reddit class="share-button" {title} url={reddit_url} />
<!--
    <Email subject="{title}" body="{desc} {url}" />
    <HackerNews class="share-button" {title} {url} />
    <Reddit class="share-button" {title} {url} />
    <LinkedIn class="share-button" {url} />
    <Tumblr class="share-button" {title} {url} caption="{title}" />
    <Pinterest class="share-button" description={title} />
    <Vk class="share-button" {title} {url} />
    <Xing class="share-button" {title} {url} />
   -->
</div>

