import type { Adapter } from './adapter';

export class Client {
	readonly channels = new Set<string>();

	constructor(
		readonly id: string,
		readonly controller: ReadableStreamDefaultController<any>,
		readonly signal: AbortSignal,
		readonly stream: ReadableStream<any>,
		readonly adapter: Adapter
	) {}
}
