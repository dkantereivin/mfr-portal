<script lang="ts">
	import { fade } from 'svelte/transition';
	type CarouselImage = {
		title: string;
		src: string;
	};

	export let name: string = 'Carousel';
	export let images: CarouselImage[];
	export let interval: number = 5;
	export let idx: number = 0;
	export const getItemId = (idx: number) => `${name}-item-${idx}`;

	export const next = () => idx++;
	setInterval(next, interval * 1000);

	$: ({ title, src } = images[idx % images.length]);
</script>

<div class="">
	<!-- {#each [images[idx % images.length]] as {title, src}} -->
	<img transition:fade {src} alt={title} />
	<!-- {/each} -->
</div>

<!-- <ul class='flex overflow-x-auto gap-6 snap-x snap-mandatory'>
    {#each images as {title, src}, index}
        <li id={getItemId(index)} class='shrink-0 snap-center'>
            <img {title} {src} alt={title} />
        </li>
    {/each}
</ul> -->

<!-- <nav>
    {#each images as {title, src}, index}
    <li class=''>
        <a href={`#${getItemId(index)}`}>{title}</a>
    </li>
    {/each}
</nav> -->
