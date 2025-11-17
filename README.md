# bobs-corn-pern
This repository is to create a nice site so our favorite farmer, Bob, can sell his corn all around the world.

## Instructions
Based on the following requirements make the Technical Assessment.
The stack that you are going to use is PERN (Postgre, Express, React and Node).


Please create a private Github repo in which you will be sending the commits, try to do a PR per feature.
```
Hey Software Engineer,
Congratulations
You are so close to the end of the process. Only 1 out of 60 applicants make it this far. We are very excited to see your skills. 
Doing this challenge is really important because it's our only way for us to know how good you code. This is your chance to show us that we should have you on our team!

Bob's Corn
Business rule
You are helping a farmer named Bob sells corn. They are a very fair farmer and your policy is to sell at most 1 corn per client per minute. 
Bob's clients buy corn by making POST petitions to an API that returns a 200 every time they successfully buy some corn.

Task at hand
**First task**: Build a rate limiter that will return a successful response if a client buys corn below the 1 corn per limit rate or a 429 Too Many Requests if the client is buying corn beyond that limit.
Client portal
Most of your clients don't know how to make a POST petition! Help them buy corn through a frontend.

Task at hand
**Second task**: Create a website built in the framework and stack for the role you are applying to - if you are unsure about the stack ask the recruiter you are talking to - where clients can buy corn with the click of a button and see how much corn they have successfully brought. You can use Tailwind or a Block Set like Shadcn.


Do a challenge that reflects your thinking and decision making skills so we can understand your seniority.
```

## Environment configuration
> **Note:** Checking `.env` files into source control (or documenting them publicly) is normally discouraged. They are included here only so reviewers can run the project without extra setup.

The project expects two `.env` files:

1. **Root `.env`** (same level as `docker-compose.yml`). Docker Compose reads this file to substitute `${VAR}` expressions before the services start.

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=mydb
PORT=5000
```

2. **`server/.env`**. Loaded by the Node/Express app during local development (Prisma, `pnpm dev`, etc.) and injected into the server and database services via the `env_file` entries in `docker-compose.yml`.

```
# Database connection string for local development
DATABASE_URL="postgres://postgres:postgres@localhost:5432/mydb"

# Database configuration for Docker Compose
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=mydb

# Server configuration
PORT=5000
```

## How do I run it? 
- Open Terminal and run `docker-compose up --build`. And wait all services to be up and running.
Services will be exposed in the following ports: (URL: `http://localhost:${PORT}`)
  - Frontend (React): 5173 
  - Database: 5432
  - Backend (Node/Express): 3000
  
## Known issues (TODO)
- Purchase history table doesn't appear at first load. Yo have to refresh the page so the websocket connection is done and then it appears.