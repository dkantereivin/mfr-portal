<script lang="ts">
	import { getRank, ROLE_GROUPS } from "$lib/utils/auth";
	import type { Role } from "$lib/models";
    import { Popover, Tooltip } from "flowbite-svelte";
    import _ from "lodash";
    import type { PageData } from "./$types";
    import {slide} from "svelte/transition"
	import { dayjs, parseLocal } from "$lib/utils/dates";

    export let data: PageData;
    const {memberAttendance, finalizedDates} = data;

    const membersForRoles = (roles: Role[]) => _.sortBy(
        memberAttendance.filter(({user}) => roles.includes(user.role)),
        [({user}) => -getRank(user.role), ({user}) => user.lastName]
    );
</script>

<main class="container sm:border sm:mx-auto mx-2 sm:rounded-lg">
    <div class="relative overflow-x-auto shadow-md">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs uppercase bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th class="px-6 py-3">Rank</th>
                    <th class="px-6 py-3">Last Name</th>
                    <th class="px-6 py-3">First name</th>
                    <th class="px-6 py-3">Alliance #</th>
                    {#each finalizedDates as [date, isFinalized]}
                        <th class="px-6 py-2">
                            <div class="flex flex-col justify-center align-middle text-center">
                                <span>{parseLocal(date).format('MMM D')}</span>
                                {#if isFinalized}
                                    <span class="flex w-3 h-3 rounded-full bg-green-500 mx-auto mt-2"/>
                                    <Tooltip placement="bottom">
                                        This training date has been finalized.
                                        Any further changes should be entered manually into the volunteer hours sheet.
                                    </Tooltip>
                                {:else}
                                    <span class="flex w-3 h-3 rounded-full bg-yellow-300 mx-auto mt-2"/>
                                    <Popover title="Date Currently Editable" placement="bottom" >
                                            <span class="text-sm normal-case">
                                                This date is has not yet been exported and therefore is still editable.
                                                <br><br>
                                                Any changes made here will be automatically reflected in the volunteer hours sheet.
                                            </span>
                                            <br>
                                            <form method="POST" action="?/export">
                                                <input type="hidden" name="date" value="{dayjs(date).tz().format('YYYY-MM-DD')}" />
                                                <div class="flex flex-row justify-center items-center space-x-4 mt-2">
                                                    <label for="hours" class="text-md">Hours:</label>
                                                    <input type="number" name="hours" class="w-16 border border-gray-300 rounded-md px-2 py-2" placeholder="Hours" value={2} />
                                                    <button class="px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-600">Export and Finalize</button>    
                                                </div>
                                            </form>
                                    </Popover>
                                {/if}
                            </div>
                        </th>
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
