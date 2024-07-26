<script>
    import { tick }  from 'svelte'
    import { frames, currentFrame, frameStore, activeFrame } from '$lib/js/stores'
    import { config } from '$lib/js/config'

    const addFrame = async () => {
        if ($frames.length < config.totalFrames + 1) {
            frameStore.update(f => {
                f[$activeFrame].frames.push(Array.from(f[$activeFrame].frames[f[$activeFrame].frames.length - 1]));
                return f
            })
            await tick()
            currentFrame.set($frames.length - 1)
        }
    }
</script>

<style>
    .button{
        width: 24px;
        height: 24px;
        padding: 0;
    }
</style>

<button class="button" on:click={addFrame} >
    +
</button>
