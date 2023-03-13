<script lang="ts">
	import dayjs from "dayjs";
	import type { PageData } from "./$types";
    import {goto} from "$app/navigation";
    import {Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell} from 'flowbite-svelte'

    export let data: PageData;
    let date = <string>data.date;

    const deleteAttendance = async (id: string) => {
        const res = await fetch(`/api/attendance/${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            console.log('deleted');
        } else {
            console.log('error');
        }
    }
</script>


<main class="container sm:border mx-auto">
    <!-- TABLE of all members attendance for a particular day -->
    <header>
        <h1 class="text-2xl">Member Attendance</h1>
        <div id="date-picker" class="flex flex-row">
            <!-- <a data-sveltekit-reload href="/attendance/manage/{dayjs(date).subtract(1, 'week').format('YYYY-MM-DD')}">&lt;</a> -->
            <input type="date" name="date" bind:value={date}
                on:change={() => goto(`/attendance/manage/${date}`)}
            />
            <!-- <a data-sveltekit-reload href="/attendance/manage/{dayjs(date).add(1, 'week').format('YYYY-MM-DD')}">&gt;</a> -->
        </div>
    </header>
    <Table>
        <TableHead>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Time</TableHeadCell>
            <TableHeadCell>Method</TableHeadCell>
        </TableHead>
        <TableBody>
            {#each data.attendance as member}
                <TableBodyRow>
                    <TableBodyCell>{member.user.firstName} {member.user.lastName}</TableBodyCell>
                    <TableBodyCell>{dayjs().format("hh:mm:ss")}</TableBodyCell>
                    <TableBodyCell>{member.code ?? 'NFC'}</TableBodyCell>
                    <TableBodyCell>
                        <button on:submit={() => {}} class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-1 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </TableBodyCell>
                </TableBodyRow>
            {/each}
        </TableBody>
    </Table>
</main>
