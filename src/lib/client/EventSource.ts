import { EventDecoder } from './decoder';
import { iterateStream } from './utils';

interface EventSourceOptions extends EventSourceInit, Omit<RequestInit, 'cache' | 'signal'> {}

export interface EventSource extends EventTarget {
	addEventListener<K extends keyof EventSourceEventMap>(
		type: K,
		listener: (this: EventSource, ev: EventSourceEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions
	): void;
	addEventListener(
		type: string,
		listener: (this: EventSource, event: MessageEvent) => any,
		options?: boolean | AddEventListenerOptions
	): void;
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions
	): void;
	removeEventListener<K extends keyof EventSourceEventMap>(
		type: K,
		listener: (this: EventSource, ev: EventSourceEventMap[K]) => any,
		options?: boolean | EventListenerOptions
	): void;
	removeEventListener(
		type: string,
		listener: (this: EventSource, event: MessageEvent) => any,
		options?: boolean | EventListenerOptions
	): void;
	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | EventListenerOptions
	): void;
}

export class EventSource extends EventTarget implements globalThis.EventSource {
	static CONNECTING = 0 as const;
	static OPEN = 1 as const;
	static CLOSED = 2 as const;

	private _ac?: AbortController;
	private _readyState: number = 0;

	readonly url: string;
	readonly withCredentials: boolean;

	constructor(url: string | URL, eventSourceInitDict?: EventSourceOptions) {
		const { withCredentials, ...requestInit } = eventSourceInitDict ?? {};

		super();
		this.url = url.toString();
		this.withCredentials =
			withCredentials ?? (requestInit.credentials ? requestInit.credentials === 'include' : true);

		this._ac = new AbortController();

		this._ac.signal.addEventListener('abort', (e) => {
			this._readyState = this.CLOSED;
			this.dispatchEvent(new Event('error'));
		});

		fetch(this.url, {
			...requestInit,
			headers: {
				...requestInit.headers,
				accept: 'text/event-stream',
				connection: 'keep-alive'
			},
			cache: 'no-cache',
			signal: this._ac.signal,
			credentials: requestInit.credentials ?? this.withCredentials ? 'include' : 'omit'
		})
			.then(async (response) => {
				if (!response.body) {
					throw new Error('Invalid response');
				}

				this._readyState = this.OPEN;
				this.dispatchEvent(new Event('open'));

				const stream = response.body.pipeThrough(new EventDecoder());

				for await (const value of iterateStream(stream)) {
					this.dispatchEvent(
						new MessageEvent(value.event ?? 'message', {
							data: value.data,
							lastEventId: value.id
						})
					);
				}
				this.close();
			})
			.catch(() => {
				this.close();
			});
	}

	close() {
		this._ac?.abort();
	}

	get readyState() {
		return this._readyState;
	}

	get CONNECTING() {
		return EventSource.CONNECTING;
	}
	get OPEN() {
		return EventSource.OPEN;
	}
	get CLOSED() {
		return EventSource.CLOSED;
	}

	set onerror(callback: (this: globalThis.EventSource, ev: Event) => any) {
		this.addEventListener('error', callback);
	}
	set onmessage(callback: (this: globalThis.EventSource, ev: MessageEvent<any>) => any) {
		this.addEventListener('message', callback as any);
	}
	set onopen(callback: (this: globalThis.EventSource, ev: Event) => any) {
		this.addEventListener('open', callback);
	}
}

export function polyfillEventSource() {
	if (!globalThis.EventSource) {
		globalThis.EventSource = EventSource;
	}
}

export function getEventSource() {
	return globalThis.EventSource ?? EventSource;
}
