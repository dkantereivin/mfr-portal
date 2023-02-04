<script lang="ts">
	import dayjs, { type Dayjs } from "dayjs";
	import type { PageData } from "../$types";
    import {goto} from "$app/navigation";

    export let data: PageData;
    let date: string = data.date;

</script>


<main class="container sm:border mx-auto">
    <!-- TABLE of all members attendance for a particular day -->
    <header>
        <h1 class="text-2xl">Member Attendance</h1>
        <div id="date-picker" class="flex flex-row">
            <a data-sveltekit-reload href="/attendance/manage/{dayjs(date).subtract(1, 'week').format('YYYY-MM-DD')}">&lt;</a>
            <input type="date" name="date" bind:value={date}
                on:change={() => goto(`/attendance/manage/${date}`)}
            />
            <a data-sveltekit-reload href="/attendance/manage/{dayjs(date).add(1, 'week').format('YYYY-MM-DD')}">&gt;</a>
        </div>
    </header>

    <table>
        <tr>
            <th>Name</th>
            <th>Attendance</th>
        </tr>
        {#each data.attendance as member}
            <tr>
                <td>{member.name}</td>
                <td>{JSON.stringify(member)}</td>
            </tr>
        {/each}
    </table>
</main>