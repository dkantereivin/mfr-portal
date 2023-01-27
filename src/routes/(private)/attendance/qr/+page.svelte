<script lang='ts'>
	import type { PageData } from "./$types";
    import {PUBLIC_BASE_URL} from '$env/static/public';
    import {AwesomeQR} from 'awesome-qr';
    import {FAVICON} from '$lib/components/DataUris';

    export let data: PageData;

    const url = `${PUBLIC_BASE_URL}/attendance/checkin?code=${data.code}`;


    const qrTemplate = new AwesomeQR({
        text: url,
        logoImage: FAVICON,
        logoScale: 0.3,
        size: 600,
        logoCornerRadius: 16
    });

    const qr = qrTemplate.draw() as unknown as Promise<string>; // Promise<DataURI>
    
</script>

<main class="container sm:border mx-2 sm:mx-0 text-center">
    <h2>Your single day code has been created and will expire at 23:59 today.</h2>
    <h1 class="text-3xl font-bold font-mono">{data.code}</h1>
    <br>

    <h2>Enter the above code or scan this QR code.</h2>
    {#await qr then qrSrc}
        <img src={qrSrc} alt="QR Code" class="w-64 h-64 sm:w-96 sm:h-96 mx-auto">
    {/await} 
    
</main>