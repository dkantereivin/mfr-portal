<script lang='ts'>
    import dayjs from "dayjs";
	import { Tooltip } from "flowbite-svelte";

    const blankMember = () => ({
        name: '',
        position: 'MFR',
        location: 'SJA',
        startTime: '',
        endTime: ''
    });

    let members: Record<string, any>[] = [];

    let eventDate = new Date();

    let saveState: 'idle' | 'error' | 'pending' | 'saved' = 'idle'
    
    const calculateMemberHours = ({startTime, endTime}) => {
        const [startHour, startMinute] = startTime.split(':');
        const [endHour, endMinute] = endTime.split(':');

        return dayjs(eventDate).hour(endHour).minute(endMinute)
            .diff(dayjs(eventDate).hour(startHour).minute(startMinute), 'hour', true);
    }

</script>


<main class="container sm:border sm:mx-auto sm:rounded-lg">
    <div class="fixed bottom-2 right-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle-check-filled" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#00abfb" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" stroke-width="0" fill="currentColor" />
        </svg>
    </div>

    <h1>Submit a New Event Form</h1>

    <ol class="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
        <li class="flex md:w-full items-center text-blue-600 dark:text-blue-500 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700">
            <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
                <svg aria-hidden="true" class="w-4 h-4 mr-2 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                Personal <span class="hidden sm:inline-flex sm:ml-2">Info</span>
            </span>
        </li>
        <li class="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700">
            <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
                <span class="mr-2">2</span>
                Account <span class="hidden sm:inline-flex sm:ml-2">Info</span>
            </span>
        </li>
        <li class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 sm:w-5 sm:h-5" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5" />
                <path d="M6 10h4m-2 -2v4" />
            </svg>
            Equipment/Vehicles
        </li>
    </ol>

    <form class="border">
        <section>
            <h1>Event Information</h1>
            <div class="flex flex-row">
                <div class="flex flex-col">
                    <label for="event-number">Event Number</label>
                    <input type="text" id="event-number" name="event-number" placeholder="{dayjs().year()}-C-00" />
                </div>
                <div class="flex flex-col">
                    <label for="event-name">Event Name</label>
                    <input type="text" id="event-name" name="event-name" placeholder="Event Name" />
                </div>
                <div class="flex flex-col">
                    <label for="date">Date</label>
                    <input type="date" id="date" name="date" placeholder="Date" bind:value={eventDate}/>
                </div>
                <div class="flex flex-col">
                    <label for="location">Event Location</label>
                    <input type="text" id="location" name="location" placeholder="Location" />
                </div>
            </div>
        </section>

        <section>
            <h1>Member Hours</h1>
            <table class="w-full">
                <thead>
                    <tr>
                        <th>Member Name</th>
                        <th>Position</th>
                        <th>Meeting Location</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th class="flex">
                            <span>Hours</span>
                            <!-- info i icon svg -->
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-info-circle h-6" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                                <path d="M12 9h.01" />
                                <path d="M11 12h1v4h1" />
                            </svg>
                            <Tooltip>
                                Please include time spent travelling between the unit and the event location.<br>
                                Do not include travel time to get the member's meet point.
                            </Tooltip>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each members as member, i}
                        <tr>
                            <td>
                                <input type="text" id="member-name-{i}" name="member-name-{i}" placeholder="Member Name" bind:value={member.name} />
                            </td>
                            <td>
                                <select id="member-position-{i}" name="member-position-{i}" bind:value={member.position}>
                                    <option value="CMD">Command</option>
                                    <option value="SUP">Supervisor</option>
                                    <option value="MFR">MFR</option>
                                    <option value="APP">Apprentice</option>
                                </select>
                            </td>
                            <td>
                                <select id="member-location-{i}" name="member-location-{i}" bind:value={member.location}>
                                    <option value="SJA">SJA</option>
                                    <option value="Event">Event</option>
                                </select>
                            </td>
                            <td>
                                <input type="time" id="member-start-time-{i}" name="member-start-time-{i}" bind:value={member.startTime} />
                            </td>
                            <td>
                                <input type="time" id="member-end-time-{i}" name="member-end-time-{i}" bind:value={member.endTime} />
                            </td>
                            <td>
                                {member.startTime && member.endTime ? calculateMemberHours(member) : 0}
                            </td>
                            <td>
                                <button type="button" class="w-full" on:click={() => members = members.filter((_, idx) => idx !== i)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-square-rounded-x-filled" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ff2825" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M12 2l.324 .001l.318 .004l.616 .017l.299 .013l.579 .034l.553 .046c4.785 .464 6.732 2.411 7.196 7.196l.046 .553l.034 .579c.005 .098 .01 .198 .013 .299l.017 .616l.005 .642l-.005 .642l-.017 .616l-.013 .299l-.034 .579l-.046 .553c-.464 4.785 -2.411 6.732 -7.196 7.196l-.553 .046l-.579 .034c-.098 .005 -.198 .01 -.299 .013l-.616 .017l-.642 .005l-.642 -.005l-.616 -.017l-.299 -.013l-.579 -.034l-.553 -.046c-4.785 -.464 -6.732 -2.411 -7.196 -7.196l-.046 -.553l-.034 -.579a28.058 28.058 0 0 1 -.013 -.299l-.017 -.616c-.003 -.21 -.005 -.424 -.005 -.642l.001 -.324l.004 -.318l.017 -.616l.013 -.299l.034 -.579l.046 -.553c.464 -4.785 2.411 -6.732 7.196 -7.196l.553 -.046l.579 -.034c.098 -.005 .198 -.01 .299 -.013l.616 -.017c.21 -.003 .424 -.005 .642 -.005zm-1.489 7.14a1 1 0 0 0 -1.218 1.567l1.292 1.293l-1.292 1.293l-.083 .094a1 1 0 0 0 1.497 1.32l1.293 -1.292l1.293 1.292l.094 .083a1 1 0 0 0 1.32 -1.497l-1.292 -1.293l1.292 -1.293l.083 -.094a1 1 0 0 0 -1.497 -1.32l-1.293 1.292l-1.293 -1.292l-.094 -.083z" fill="#ff2825" stroke-width="0" />
                                      </svg>
                                </button>
                            </td>
                        </tr>
                    {/each}
                    
                    <tr>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <td colspan="6" on:click={() => members = [...members, blankMember()]}>
                            <button type="button" class="w-full">Add Another Member</button>
                        </td>Kit
                    {#each members as member, i}
                        <tr>
                            <td>
                                <span>{member.name}</span>
                            </td>
                            <td>
                                <input type="text" id="radio-number-{i}" name="radio-number-{i}" placeholder="Radio #" bind:value={member.radioNumber} />
                            </td>
                            <td>
                                <input type="checkbox" id="radio-returned-{i}" name="radio-returned-{i}" bind:checked={member.radioReturned} />
                            </td>
                        </tr>
                    {/each}
            </table>

            <h2>Kits and Equipment</h2>
            <div>
                <div class='flex flex-row'>
                    <span>
                        <label for='kit-1'>Kit 1</label>
                        <input type='checkbox' id='kit-1' name='kit-1' />
                    </span>
                    <span>
                        <label for='airway-1'>O<sub>2</sub> 1</label>
                        <input type='checkbox' id='airway-1' name='airway-1' />
                    </span>
                    <span>
                        <label for='aed-1'>AED 1</label>
                        <input type='checkbox' id='aed-1' name='aed-1' />
                    </span>
                </div>
                <div class='flex flex-row'>
                    <span>
                        <label for='kit-2'>Kit 2</label>
                        <input type='checkbox' id='kit-2' name='kit-2' />
                    </span>
                    <span>
                        <label for='airway-2'>O<sub>2</sub> 2</label>
                        <input type='checkbox' id='airway-2' name='airway-2' />
                    </span>
                    <span>
                        <label for='aed-2'>AED 2</label>
                        <input type='checkbox' id='aed-2' name='aed-2' />
                    </span>
                </div>
                <div class='flex flex-row'>
                    <span>
                        <label for='kit-3'>Kit 3</label>
                        <input type='checkbox' id='kit-3' name='kit-3' />
                    </span>
                    <span>
                        <label for='airway-3'>O<sub>2</sub> 3</label>
                        <input type='checkbox' id='airway-3' name='airway-3' />
                    </span>
                    <span>
                        <label for='aed-3'>AED 3</label>
                        <input type='checkbox' id='aed-3' name='aed-3' />
                    </span>
            </div>

            
            <textarea id="other-equipment" name="other-equipment" placeholder="Other Equipment" />

            <h2>Vehicles</h2>

            
            <h2>Comments</h2>
            <textarea id="comments" name="comments" placeholder="Comments, Notes, or Member Issues" />
        </section>

        <section>
            <h1>Review and Submit</h1>
            
        </section>
    </form>
</main>