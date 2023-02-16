<script lang="ts">
	import { getRank, LEADERSHIP_DEPARTMENTS, ROLE_GROUPS, ROLE_RANKING } from '$lib/utils/auth';
	import type { Role, User } from '@prisma/client';
	import { Input, Label, Modal, Select, Button } from 'flowbite-svelte';
	import _ from 'lodash';
	import type { PageData } from './$types';

	export let data: PageData;
	const { users } = data;

	const membersForRoles = (roles: Role[]): User[] =>
		_.sortBy(
			users.filter((user: User) => roles.includes(user.role)),
			[(user) => -getRank(user.role), (user) => user.lastName]
		);

	let showUserEditModal = data.activeUser.id.length > 0;
	let userEditModalSelection: Omit<User, 'refreshToken'> = data.activeUser;

	const rankOptions = ROLE_RANKING.map((rank) => ({ value: rank, name: rank }));
	const deptOptions = LEADERSHIP_DEPARTMENTS.map((dept) => ({ value: dept, name: dept }));
</script>

<main class="sm:border sm:mx-10 sm:rounded-lg">
	<div class="relative overflow-x-auto shadow-md">
		<table class="w-full max-w-screen-md text-sm text-left text-gray-500 dark:text-gray-400">
			<thead class="text-xs uppercase bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
				<tr>
					<td class="px-6 py-3">First Name</td>
					<td class="px-6 py-3">Last Name</td>
					<td class="px-6 py-3">Email</td>
					<td class="px-6 py-3">Alliance #</td>
					<td class="px-6 py-3">User ID</td>
					<td class="px-6 py-3">Rank</td>
					<td class="px-6 py-3">Department</td>
				</tr>
			</thead>

			<tbody>
				{#each ROLE_GROUPS as [selectedGroup, selectedRoles]}
					<tr>
						<td colspan="100">{selectedGroup}</td>
					</tr>
					{#each membersForRoles(selectedRoles) as user (user.id)}
						<tr
							class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
							on:click={() => {
								showUserEditModal = true;
								userEditModalSelection = user;
							}}
						>
							<td class="px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
								{user.firstName}
							</td>
							<td class="px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
								{user.lastName}
							</td>
							<td class="px-6 py-3">{user.email}</td>
							<td class="px-6 py-3">{user.contId}</td>
							<td class="px-6 py-3">{user.id}</td>
							<td class="px-6 py-3">{user.role}</td>
							<td class="px-6 py-3">{user.dept}</td>
						</tr>
					{/each}
				{/each}
			</tbody>
		</table>
	</div>

	<Modal bind:open={showUserEditModal} title="Edit User" size="lg">
		<form method="POST" action="?/editUser">
			User ID: <h1>{userEditModalSelection.id}</h1>
			<input type="hidden" name="id" bind:value={userEditModalSelection.id} />
			<br />
			<p>
				<span class="text-red-600">Danger:</span> use extreme caution when editing users name, email,
				or alliance number. Ensure that fields are consistent with the spreadsheets; otherwise, this
				may cause major errors with the system.
			</p>
			<div class="grid gap-6 md:grid-cols-2">
				<div>
					<Label for="firstName">First Name</Label>
					<Input
						type="text"
						id="firstName"
						name="firstName"
						bind:value={userEditModalSelection.firstName}
						required
					/>
				</div>
				<div>
					<Label for="lastName">Last Name</Label>
					<Input
						type="text"
						id="lastName"
						name="lastName"
						bind:value={userEditModalSelection.lastName}
						required
					/>
				</div>
				<div>
					<Label for="email">Email</Label>
					<Input
						type="email"
						id="email"
						name="email"
						bind:value={userEditModalSelection.email}
						required
						readonly
					/>
				</div>
				<div>
					<Label for="allianceNumber">Alliance Number (SJA ID)</Label>
					<Input
						type="text"
						id="allianceNumber"
						name="allianceNumber"
						bind:value={userEditModalSelection.contId}
						required
					/>
				</div>
				<div>
					<Label for="role">Rank</Label>
					<Select
						id="role"
						name="role"
						items={rankOptions}
						bind:value={userEditModalSelection.role}
						required
					/>
				</div>
				<div>
					<Label for="department">Leadership Department</Label>
					<Select
						id="department"
						name="dept"
						items={deptOptions}
						bind:value={userEditModalSelection.dept}
						required
					/>
				</div>
			</div>
			<div class="flex justify-center space-x-6 mt-6">
				<button type="submit">Save</button>
				<button color="red" formaction="?/deleteUser">Delete</button>
			</div>
		</form>
	</Modal>
</main>
