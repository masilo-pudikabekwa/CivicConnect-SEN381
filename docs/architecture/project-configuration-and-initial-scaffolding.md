# Working project configuration and initial scaffolding specification

Person 1 should create the bootstrap in small, reviewable commits instead of dropping a complete generated project into main. The goal is to prove that the selected architecture exists in the repository and can run, not to claim that scaffolding alone is meaningful application development.

## Recommended progressive commit sequence

| **Step** | **Branch / commit intent** | **Files / evidence**                                                                                    | **Why this is meaningful**                                           |
|----------|----------------------------|---------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| 1        | chore/bootstrap-workspaces | Root package.json, workspaces, .gitignore, .env.example, base tsconfig, README skeleton.                | Creates repeatable project configuration and secrets-safe structure. |
| 2        | feat/api-bootstrap         | apps/api Express app/server split, /api/v1 router, health route, central error handling, config loader. | Shows the backend boundary actually starts and responds.             |
| 3        | feat/web-bootstrap         | apps/web React/Vite shell, routing, API client base URL from environment, basic app layout.             | Shows frontend can build/run and has an explicit API boundary.       |
| 4        | chore/security-baseline    | Security headers, CORS allow-list, request body limits, dependency audit notes.                         | Translates security ASR into application configuration.              |
| 5        | docs/architecture-baseline | Architecture diagrams, ADRs, README setup, decision links.                                              | Connects reasoning to the code that now exists.                      |
| 6        | integration/person2-path   | Person 2 merges schema/domain/report path through normal PRs.                                           | Transforms bootstrap into requirement-backed product evidence.       |

## Root workspace configuration example

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
"name": "civicconnect",<br />
"private": true,<br />
"workspaces": ["apps/web", "apps/api"],<br />
"scripts": {<br />
"dev:web": "npm run dev -w apps/web",<br />
"dev:api": "npm run dev -w apps/api",<br />
"build": "npm run build -w apps/api &amp;&amp; npm run build -w apps/web",<br />
"test": "npm run test -w apps/api &amp;&amp; npm run test -w apps/web",<br />
"lint": "npm run lint -w apps/api &amp;&amp; npm run lint -w apps/web"<br />
}<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

This example is intentionally small. The exact package versions belong in each workspace package.json and package-lock.json. Do not add tooling merely to make the repository look advanced; every tool should have a reason and a repeatable command.

## Backend composition-root example

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>// apps/api/src/app.ts<br />
import express from "express";<br />
import helmet from "helmet";<br />
import cors from "cors";<br />
import { apiV1Router } from "./routes/apiV1.js";<br />
import { errorHandler } from "./middleware/errorHandler.js";<br />
import { env } from "./config/env.js";<br />
<br />
export function createApp() {<br />
const app = express();<br />
<br />
app.disable("x-powered-by");<br />
app.use(helmet());<br />
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));<br />
app.use(express.json({ limit: "100kb" }));<br />
<br />
app.get("/api/v1/health", (_req, res) =&gt; {<br />
res.status(200).json({ status: "ok" });<br />
});<br />
<br />
app.use("/api/v1", apiV1Router);<br />
app.use(errorHandler);<br />
return app;<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

The important design point is not the amount of code. app.ts is the composition root where middleware and module routers are assembled; server.ts should only load config, create the app and listen. This separation makes the application easier to test without opening a real network port.

## Environment validation example

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>// apps/api/src/config/env.ts<br />
import { z } from "zod";<br />
<br />
const schema = z.object({<br />
NODE_ENV: z.enum(["development", "test", "production"]).default("development"),<br />
PORT: z.coerce.number().int().positive().default(3000),<br />
DATABASE_URL: z.string().min(1),<br />
FRONTEND_ORIGIN: z.string().url(),<br />
AUTH_SECRET: z.string().min(32)<br />
});<br />
<br />
export const env = schema.parse(process.env);</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

A validated configuration boundary prevents the application from quietly starting with missing critical values. The .env.example should show names/placeholders only, while real secrets remain outside the repository.

## Frontend API boundary example

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>// apps/web/src/shared/api/client.ts<br />
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;<br />
<br />
export async function apiRequest&lt;T&gt;(path: string, init?: RequestInit): Promise&lt;T&gt; {<br />
const response = await fetch(`${API_BASE_URL}${path}`, {<br />
...init,<br />
credentials: "include",<br />
headers: {<br />
"Content-Type": "application/json",<br />
...(init?.headers ?? {})<br />
}<br />
});<br />
<br />
if (!response.ok) {<br />
throw new Error(`Request failed with status ${response.status}`);<br />
}<br />
<br />
return response.json() as Promise&lt;T&gt;;<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

This wrapper keeps the base URL and transport behaviour out of feature components. Later, structured API errors can replace the generic Error once the team agrees the error contract. Do not expose server stack traces or raw database errors to the frontend.

## What Person 1 should be able to demonstrate live

- The repo has the architecture-aligned folder structure and package-lock.json.

- Fresh clone -\> npm install -\> documented dev commands work using safe local configuration.

- Frontend loads and the API /api/v1/health endpoint returns a controlled response.

- Missing required environment variables fail fast with a readable startup error.

- Protected main is not used for direct development; the bootstrap reached main through a reviewed PR.

- The architecture diagrams and ADRs in docs/architecture and docs/adr match the actual module/workspace structure.

- At least one team-owned requirement path goes beyond the scaffold before assessment; Person 1 should be able to navigate from RTM to code and verification.
