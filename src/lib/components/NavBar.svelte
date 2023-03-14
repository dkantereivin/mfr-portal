<script lang="ts">
	import {
		CloseButton,
		Sidebar,
		SidebarDropdownItem,
		SidebarDropdownWrapper,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper
	} from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	import { hasRank } from '$lib/utils/auth';
	import { LeadershipDepartment, Role } from '$lib/models/client';
	import { page } from '$app/stores';

	let hidden = true;

	// TODO: animation
	const transitionParams = {
		transitionType: 'fly',
		x: -320,
		duration: 200,
		easing: sineIn
	};
</script>

<nav>
	{#if hidden}
		<button
			on:click={() => (hidden = !hidden)}
			type="button"
			class="fixed inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
		>
			<span class="sr-only">Open sidebar</span>
			<svg
				class="w-6 h-6"
				aria-hidden="true"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					clip-rule="evenodd"
					fill-rule="evenodd"
					d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
				/>
			</svg>
		</button>
	{/if}
	<img
		src="/favicon/favicon-32x32.png"
		class="fixed right-5 mt-2 md:hidden"
		alt="St John Ambulance Logo"
	/>
	<Sidebar asideClass="w-72 fixed z-50 sm:block {hidden && 'hidden'}">
		<SidebarWrapper
			divClass="overflow-y-auto py-4 px-3 bg-gray-50 rounded dark:bg-gray-800 h-screen flex flex-col"
		>
			<header class="flex items-center mb-2">
				<h5 class="text-base font-semibold text-gray-500 uppercase">Menu</h5>
				<CloseButton
					on:click={() => {
						hidden = !hidden;
					}}
					class="mb-4 dark:text-white sm:hidden"
				/>
			</header>
			<section class="flex-1 flex flex-col justify-between">
				<SidebarGroup>
					<SidebarItem label="Dashboard" href="/dashboard">
						<svelte:fragment slot="icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-6 h-6"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
								/><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
								/></svg
							>
						</svelte:fragment>
					</SidebarItem>
					{#if hasRank( $page.data.user, Role.CORPORAL, [LeadershipDepartment.ADMINISTRATION, LeadershipDepartment.TRAINING] )}
						<SidebarDropdownWrapper label="Attendance">
							<svelte:fragment slot="icon">
								<img src="/icons/checklist.svg" alt="Attendance" class="w-6 h-6" />
							</svelte:fragment>
							<SidebarDropdownItem label="Check In" href="/attendance/checkin" />
							<SidebarDropdownItem label="Code" href="/attendance/qr" />
							<SidebarDropdownItem label="Manage" href="/attendance/manage" />
						</SidebarDropdownWrapper>
					{:else}
						<SidebarItem label="Attendance" href="/attendance/checkin">
							<svelte:fragment slot="icon">
								<img src="/icons/checklist.svg" alt="Attendance" class="w-6 h-6" />
							</svelte:fragment>
						</SidebarItem>
					{/if}
					<SidebarItem label="Event Forms" spanClass="flex-1 ml-3 whitespace-nowrap">
						<svelte:fragment slot="icon">
							<img src="/icons/event-form.svg" alt="Event Forms" class="w-6 h-6" />
						</svelte:fragment>
						<svelte:fragment slot="subtext">
							<span
								class="inline-flex justify-center items-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full"
							>
								Soon
							</span>
						</svelte:fragment>
					</SidebarItem>
					<SidebarItem label="Inbox" spanClass="flex-1 ml-3 whitespace-nowrap">
						<svelte:fragment slot="icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-6 h-6"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3"
								/></svg
							>
						</svelte:fragment>
						<svelte:fragment slot="subtext">
							<span
								class="inline-flex justify-center items-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full"
							>
								Soon
							</span>
						</svelte:fragment>
					</SidebarItem>
					{#if hasRank($page.data.user, Role.CORPORAL)}
						<SidebarItem label="Manage Members" href="/admin/users">
							<svelte:fragment slot="icon">
								<img src="/icons/users.svg" alt="Members" class="w-6 h-6" />
							</svelte:fragment>
						</SidebarItem>
					{/if}
				</SidebarGroup>

				<SidebarGroup border ulClass="space-y-2">
					<SidebarItem label="Sign Out" href="/logout">
						<svelte:fragment slot="icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-6 h-6"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
								/></svg
							>
						</svelte:fragment>
					</SidebarItem>
					<SidebarItem label="Account Settings">
						<svelte:fragment slot="icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-6 h-6"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
								/></svg
							>
						</svelte:fragment>
					</SidebarItem>
					<SidebarItem label="Help">
						<svelte:fragment slot="icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-6 h-6"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796a3.765 3.765 0 00-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 01-1.388.88m2.268-2.268l4.138 3.448m0 0a9.027 9.027 0 01-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0l-3.448-4.138m3.448 4.138a9.014 9.014 0 01-9.424 0m5.976-4.138a3.765 3.765 0 01-2.528 0m0 0a3.736 3.736 0 01-1.388-.88 3.737 3.737 0 01-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 01-1.652-1.306 9.027 9.027 0 01-1.306-1.652m0 0l4.138-3.448M4.33 16.712a9.014 9.014 0 010-9.424m4.138 5.976a3.765 3.765 0 010-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 011.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 00-1.652 1.306A9.025 9.025 0 004.33 7.288"
								/></svg
							>
						</svelte:fragment>
					</SidebarItem>
				</SidebarGroup>
			</section>
		</SidebarWrapper>
	</Sidebar>
</nav>
