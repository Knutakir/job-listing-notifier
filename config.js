import dotenv from 'dotenv';

// Load the stored variables from `.env` file into process.env
dotenv.config();

// Default is 60 minutes for the wait timeout
const MILLISECONDS_IN_HOUR = 3_600_000;

export default {
	discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
	discordWebhookId: process.env.DISCORD_WEBHOOK_ID || '',
	discordWebhookToken: process.env.DISCORD_WEBHOOK_TOKEN || '',
	waitTimeout: process.env.WAIT_TIMEOUT || MILLISECONDS_IN_HOUR,
	abakusAPIUrl: process.env.ABAKUS_API_URL || 'https://lego.abakus.no/api/v1/joblistings/',
	onlineAPIUrl: process.env.ONLINE_API_URL || 'https://old.online.ntnu.no/api/v1/career/?format=json',
	tihldeAPIUrl: process.env.TIHLDE_API_URL || 'https://api.tihlde.org/jobposts/?format=json',
	abakusListingUrlPath: process.env.ABAKUS_LISTING_URL_PATH || 'https://abakus.no/joblistings/',
	onlineListingUrlPath: process.env.ONLINE_LISTING_URL_PATH || 'https://online.ntnu.no/careeropportunity/',
	tihldeListingUrlPath: process.env.TIHLDE_LISTING_URL_PATH || 'https://tihlde.org/karriere/',
	abakusLogoUrl: process.env.ABAKUS_LOGO_URL || 'https://abakus.no/icon-256x256.png',
	onlineLogoUrl: process.env.ONLINE_LOGO_URL || 'https://online.ntnu.no/wiki/70/plugin/attachments/download/682/',
	tihldeLogoUrl: process.env.TIHLDE_LOGO_URL || 'https://tihlde.org/browser-icons/apple-icon-114x114.png',
	abakusJobType: process.env.ABAKUS_JOB_TYPE || 'full_time',
	onlineJobType: process.env.ONLINE_JOB_TYPE || 'Fastjobb',
	jobLocation: process.env.JOB_LOCATION || 'Trondheim',
	deadlineTimeLocale: process.env.DEADLINE_TIME_LOCALE || 'en',
	deadlineTimeFormat: process.env.DEADLINE_TIME_FORMAT || 'dddd MMMM Do YYYY HH:mm'
};
