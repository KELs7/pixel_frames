<script>
    // MISC
    import { newPixelFrame } from '$lib/js/defaults'
    import { frameStore, activeFrame } from '$lib/js/stores'

    const handleClick = () => {
        frameStore.update(currentValue => {
            let newList = currentValue.unshift(newPixelFrame())
            activeFrame.set(0)
            return currentValue
        })
    }
</script>


<button class="button_text weight-600" on:click={handleClick}>NEW</button>