# Team 01 – Due Diligence Agent

## Backend setup

Prerequisites: Java 17, Maven, and PostgreSQL. Create an empty PostgreSQL
database named `real_estate_dd` (or choose another name and set `DB_URL`).
Flyway creates and migrates the schema at application startup.

From `backend`, copy `.env.example` values into your shell environment (or an
ignored local configuration file) and replace every placeholder. `.env` is a
template and is not loaded automatically. At minimum set `DB_URL`,
`DB_USERNAME`, `DB_PASSWORD`, and a random `JWT_SECRET` of 32 bytes or longer.
Set `FRONTEND_URL` to the local frontend origin when it differs from
`http://localhost:5173`.

For example, in PowerShell:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/real_estate_dd"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "your-local-password"
$env:JWT_SECRET = "a-random-development-secret-at-least-32-bytes-long"
$env:FRONTEND_URL = "http://localhost:5173"
```

```powershell
cd backend
mvn clean install
mvn spring-boot:run
```

The API defaults to port `8081`; override it with `SERVER_PORT`. Do not commit
`.env`, `application-local.properties`, database credentials, OAuth secrets, or
generated `target/` and `logs/` directories.
