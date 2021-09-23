import {MessageEmbed, WebhookClient} from 'discord.js';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
// eslint-disable-next-line import/no-unresolved
import {setTimeout} from 'timers/promises';
import abakus from './providers/abakus.js';
import tihlde from './providers/tihlde.js';
import online from './providers/online.js';
import config from './config.js';

// Use extended formatting
dayjs.extend(advancedFormat);

const {discordWebhookUrl, discordWebhookId, discordWebhookToken} = config;

// Check if either Discord Webhook URL or Discord Webhook ID and token is provided
if (!(discordWebhookUrl || (discordWebhookId !== '' && discordWebhookToken !== ''))) {
    throw new Error('You need to specify either Discord Webhook URL or both Discord Webhook ID and token!');
}

const webhookClient = discordWebhookUrl ? new WebhookClient({url: discordWebhookUrl}) : new WebhookClient({id: discordWebhookId, token: discordWebhookToken});
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

(async () => {
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
            const jobListings = jobListingsArray.reduce((previous, current) => {
                // Check if current element is not an array
                if (!Array.isArray(current)) {
                    return previous;
                }

                return previous.concat(current);
            }, []);

            // Loop all job listings and send messages one by one
            for (let i = 0; i < jobListings.length; i++) {
                const jobListing = jobListings[i];
                const embedMessage = new MessageEmbed()
                    .setColor(embedChatColors[jobListing.source])
                    .setTitle('📰 **New Listing** 📰')
                    .setThumbnail(embedChatIcons[jobListing.source])
                    .addField('Title', jobListing.title)
                    .addField('Company', jobListing.company)
                    .addField('Deadline', dayjs(jobListing.deadline).format(config.deadlineTimeFormat))
                    .addField('URL', `View the job listing [here](${jobListing.url})`);

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
})();
