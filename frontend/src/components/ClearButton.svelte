<script>
    import { currentFrame, frameStore, activeFrame } from '$lib/js/stores'
    import { newPixelBoard } from '$lib/js/defaults.js'

    const handleClick = () => {
        let wipe = confirm("Wipe current frame?")
        if (wipe) {
            frameStore.update(f => {
                f[$activeFrame].frames[$currentFrame] = newPixelBoard();
                return f
            })
        }
    }
</script>

<button class="button_text" value="clear" on:click ={handleClick}> Clear Current Frame </button>