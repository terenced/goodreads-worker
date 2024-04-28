import { parseHTML } from 'linkedom';

async function fetchGoodreads(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	}
	const html = await response.text();
	const { document } = parseHTML(html);
	const current = document.getElementById('currentlyReadingReviews');
	const title = current.getElementsByClassName('bookTitle')?.at(0);
	const author = current.getElementsByClassName('authorName')?.at(0);
	const image = current.querySelector('a > img');
	const progress = current.querySelector('a.greyText.smallText');

	const currentlyReading = {
		title: title?.innerHTML,
		author: author?.innerHTML,
		image: image?.getAttribute('src'),
		progress: progress?.innerText?.replace(/\(|\)/g, ''),
	};
	return currentlyReading;
}

export default {
	async scheduled(event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
		try {
			const currentlyReading = await fetchGoodreads(env.GOODREADS_URL);
			console.log(`currently reading trigger at ${event.cron}`, currentlyReading);

			await env.SB_KV.put('currently-reading', JSON.stringify(currentlyReading), {
				metadata: { timestamp: event.cron },
			});
		} catch (err) {
			await env.SB_KV.put('currently-reading-error', JSON.stringify(err), {
				metadata: {
					timestamp: event.cron,
				},
			});
			console.error(`error in trigger at ${event.cron}`, err);
		}
	},
};
