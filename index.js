const Discord = require('discord.js');
const moment = require('moment');
const abakus = require('./providers/abakus');
const tihlde = require('./providers/tihlde');
const online = require('./providers/online');
const config = require('./config');
const {discordWebhookUrl, discordWebhookID, discordWebhookToken} = config;

// Set the locale for the deadline
moment.locale(config.deadlineTimeLocale);

// Check if either Discord Webhook URL or Discord Webhook ID and token is provided
if (!(discordWebhookUrl || (discordWebhookID !== '' && discordWebhookToken !== ''))) {
    throw new Error('You need to specify either Discord Webhook URL or both Discord Webhook ID and token!');
}

// Retrieve the ID and token from the Webhook URL
// This is from the Discord Webhook URL format:
// 'https://discordapp.com/api/webhooks/<ID_HERE>/<TOKEN_HERE>'
// If the Webhook URL is empty get the values from the provided ID and token
const [webhookID, webhookToken] = discordWebhookUrl ? discordWebhookUrl.split('/').splice(5, 2) : [discordWebhookID, discordWebhookToken];

const discordHookClient = new Discord.WebhookClient(webhookID, webhookToken);

// Wait for a specified time (milliseconds)
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

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

(async () => {
    // Make it run forever
    while (true) {
        try {
            // Log the time of the job search
            console.log('Searching for jobs at: ', new Date());

            // Retrieve all new job listings at the websites for Abakus, Online and TIHLDE with the specified configurations
            const abakusListingsPromise = abakus.getNewJobListings();
            const onlineListingsPromise = online.getNewJobListings();
            const tihldeListingsPromise = tihlde.getNewJobListings();

            const jobListingsArray = await Promise.all([abakusListingsPromise, onlineListingsPromise, tihldeListingsPromise]);
            const jobListings = jobListingsArray.reduce((previous, current) => {
                // Check if current element is not an array
                if (!Array.isArray(current)) {
                    return previous;
                }

                return previous.concat(current);
            }, []);

            // Loop all job listings and send messages one by one
            jobListings.forEach(jobListing => {
                const embedMessage = new Discord.MessageEmbed()
                    .setColor(embedChatColors[jobListing.source])
                    .setTitle('📰 **New Listing** 📰')
                    .setThumbnail(embedChatIcons[jobListing.source])
                    .addField('Title', jobListing.title)
                    .addField('Company', jobListing.company)
                    .addField('Deadline', moment(jobListing.deadline).format(config.deadlineTimeFormat))
                    .addField('URL', `View the job listing [here](${jobListing.url})`);

                discordHookClient.send(embedMessage);
            });
        } catch (error) {
            console.log(error);
        } finally {
            try {
                await wait(config.waitTimeout);
            } catch (timeoutError) {
                console.log(timeoutError);
            }
        }
    }
})();