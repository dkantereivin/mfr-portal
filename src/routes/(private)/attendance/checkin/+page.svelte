<script lang='ts'>
	import { enhance } from '$app/forms';
    import dayjs from 'dayjs';
	import type { PageData } from './$types';

    const NFC = false;

    const DATE_FORMAT = 'dd, D MMMM YYYY';

    export let data: PageData;
</script>

<main class="container sm:border mx-auto">
    <h2 class="text-md">Current Date</h2>
    <h1 class="text-2xl">{dayjs().format(DATE_FORMAT)}</h1>

    <!-- switch for small screens between NFC and code -->
    <div>
        {#if NFC}
            <section>
                NFC
            </section>
        {/if}
        <section class="md:container md:mx-auto md:border">
            <form method="GET" use:enhance>
                <input name="code" type="text" placeholder="Enter Code" value={data?.code ?? ''}/>
                <button type="submit">Submit</button>
            </form>
            {#if data?.success}
            <h1>Thanks for attending training!</h1>
            <p>Your attendance has been successfully logged at {dayjs(data.time).format(DATE_FORMAT)}.</p>
            {:else if data?.error}
            <h1>{data?.error} Please try again.</h1>
            {/if}
        </section>
        
    </div>
    
</main>