<script lang="ts">
	import { onMount } from 'svelte';

	// const client: any = {};

	// const unsub = client.subscribe('test', () => {

	// })

	interface promiseCallbacks {
		resolve: Function;
		reject: Function;
	}

	class Client {
		private pendingSubscriptions: promiseCallbacks[] = [];
		private submitTimeout: ReturnType<typeof setTimeout> | null = null;

		subscribe() {
			const promise = new Promise((resolve, reject) => {
				this.pendingSubscriptions.push({
					reject,
					resolve
				});

				if (!this.submitTimeout) {
					this.submitTimeout = setTimeout(() => this.submitSubscriptions());
				}
			});

			return () => {};
		}

		private async submitSubscriptions() {
			this.submitTimeout = null;

			try {
				await new Promise((res) => setTimeout(res, 1000));

				for (let subscription of this.pendingSubscriptions) {
					subscription.resolve();
				}
			} catch {
				for (let subscription of this.pendingSubscriptions) {
					subscription.reject();
				}
			} finally {
				this.pendingSubscriptions = [];
			}
		}
	}

	onMount(async () => {
		const client = new Client();

		await client.subscribe();
		console.log('subscribed 1');
		await client.subscribe();
		console.log('subscribed 2');
	});
</script>
