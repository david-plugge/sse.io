<script lang="ts">
	import { EventSource } from '$lib/client';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let state = 'closed';
	const messages = writable<string[]>([]);

	onMount(() => {
		const sse = new EventSource('/sse', {
			withCredentials: false
		});

		sse.addEventListener('open', () => {
			state = 'open';
		});
		sse.addEventListener('error', () => {
			state = 'error';
		});
		sse.addEventListener('message', (ev) => {
			messages.update((m) => {
				m.push(ev.data);
				return m;
			});
		});

		return () => {
			sse.close();
		};
	});
</script>

<div>
	State: {state}
</div>

<div>
	{#each $messages as item}
		<div>
			{item}
		</div>
	{/each}
</div>
