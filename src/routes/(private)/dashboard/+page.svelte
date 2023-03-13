<script lang="ts">
	import type { PageData } from "./$types";    

    export let data: PageData;
</script>

<main class="container sm:border px-3 sm:mx-auto sm:rounded-lg">
    <h1 class="text-2xl">Hello {data.user.firstName}!</h1>
    <p>
        Thanks for logging in! This will really help the admin team keep track of training attendance,
        and it will allow us to better develop the site.
        <br><br>
        Right now, this page is pretty bland -- most of the coolness is ~~behind the scenes~~.
        You should be able to simply tap your phone on the "attendance cards" or scan a QR code to sign in.
        If neither of these methods work for you, you can manually enter your attendance by clicking 
        <a href="/attendance/checkin" class="text-blue-500 hover:text-blue-600">here</a>.
        <br><br>
        Many good things are coming to this site, so stay tuned!
        The currently bland dashboard will soon show you lots of information, such as:
    </p>
    <ul class="list-disc list-inside">
        <li>Your training attendance history.</li>
        <li>Your volunteer hours and member contract obligations</li>
        <li>Your upcoming events</li>
    </ul>
    <p>
        We are currently implementing automatic event forms,
        and are potentially discussing including event signup and other convenience
        features on the site.

        <span class="font-bold">
            Please, please, please let me (david.kantereivin@sjacs.ca) know
            if you have any questions, bugs, suggestions, or feature requests!
            I look forward to making this portal useful for everyone.
        </span>
    </p>
</main>