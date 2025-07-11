# EasyRSVP

Easily send and manage invites and RSVPs for events!

## Contents
* [Overview](#overview)
* [Features](#features)
* [Configuration](#configuration)
* [Getting Started](#getting-started)
* [Contributing](#contributing)
* [License](#license)


## Overview
EasyRSVP is an application designed to make sending, tracking, and managing invitations simple.  Whether you’re organizing a party, conference, or any event, EasyRSVP helps you manage your guest list and responses with ease.


## Features
* Send event invitations to guests via email*
* Guests can RSVP WITHOUT creating an account*
* Real-time RSVP tracking and management
* Customizable event details


## Configuration
You will need to specify environment variables for database connection and email sending*.  Create a `.env` file in the `/server` directory.  At a later date, more information will be required here in order for full functionality.  **As of right now, you can ignore this if you are using docker.**
```env server/.env
DATABASE_URL="postgresql://USERNAME:PASSOWRD@DB_SERVER_ADDR:DB_SERVER_PORT/DB_NAME?schema=public"
JWT_SECRET="replacethisjwtsecretkeyforsecurelysigningsessiondata"
PORT=4000
```


## Getting Started
### Prerequisites
* Node.js (v22.15.0 recommended/used in development)
* npm (v10.9.2 recommended/used in development)


### Installation
```bash
git clone https://github.com/reichman2/EasyRSVP.git
cd EasyRSVP
npm install
# or
yarn install
```

### Running Locally
#### Running in a development environment
```bash
cd server
npm run dev

cd client
npm run dev
```
Visit http://localhost:5173

#### Running in a docker container
Clone the repository if you haven't already.  Once this is done, cd into the project's root directory and run the following:
```bash
docker-compose up --build
```
Visit http://localhost:3000


## Contributing
At this time, pull requests will not be reviewed, but please feel free to open issues.


## License
This project is licensed under the GNU General Public License (GPL).  Please see the LICENSE file for more details
