# Express Back-End Projects

This collection brings together four Express projects that demonstrate progressively broader back-end engineering skills: authentication, third-party identity providers, API design, and transaction-safe business workflows.

| Project | Focus | Key technologies |
| --- | --- | --- |
| [Dog Walker Authentication](dog-walker-authentication) | Local account registration and protected routes | Express, Passport, bcrypt, sessions |
| [GitHub OAuth Login](github-oauth-login) | Sign-in with a third-party identity provider | Express, Passport, GitHub OAuth, EJS |
| [Technology Quotes API](technology-quotes-api) | JSON API design with a small browser interface | Express, REST API, JavaScript |
| [ReserveRight](https://github.com/elizaveta-sk/reserve-right) | Equipment reservations with roles, lifecycle controls, and booking-conflict protection | Node.js, Express, PostgreSQL, JWT, Zod, Docker |

## ReserveRight

ReserveRight is the most complete project in this collection. It models the full lifecycle for shared equipment: members request an item, staff review and issue it, and administrators maintain the catalogue. Its approval endpoint uses a PostgreSQL transaction and row locks to prevent concurrent staff actions from double-booking the same asset.

The standalone repository includes migrations, seed data, OpenAPI documentation, tests, Docker Compose configuration, audit logs, role-based access control, and operational reporting.
