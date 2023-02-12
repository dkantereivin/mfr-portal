<script lang="ts">
	import { getRank, ROLE_GROUPS } from "$lib/utils/auth";
	import type { Role } from "@prisma/client";
    import dayjs from "dayjs";
    import { Popover } from "flowbite-svelte";
    import _ from "lodash";
    import type { PageData } from "./$types";
    import {slide} from "svelte/transition"

    export let data: PageData;
    const {trainingDates, memberAttendance} = data;

    const membersForRoles = (roles: Role[]) => _.sortBy(
        memberAttendance.filter(({user}) => roles.includes(user.role)),
        [({user}) => -getRank(user.role), ({user}) => user.lastName]
    );
</script>

<main class="container sm:border sm:mx-10 sm:rounded-lg">
    <div class="relative overflow-x-auto shadow-md">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs uppercase bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th class="px-6 py-3">Rank</th>
                    <th class="px-6 py-3">Last Name</th>
                    <th class="px-6 py-3">First name</th>
                    <th class="px-6 py-3">Alliance #</th>
                    {#each trainingDates as date}
                        <th class="px-6 py-2">{dayjs(date).format('MMM D')}</th>
                    {/each}
                </tr>
            </thead>
    
            <tbody>
                {#each ROLE_GROUPS as [selectedGroup, selectedRoles]}
                    <tr>
                        <td colspan="100">{selectedGroup}</td>
                    </tr>
                    {#each membersForRoles(selectedRoles) as {user, attendanceDates}}
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td>
                                <img src="/icons/ranks/{user.role.toLowerCase()}.svg" alt="{user.role}" class="w-4"/>
                            </td>
                            <td class="px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {user.lastName}
                            </td>
                            <td class="px-6 py-3">{user.firstName}</td>
                            <td class="px-6 py-3">{user.contId}</td>
                            {#each Object.keys(attendanceDates) as date}
                                <td class="text-center">
                                    <span class="px-4 py-3">{attendanceDates[date] ? '✅' : '❌'}</span>
                                    <Popover class="w-28 text-sm font-light" trigger="click" transition={slide} params={{duration: 500}}>
                                        <div class="flex flex-row justify-evenly">
                                            <form method="POST" class="contents">
                                                <input type="hidden" name="date" value="{date}" />
                                                <input type="hidden" name="userId" value="{user.id}" />
                                                <button formaction="?/create" class="px-2 py-1 text-green-500 rounded-md hover:bg-green-500 hover:text-white">✅</button>
                                                <button formaction="?/delete" class="px-2 py-1 text-red-500 rounded-md hover:bg-red-500 hover:text-white">❌</button>
                                            </form>
                                            <a href="/attendance/manage/{date}" class="px-2 py-1 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white text-xl font-bold">ⓘ</a>
                                        </div>
                                    </Popover>
                                </td>
                            {/each}
                        </tr>
                    {/each}
                {/each}
            </tbody>
        </table>
    </div>
</main>
