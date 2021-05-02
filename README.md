# job-listing-notifier
> 📰⏰ Notifier for job listings

[![Docker Pulls](https://img.shields.io/docker/pulls/knutkirkhorn/job-listing-notifier)](https://hub.docker.com/r/knutkirkhorn/job-listing-notifier) [![Docker Image Size](https://badgen.net/docker/size/knutkirkhorn/job-listing-notifier)](https://hub.docker.com/r/knutkirkhorn/job-listing-notifier) [![Build Status](https://travis-ci.com/Knutakir/job-listing-notifier.svg?branch=main)](https://travis-ci.com/Knutakir/job-listing-notifier)

Notify for new published job listings on the student organization pages for Abakus ([@webkom](https://github.com/webkom)), Online ([@dotkom](https://github.com/dotkom)) and TIHLDE ([@tihlde](https://github.com/tihlde)).
This notifier uses their APIs for checking for new job listings and notifies to a Discord channel using [Discord Webhooks](https://discord.com/developers/docs/resources/webhook). It does support filtering on location and job type.

<div align="center">
	<img src="https://raw.githubusercontent.com/Knutakir/job-listing-notifier/main/media/top-image.png" alt="Job listing notification example from Abakus">
	<p>See <a href="https://github.com/Knutakir/job-listing-notifier#Screenshots">screenshots</a> for more example images.</p>
</div>

## Listing providers
| Name | URL | GitHub repository |
| --- | --- | --- |
| [Abakus](https://abakus.no) | [API](https://lego.abakus.no/api/v1/) | [@webkom/lego](https://github.com/webkom/lego) |
| [Online](https://online.ntnu.no) | [API](https://online.ntnu.no/api/v1/) | [@dotkom/onlineweb4](https://github.com/dotkom/onlineweb4) |
| [TIHLDE](https://tihlde.org) | [API](https://api.tihlde.org/api/v1/) | [@TIHLDE/Lepton](https://github.com/TIHLDE/Lepton) |

## Usage
### Within a Docker container
#### From Docker Hub Image
This will pull the image from [Docker Hub](https://hub.docker.com/) and run the image with the provided configuration for web hooks as below. One can provide only the Webhook URL or both the Webhook ID and token.

```sh
# Providing Discord Webhook URL
$ docker run -d -e DISCORD_WEBHOOK_URL=<URL_HERE> knutkirkhorn/job-listing-notifier

# Providing job location and job type
$ docker run -d \
    -e DISCORD_WEBHOOK_URL=<URL_HERE> \
    -e JOB_LOCATION="Trondheim" \
    -e ABAKUS_JOB_TYPE="full_time" \
    -e ONLINE_JOB_TYPE="Fastjobb" \
    knutkirkhorn/job-listing-notifier
```

#### From source code
```sh
# Build container from source
$ docker build -t job-listing-notifier .

# Run the built container with default configuration
$ docker run -d -e DISCORD_WEBHOOK_URL=<URL_HERE> job-listing-notifier

# Providing job location and job type
$ docker run -d \
    -e DISCORD_WEBHOOK_URL=<URL_HERE> \
    -e JOB_LOCATION="Trondheim" \
    -e ABAKUS_JOB_TYPE="full_time" \
    -e ONLINE_JOB_TYPE="Fastjobb" \
    job-listing-notifier
```

### Outside of a Docker container
```sh
# Install
$ npm install

# Run
$ npm start
```

### Environment variables
Provide these with the docker run command or store these in a `.env` file. Only `DISCORD_WEBHOOK_URL` or both `DISCORD_WEBHOOK_ID` and `DISCORD_WEBHOOK_TOKEN` are required, but other values are recommended to change to its own personal usage.

- `DISCORD_WEBHOOK_URL`
    - URL to the Discord Webhook containing both the ID and the token
    - Format: `DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/<ID_HERE>/<TOKEN_HERE>`
- `DISCORD_WEBHOOK_ID`
    - ID for the Discord Webhook
- `DISCORD_WEBHOOK_TOKEN`
    - Token for the Discord Webhook
- `WAIT_TIMEOUT` ***(optional)***
    - The time interval in milliseconds between each check to the APIs.
    - Default: `3600000` (60 minutes)
- `ABAKUS_API_URL` ***(optional)***
    - The URL to Abakus' listings API
    - Default: `https://lego.abakus.no/api/v1/joblistings/`
- `ONLINE_API_URL` ***(optional)***
    - The URL to Online's listings API
    - Default: `https://online.ntnu.no/api/v1/career/?format=json`
- `TIHLDE_API_URL` ***(optional)***
    - The URL to TIHLDE's listings API
    - Default: `https://tihlde.org/api/v1/jobpost/?format=json`
- `ABAKUS_LISTING_URL_PATH` ***(optional)***
    - The prefix of the URL for each individual job listing at Abakus' page. This is used to provide a link to the job listing in the Discord message.
    - Default: `https://abakus.no/joblistings/`
- `ONLINE_LISTING_URL_PATH` ***(optional)***
    - The prefix of the URL for each individual job listing at Online's page. This is used to provide a link to the job listing in the Discord message.
    - Default: `https://online.ntnu.no/careeropportunity/`
- `TIHLDE_LISTING_URL_PATH` ***(optional)***
    - The prefix of the URL for each individual job listing at TIHLDE's page. This is used to provide a link to the job listing in the Discord message.
    - Default: `https://tihlde.org/karriere/`
- `ABAKUS_LOGO_URL` ***(optional)***
    - The URL to Abakus' logo. This is used to provide a logo in the Discord message.
    - Default: `https://abakus.no/icon-256x256.png`
- `ONLINE_LOGO_URL` ***(optional)***
    - The URL to Online's logo. This is used to provide a logo in the Discord message.
    - Default: `https://online.ntnu.no/wiki/70/plugin/attachments/download/682/`
- `TIHLDE_LOGO_URL` ***(optional)***
    - The URL to TIHLDE's logo. This is used to provide a logo in the Discord message.
    - Default: `https://tihlde.org/browser-icons/apple-icon-114x114.png`
- `ABAKUS_JOB_TYPE` ***(optional)***
    - Type of job filtered in requests to Abakus' API.
    - Default: `full_time`
    - Possible values can be viewed [here](https://github.com/webkom/lego/blob/master/lego/apps/joblistings/models.py#L18-L22).
- `ONLINE_JOB_TYPE` ***(optional)***
    - Type of job filtered in requests to Onlines API.
    - Default: `Fastjobb`
    - Possible values can be viewed [here](https://github.com/dotkom/onlineweb4/blob/develop/apps/careeropportunity/models.py#L26-L32).
- `JOB_LOCATION` ***(optional)***
    - The location of where to notify about jobs. It is currently case sensitive.
    - Default: `Trondheim`
- `DEADLINE_TIME_LOCALE` ***(optional)***
    - The time locale for the deadline in the Discord message.
    - Default: `en`
- `DEADLINE_TIME_FORMAT` ***(optional)***
    - The time format for the deadline in the Discord message.
    - Default: `dddd MMMM Do YYYY HH:mm`

## Screenshots
![Abakus notifiction](https://raw.githubusercontent.com/Knutakir/job-listing-notifier/main/media/abakus.png)
![Online notifiction](https://raw.githubusercontent.com/Knutakir/job-listing-notifier/main/media/online.png)
![TIHLDE notifiction](https://raw.githubusercontent.com/Knutakir/job-listing-notifier/main/media/tihlde.png)

## License
MIT © [Knut Kirkhorn](https://github.com/Knutakir/job-listing-notifier/blob/main/LICENSE)
