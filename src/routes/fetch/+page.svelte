<script lang="ts">
	import { EventDecoder } from '$lib/client/decoder';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let state = 'closed';
	const messages = writable<any[]>([]);

	onMount(() => {
		const ac = new AbortController();

		async function connect() {
			const response = await fetch('/sse', {
				headers: {
					accept: 'text/event-stream',
					connection: 'keep-alive'
				},
				cache: 'no-cache',
				signal: ac.signal
			});

			if (!response.body) return;

			const stream = response.body.pipeThrough(new EventDecoder());

			const reader = stream.getReader();

			for (;;) {
				const result = await reader.read();

				if (result.done) {
					break;
				}

				messages.update((m) => {
					m.push(result.value);
					return m;
				});
			}
		}

		connect();

		return () => {
			ac.abort();
		};
	});
</script>

<div>
	State: {state}
</div>

<div>
	{#each $messages as item}
		<div>
			<pre>{JSON.stringify(item, null, 2)}</pre>
		</div>
	{/each}
</div>
