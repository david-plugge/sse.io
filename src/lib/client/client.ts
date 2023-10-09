import type { SseEvents } from '$lib/types';

export type UnsubscribeFunc = () => Promise<void>;

interface ClientOptions {
	fetch?: typeof window.fetch;
}

export class Client<Events extends SseEvents = SseEvents> {
	clientId = '';

	private eventSource: EventSource | null = null;
	private readonly subscriptions = new Map<string, EventListener[]>();

	constructor(url: string | URL, options: ClientOptions = {}) {}

	get isConnected(): boolean {
		return true; // TODO:
	}

	async subscribe<K extends keyof Events & string>(topic: K, listener: Events[K]) {
		const callback = (e: MessageEvent) => {
			let data;
			try {
				data = JSON.parse(e.data);
			} catch {}

			listener(...data);
		};

		if (!this.subscriptions.has(topic)) {
			this.subscriptions.set(topic, []);
		}
		const cbs = this.subscriptions.get(topic)!;
		cbs.push(listener);

		if (!this.isConnected) {
			// initialize sse connection
			await this.connect();
		} else if (cbs.length === 1) {
			// send updated subscriptions
			await this.submitSubscriptions();
		} else {
			// register the listener
			this.eventSource?.addEventListener(topic, callback);
		}

		return async () => {
			return this.unsubscribeByTopicAndListener(topic, listener);
		};
	}

	async unsubscribe(topic?: keyof Events & string) {
		if (!this.hasSubscriptionListeners(topic)) {
			return;
		}

		if (!topic) {
			this.subscriptions.clear();
		} else {
			const cbs = this.subscriptions.get(topic)!;
			if (this.eventSource) {
				for (let listener of cbs) {
					this.eventSource.removeEventListener(topic, listener);
				}
			}
			this.subscriptions.delete(topic);
		}

		if (!this.hasSubscriptionListeners()) {
			this.disconnect();
		} else if (!this.hasSubscriptionListeners(topic)) {
			await this.submitSubscriptions();
		}
	}

	async unsubscribeByTopicAndListener<K extends keyof Events & string>(
		topic: K,
		listener: Events[K]
	) {
		const subscriptions = this.subscriptions.get(topic);
		if (!Array.isArray(subscriptions) || !subscriptions.length) {
			return;
		}

		let exists = false;
		for (let i = subscriptions.length - 1; i >= 0; i--) {
			if (subscriptions[i] !== listener) {
				continue;
			}

			exists = true; // atleast one matching listener
			delete subscriptions[i]; // remove function reference
			subscriptions.splice(i, 1); // reindex array
			this.eventSource?.removeEventListener(topic, listener);
		}
		if (!exists) {
			return;
		}

		// remove the topic from the subscriptions list if there are no other listeners
		if (!subscriptions.length) {
			this.subscriptions.delete(topic);
		}

		if (!this.hasSubscriptionListeners()) {
			// no other active subscriptions -> close the sse connection
			this.disconnect();
		} else if (!this.hasSubscriptionListeners(topic)) {
			// submit subscriptions change if there are no other active subscriptions related to the topic
			await this.submitSubscriptions();
		}
	}

	private hasSubscriptionListeners(topic?: string) {
		if (topic) {
			return !!this.subscriptions.get(topic)?.length;
		}

		for (let topic in this.subscriptions) {
			if (!!this.subscriptions.get(topic)!.length) {
				return true;
			}
		}

		return false;
	}

	submitSubscriptions() {
		throw new Error('Method not implemented.');
	}

	connect() {
		throw new Error('Method not implemented.');
	}

	disconnect() {
		throw new Error('Method not implemented.');
	}
}
