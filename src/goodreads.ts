import { parseHTML } from 'linkedom';

const URL = 'https://www.goodreads.com/user/show/4179156-terry';

async function fetchGoodreads() {
	const response = await fetch(URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${URL}: ${response.statusText}`);
	}
	const html = await response.text();
	const { document } = parseHTML(html);
	const current = document.getElementById('currentlyReadingReviews');
	const title = current.getElementsByClassName('bookTitle')?.at(0);
	const author = current.getElementsByClassName('authorName')?.at(0);
	const image = current.querySelector('a > img');
	const progress = current.querySelector('a.greyText.smallText');

	const currentBook = {
		title: title?.innerHTML,
		author: author?.innerHTML,
		image: image?.getAttribute('src'),
		progress: progress?.innerText?.replace(/\(|\)/g, ''),
	};
	return currentBook;
}

fetchGoodreads();
