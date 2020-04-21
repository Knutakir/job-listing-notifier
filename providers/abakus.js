const got = require('got');
const config = require('../config');
const {httpHeader} = require('../util');
const jobType = config.abakusJobType;
const {jobLocation} = config;
const apiUrl = config.abakusAPIUrl;
const listingUrlPath = config.abakusListingUrlPath;

// Array to store the previous job listings in
// Used to check if there are new job listings
let oldJobListings = [];

async function getNewJobListings() {
    try {
        const response = await got(apiUrl, {headers: httpHeader});
        const body = JSON.parse(response.body);
        const jobListings = body.results;

        // Filter on job type and job location
        const filteredJobListings = jobListings.filter(jobListing => {
            const isCorrectJobType = jobListing.jobType === jobType;
            const isCorrectLocation = jobListing.workplaces.some(location => location.town === jobLocation);

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
                source: 'abakus',
                url: `${listingUrlPath}${jobListing.id}`
            };
        });

        const newJobListings = currentJobListings.filter(jobListing => {
            return !oldJobListings.some(oldJobListing => {
                return oldJobListing.title === jobListing.title &&
                    oldJobListing.company === jobListing.company &&
                    oldJobListing.deadline.getTime() === jobListing.deadline.getTime();
            });
        });

        // Set the old jobs to the new jobs if there are new jobs
        if (newJobListings.length > 0) {
            oldJobListings = currentJobListings;
        }

        return newJobListings;
    } catch (error) {
        console.log(error);
    }
}

module.exports.getNewJobListings = getNewJobListings;