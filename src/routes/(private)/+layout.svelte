<script>
	import NavBar from "$lib/components/NavBar.svelte";
</script>

<div class="flex-1 flex">
	<NavBar />
	<div class="pt-12 sm:pt-4 p-1">
		<slot />
	</div>
</div>
