<script>
	import NavBar from "$lib/components/NavBar.svelte";
</script>

<div class="flex-1">
	<NavBar />
	<div class="pt-12 sm:pt-4 p-1 sm:ml-72">
		<slot />
	</div>
</div>
