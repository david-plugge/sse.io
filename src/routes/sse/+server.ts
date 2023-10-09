export const GET = async () => {
	const ac = new AbortController();

	const stream = new ReadableStream({
		start: (controller) => {
			console.log('start');

			let i = 0;

			const interval = setInterval(() => {
				controller.enqueue(`id: ${i}\ndata: helloooo\n\n`);

				if (++i === 5) {
					clearInterval(interval);
				}
			}, 1000);

			ac.signal.addEventListener('abort', () => {
				clearInterval(interval);
			});
		},
		cancel: (reason) => {
			console.log('cancel', reason);
			ac.abort(reason);
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream;charset=utf-8',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
