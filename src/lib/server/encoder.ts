import type { SseEvent } from '../types';

export class EventEncoder extends TransformStream<SseEvent, string> {
	constructor() {
		super({
			transform(chunk, controller) {
				let msg = '';

				if (chunk.event !== 'message') {
					msg += `event: ${chunk.event}\n`;
				}

				if (typeof chunk.id !== 'undefined') {
					msg += `id: ${chunk.id}\n`;
				}

				if (chunk.data) {
					const body =
						typeof chunk.data === 'object' ? JSON.stringify(chunk.data) : String(chunk.data);
					msg += body
						.split(/[\r\n]+/)
						.map((str) => `data: ${str}`)
						.join('\n');
				}

				const packet = msg + '\n\n';
				controller.enqueue(packet);
			}
		});
	}
}
