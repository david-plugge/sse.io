import type { Client } from './client';
import { SetMap } from './setmap';

export class Adapter {
	readonly clients = new Map<string, Client>();
	readonly channels = new SetMap<string, Client>();

	add(client: Client) {
		this.clients.set(client.id, client);
	}

	remove(client: Client) {
		for (const channel of client.channels) {
			this.channels.delete(channel, client);
		}
		this.clients.delete(client.id);
	}

	join(clientId: string, channels: string[]) {
		const client = this.clients.get(clientId);
		if (client) {
			for (const channel of channels) {
				this.channels.add(channel, client);
				client.channels.add(channel);
			}
		}
	}

	leave(clientId: string, channels: string[]) {
		const client = this.clients.get(clientId);
		if (client) {
			for (const channel of channels) {
				this.channels.delete(channel, client);
				client.channels.delete(channel);
			}
		}
	}

	emit(include: Set<string>, exclude: Set<string>, event: string, args: unknown[]) {
		const to = new Set<Client>();

		for (const id of include) {
			if (exclude.has(id)) {
				continue;
			}

			const clients = this.channels.get(id);
			if (clients) {
				for (const client of clients) {
					if (!exclude.has(client.id)) {
						to.add(client);
					}
				}
			}
		}

		for (const client of to) {
			// TODO:
		}
	}
}
