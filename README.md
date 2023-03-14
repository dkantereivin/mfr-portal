# MFR Portal (St John Ambulance D0007)
A full-stack web portal built for volunteers at Hamilton's St. John's ambulance Community Services MFR division, including leadership, Medical First Responders, apprentices, and recruits.

![St John Ambulance Logo](https://www.sja.org.uk/globalassets/images/logos/sja-logo.png)
The site is available at [mfr.sjahamilton.ca](https://mfr.sjahamilton.ca).

## Features
Here is the site's current feature list with brief details.
Feature requests are always welcome - please submit these as issues or message me directly!

__Currently Implemented:__
- automatic or manual roster management using Google oAuth for login
    - automatically imports rank, name, and email from Google Sheets
    - basic user management to modify rank, name, and email
- attendance tracking
    - users can sign in by scanning an NFC tag, or a QR code generated by a leadership member.
    - users can also manually enter the code.
    - leadership can view and modify attendance history in tabular format
    - automatically exports volunteer hours to Google Sheets

__Planned Major Features:__

- volunteer hours tracking (priority: low)
    - eliminates Google Sheets dependency altogether by handling all volunteer hour storage,
    editing, and updates in the portal
    - this will be mostly automated and integrated with attendance / events
    - will also provide a manual editing interface for leadership
- event forms (priority: medium)
    - as a first phase, this will allow users to fill out the form
    - this form will support autosave and will automatically export hours
    - as a second phase, this will be fully automated and integrate with event signup
    - show members which event forms are outstanding and send them email reminders
- event signup (priority: low)
    - phase out or reduce reliance on Google Sheets event calendar in-lieu of a fully online system
    - to be rolled out in conjunction with operations team
    - allow for a waitlist and show member's events on their dashboard


__Planned Minor Features:__
- allow users to edit their own preferred names and import from Google Sheets (priority: high)
- prettier dashboard which summarizes attendance, events, and member contract status (priority: medium)


## Technical Details
This section may not be relevant to most people within the St John Ambulance branch - if 
you're just looking to use the portal, you can skip this section.
However, this documents the technical details of the project,
and roughly details the steps required to make changes on your own machine,
and to deploy the project to a production server.

If nothing else, this is useful for me to keep track of various details,
and it would be useful for anyone hoping to maintain the project after my eventual (but far off) departure.
I really do hope that someone is willing to take the time to keep this running - maintaining is not as hard as it looks (it's not as daunting as new development)!
In addition to this section, I usually leave detailed commit messages,
so running `git blame` on a piece of code and reading the commit message is a good way to get a sense of why I've chosen to do things a particular way (e.g. what the bug was).

Plus, please feel free to help work on this if you want!

### Overview
The web app is built on the SvelteKit framework in TypeScript,
which means that both the frontend and backend in the same place.
It uses MongoDB as a primary database and Redis as a secondary cache (e.g. for sessions and similar).

Serverless turned out to be a bad choice,
so instead it is deployed on a dedicated on-premises server (Ubuntu 22.04 LTS)
using Docker and Docker Compose.
To simplify this as much as possible,
I use Doppler to manage secrets (i.e. passwords, API keys, etc.)
in development and production environemnts.
Rather than use their environment-variable based approach
(which requires special work to integrate with SvelteKit's build tool, `vite`),
I instead call their API using custom code in `src/lib/server/doppler.ts`.

As such, the only following environment variables are required in the container itself:
```env
# required at build time
PUBLIC_BASE_URL="http://localhost:5173"

# required at runtime only
NODE_ENV="development"
DOPPLER_TOKEN="dp.pt.U29ZzOw9RA7xMzpGhLaOFDQ5JLYbKCcsbsPkj5oAYV1"
```
Where possible, I highly suggest setting these via Docker compose,
usually from the host machine's environment variables or a `.env` file.

## Authorship and License
This project, while having its source code publicly available,
is not currently intended for use outside of St John Ambulance Hamilton's MFR division (D0007).
Please contact me directly if you are from another St John Ambulance branch and would like
the project adapted for your own use -- I would be happy to help!

This project is built and maintained by David Kanter Eivin ([david.kantereivin@sjacs.ca](mailto:david.kantereivin@sjacs.ca)), the Corporal of Administration for St John Ambulance Hamilton.