import {EmbedBuilder} from 'discord.js';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import {setTimeout} from 'node:timers/promises';
import discordWebhookWrapper from 'discord-webhook-wrapper';
import abakus from './providers/abakus.js';
import tihlde from './providers/tihlde.js';
import online from './providers/online.js';
import config from './config.js';

// Use extended formatting
dayjs.extend(advancedFormat);

const webhookClient = discordWebhookWrapper(config);
const webhookUsername = 'Job Listing Notifier';

// Color for the left border on embed chat messages
const embedChatColors = {
	abakus: '#db3737',
	tihlde: '#1d448c',
	online: '#fab759'
};

const embedChatIcons = {
	abakus: config.abakusLogoUrl,
	online: config.onlineLogoUrl,
	tihlde: config.tihldeLogoUrl
};

async function initializeLocale() {
	// Load dayjs locale if it's not the default `en` (English)
	if (config.deadlineTimeLocale !== 'en') {
		await import(`dayjs/locale/${config.deadlineTimeLocale}.js`);
	}

	// Set the locale for the deadline
	dayjs.locale(config.deadlineTimeLocale);
}

await initializeLocale();

// Make it run forever
while (true) {
	try {
		// Log the time of the job search
		console.log('Searching for jobs at:', new Date());

		// Retrieve all new job listings at the websites for Abakus, Online and TIHLDE with the specified configurations
		const abakusListingsPromise = abakus.getNewJobListings();
		const onlineListingsPromise = online.getNewJobListings();
		const tihldeListingsPromise = tihlde.getNewJobListings();

		// eslint-disable-next-line no-await-in-loop
		const jobListingsArray = await Promise.all([abakusListingsPromise, onlineListingsPromise, tihldeListingsPromise]);
		// eslint-disable-next-line unicorn/no-array-reduce
		const jobListings = jobListingsArray.reduce((previous, current) => {
			// Check if current element is not an array
			if (!Array.isArray(current)) {
				return previous;
			}

			return [...previous, ...current];
		}, []);

		// Loop all job listings and send messages one by one
		// eslint-disable-next-line no-restricted-syntax
		for (const jobListing of jobListings) {
			const embedMessage = new EmbedBuilder()
				.setColor(embedChatColors[jobListing.source])
				.setTitle('📰 **New Listing** 📰')
				.setThumbnail(embedChatIcons[jobListing.source])
				.addFields({name: 'Title', value: jobListing.title})
				.addFields({name: 'Company', value: jobListing.company})
				.addFields({name: 'Deadline', value: dayjs(jobListing.deadline).format(config.deadlineTimeFormat)})
				.addFields({name: 'URL', value: `View the job listing [here](${jobListing.url})`});

			// eslint-disable-next-line no-await-in-loop
			await webhookClient.send({
				username: webhookUsername,
				embeds: [embedMessage]
			});
		}
	} catch (error) {
		console.log(error);
	} finally {
		// eslint-disable-next-line no-await-in-loop
		await setTimeout(config.waitTimeout);
	}
}
