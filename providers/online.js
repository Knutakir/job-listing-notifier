import got from 'got';
import config from '../config.js';
import util from '../util.js';

const {jobLocation, onlineJobType} = config;
const apiUrl = config.onlineAPIUrl;
const listingUrlPath = config.onlineListingUrlPath;

// Array to store the previous job listings in
// Used to check if there are new job listings
let oldJobListings = [];

async function getNewJobListings() {
    const response = await got(apiUrl, {headers: util.httpHeader});
    const body = JSON.parse(response.body);
    const jobListings = body.results;

    // Filter on job type and job location
    const filteredJobListings = jobListings.filter(jobListing => {
        const isCorrectJobType = jobListing.employment.name === onlineJobType;
        const isCorrectLocation = jobListing.location.some(location => location.name === jobLocation);

        return isCorrectJobType && isCorrectLocation;
    });

    const currentJobListings = filteredJobListings.map(jobListing => {
        const {title} = jobListing;
        const company = jobListing.company.name;
        const deadline = new Date(jobListing.deadline);

        return {
            title,
            company,
            deadline,
            source: 'online',
            url: `${listingUrlPath}${jobListing.id}`
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
