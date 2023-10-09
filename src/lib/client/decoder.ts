import type { SseEvent } from '../types';

const WHITESPACE = 32;
const COLON = 58;
const NEWLINE = 10;

export class EventDecoder extends TransformStream<Uint8Array, SseEvent> {
	constructor() {
		const decoder = new TextDecoder();
		super({
			transform(chunk, controller) {
				const fields: Record<string, string> = {};

				let label!: string;
				let state = 0; // 0 label, 1 whitespace, 2 content
				let start = 0;

				for (let i = 0; i < chunk.length; i++) {
					if (state === 0) {
						if (chunk[i] === COLON) {
							label = decoder.decode(chunk.subarray(start, i));
							state = 1;
						}
					} else if (state === 1) {
						if (chunk[i] === WHITESPACE) {
							++i;
						}
						start = i;
						state = 2;
					} else if (state === 2) {
						if (chunk[i] === NEWLINE) {
							fields[label] = decoder.decode(chunk.subarray(start, i));

							start = ++i;
							state = 0;
						}
					}
				}

				controller.enqueue(fields);
			}
		});
	}
}
