<script lang='ts'>
    import {Label, Input, Button, Helper} from 'flowbite-svelte';
	import type { PageData } from './$types';
    export let data: PageData & {error?: string, code?: string}; // todo: use proper type
</script>

<main class="container sm:border mx-auto p-4">
    <img src="/icons/training.png" alt="Verification Code" class="mx-auto w-1/2 md:w-1/4 lg:w-1/6" />
    <h1 class="text-2xl">Ways to Check In:</h1>
    <ol class="text-left list-decimal pl-[2.5em]">
        <li>Hold your phone near the attendance card.</li>
        <li>Scan a QR code from SJA Leadership.</li>
        <li>Manually enter an attendance code from leadership.</li>
    </ol>

    <form method="GET" class="border p-2 mt-5 sm:border-0 sm:w-1/2">
        <Label class="space-y-2 mb-2">
            <span class="text-lg">Attendance Code</span>
            <Input color="{data?.error ? 'red' : 'base'}" name="code" type="text" placeholder="Enter Code" value="{data?.code ?? ''}"/>
            {#if data?.error}
                <Helper class="mt-2" color="red"><span class="font-bold">{data?.error}</span> Please try again.</Helper>
            {/if}
        </Label>
        <Button type="submit">Submit</Button>
    </form>

</main>
