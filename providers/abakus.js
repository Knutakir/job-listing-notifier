// eslint-disable-next-line import/no-unresolved
import got from 'got';
import getPackageUserAgent from 'package-user-agent';
import config from '../config.js';

const jobType = config.abakusJobType;
const {jobLocation, abakusAPIUrl, abakusListingUrlPath} = config;
const apiUrl = abakusAPIUrl;
const listingUrlPath = abakusListingUrlPath;

// Array to store the previous job listings in
// Used to check if there are new job listings
let oldJobListings = [];

async function getNewJobListings() {
	const packageUserAgent = await getPackageUserAgent();
	const response = await got(apiUrl, {headers: packageUserAgent});
	const body = JSON.parse(response.body);
	const jobListings = body.results;

	// Filter on job type and job location
	const filteredJobListings = jobListings.filter(jobListing => {
		const isCorrectJobType = jobListing.jobType === jobType;
		const isCorrectLocation = jobListing.workplaces.some(location => location.town === jobLocation);

		return isCorrectJobType && isCorrectLocation;
	});

	const currentJobListings = filteredJobListings.map(jobListing => {
		const {title, id} = jobListing;
		const company = jobListing.company.name;
		const deadline = new Date(jobListing.deadline);

		return {
			title,
			company,
			deadline,
			source: 'abakus',
			url: `${listingUrlPath}${id}`
		};
	});

	const newJobListings = currentJobListings.filter(
		jobListing => !oldJobListings.some(
			oldJobListing => oldJobListing.title === jobListing.title
            && oldJobListing.company === jobListing.company
            && oldJobListing.deadline.getTime() === jobListing.deadline.getTime()
		)
	);

	// Set the old jobs to the new jobs if there are new jobs
	if (newJobListings.length > 0) {
		oldJobListings = currentJobListings;
	}

	return newJobListings;
}

export default {
	getNewJobListings
};
