export async function* iterateStream<T>(stream: ReadableStream<T>): AsyncIterableIterator<T> {
	const reader = stream.getReader();

	for (;;) {
		const result = await reader.read();

		if (result.done) {
			break;
		}

		yield result.value;
	}

	reader.releaseLock();
}
