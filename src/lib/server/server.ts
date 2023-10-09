import type { SseEvents } from '../types';
import { Adapter } from './adapter';
import { BroadcastEmitter } from './broadcast';
import { Client } from './client';

export class Server<Events extends SseEvents = SseEvents> {
	private readonly adapter = new Adapter();

	handle(clientId: string) {
		let client: Client;

		const ac = new AbortController();
		const stream = new ReadableStream({
			start: (controller) => {
				client = new Client(clientId, controller, ac.signal, stream, this.adapter);
			},
			cancel: (reason) => {
				ac.abort(reason);
			}
		});

		return stream;
	}

	to(...targets: string[]) {
		return new BroadcastEmitter<Events>(new Set(targets), new Set(), this.adapter);
	}

	except(...targets: string[]) {
		return new BroadcastEmitter<Events>(new Set(targets), new Set(), this.adapter);
	}

	emit<K extends keyof Events & string>(event: K, ...args: Parameters<Events[K]>) {
		this.adapter.emit(new Set(this.adapter.clients.keys()), new Set(), event, args);
	}

	join(clientId: string, channels: string[]) {
		return this.adapter.join(clientId, channels);
	}

	leave(clientId: string, channels: string[]) {
		return this.adapter.leave(clientId, channels);
	}
}

export function sse(stream: ReadableStream, init?: ResponseInit) {
	return new Response(stream, {
		...init,
		headers: {
			...init?.headers,
			'Content-Type': 'text/event-stream;charset=utf-8',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
}
