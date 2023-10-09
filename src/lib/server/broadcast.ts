import type { SseEvents } from '$lib/types';
import type { Adapter } from './adapter';

export class BroadcastEmitter<Events extends SseEvents = SseEvents> {
	constructor(
		private include: Set<string>,
		private exclude: Set<string>,
		private readonly adapter: Adapter
	) {}

	to(...targets: string[]) {
		this.include = new Set([...this.include, ...targets]);
		return this;
	}
	expect(...targets: string[]) {
		this.exclude = new Set([...this.exclude, ...targets]);
		return this;
	}
	emit<K extends keyof Events & string>(event: K, ...args: Parameters<Events[K]>) {
		this.adapter.emit(this.include, this.exclude, event, args);
	}
}
