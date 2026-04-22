[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Pedroo-Nietoo_Eventer-API&metric=alert_status&token=4fb6cbaab02a304080d642a465504391ac180fd4)](https://sonarcloud.io/summary/new_code?id=Pedroo-Nietoo_Eventer-API)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Pedroo-Nietoo_Eventer-API&metric=coverage&token=4fb6cbaab02a304080d642a465504391ac180fd4)](https://sonarcloud.io/summary/new_code?id=Pedroo-Nietoo_Eventer-API)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Pedroo-Nietoo_Eventer-API&metric=reliability_rating&token=4fb6cbaab02a304080d642a465504391ac180fd4)](https://sonarcloud.io/summary/new_code?id=Pedroo-Nietoo_Eventer-API)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Pedroo-Nietoo_Eventer-API&metric=security_rating&token=4fb6cbaab02a304080d642a465504391ac180fd4)](https://sonarcloud.io/summary/new_code?id=Pedroo-Nietoo_Eventer-API)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Pedroo-Nietoo_Eventer-API&metric=sqale_rating&token=4fb6cbaab02a304080d642a465504391ac180fd4)](https://sonarcloud.io/summary/new_code?id=Pedroo-Nietoo_Eventer-API)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://github.com/Pedroo-Nietoo/Eventer-API/blob/main/LICENSE)

# Eventer API

<p>
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white" alt="Stripe" />
</p>


### Description

API for the Eventer app, which allows users to create and manage events, as well as find nearby events based on their location. The API is built using NestJS and TypeScript, and it uses Redis for caching and BullMQ for job queues.

## Resources

- Domain-driven event platform covering event creation, discovery, and management flows, including geolocation-aware capabilities for nearby events.
- Complete ticketing and order lifecycle with asynchronous orchestration via BullMQ, enabling resilient background processing under high demand.
- Automated reservation/order consistency through scheduled Cron jobs, preventing stale allocations and preserving ticket inventory accuracy.
- Secure authentication model using JWT plus a Phantom Opaque Token strategy backed by Redis, improving both security posture and token/session lookup performance.
- Scalable media workflow with pre-signed URL uploads, offloading binary transfer from the API and reducing frontend/backend overhead.
- CDN-backed asset delivery for fast, low-latency image loading and improved end-user experience across regions.
- Production-grade API operability with Swagger documentation, health checks (database, Redis, memory, disk), and queue observability endpoints.
- Strong engineering maturity through layered testing (unit, integration, e2e), code quality gates, and migration-based database evolution.

## Prerequisites

Before you begin, ensure you have the following tools installed on your local machine:

- **[Node.js](https://nodejs.org/en/download/)** (v18 or higher) - JavaScript runtime environment required for NestJS.
- **[npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)** - Default package manager to install the project dependencies.
- **[Docker](https://www.docker.com/products/docker-desktop/)** - To run the containerized infrastructure (PostgreSQL and Redis).
- **[Docker Compose](https://docs.docker.com/compose/install/)** - To orchestrate the multi-container local setup.
- **[Stripe CLI](https://docs.stripe.com/stripe-cli)** *(Optional)* - Highly recommended for forwarding and testing payment webhooks locally.

## Project setup

```bash
# Install dependencies
$ npm install

# Copy the environment variables file
$ cp .env.example .env

# Start the containers
$ docker compose up -d

# Run database migrations
$ npm run migration:run
```

## Compile and run the project

```bash
# Development
$ npm run start

# Watch mode
$ npm run start:dev

# Production mode
$ npm run start:prod
```

## Run tests

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

### Documentation
The project has two different documentations:
- The **Swagger** docs can be found on the `/api/docs` endpoint when the application is running.
- The **project diagrams** can be found in the `docs/diagrams` folder.

### Demo
You can access the demo of the API on [this link](https://eventer-api.fly.dev/api/docs). The credentials for the admin user are:
- Email: `admin@eventer.com`
- Password: `Admin123!`

> [!NOTE]  
> The demo is running on a free-tier hosting service, so it may take a few seconds to wake up the server if it has been idle for a while.
> Also, the demo database is reset every 24 hours, so any data created will be lost after that.

## License

Eventer-API is [MIT licensed](https://github.com/Pedroo-Nietoo/Eventer-API/blob/main/LICENSE).


<p align="center">
  Developed by <a href="https://github.com/Pedroo-Nietoo">Pedro Nieto</a>.
</p>
