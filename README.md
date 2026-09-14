# CampusHire

A campus placement portal that runs the whole hiring cycle in one place — students
browse roles they actually qualify for, recruiters run an enforced interview
pipeline, and the placement cell oversees every account, job and decision.

**Stack:** Node.js · Express 5 · MongoDB Atlas · Mongoose · JWT · bcrypt ·
React 19 · Vite · Tailwind CSS v4 · React Router 7

---

## What it does

- **Eligibility engine** — every published job is evaluated against the signed-in
  student's CGPA, branch and graduation year before it reaches them. Each job
  comes back tagged `isEligible`, `alreadyApplied` and, when ineligible, the exact
  reasons why.
- **Enforced state machine** — applications may only move
  `applied → shortlisted → interview → selected`, with rejection available at each
  stage and withdrawal reserved for the student. Illegal transitions are rejected
  by the server, not just hidden in the UI.
- **Audit trail** — every status change writes an `AuditLog` entry recording who
  changed it, from what, to what and why. Students see their own history;
  the placement cell sees all of it.
- **Eligibility snapshots** — a student's CGPA, branch and batch are frozen onto
  the application at the moment they apply, so later profile edits never rewrite
  what the recruiter reviewed.
- **Recruiter verification** — a recruiter cannot publish a single job until the
  placement cell verifies their company.
- **Notifications** — recruiters are notified of new applicants, students of every
  status change, recruiters of verification decisions.

---

## Project layout

```
Backend/
  app.js server.js           Express app + entrypoint
  db/db.js                   Mongoose connection
  models/                    User, Job, Application, Notification, AuditLog
  controller/                auth, user, job, application, admin
  routes/                    one router per resource
  middleware/                authenticate, optionalAuth, authorize, ownershipCheck
  utils/                     eligibility engine, status transition table
  scripts/seed.js            demo dataset
Frontend/
  src/lib/                   axios client, formatters
  src/context/               AuthContext (token persistence + rehydration)
  src/components/            design system, navbar, layout, route guard
  src/pages/                 public / student / recruiter / admin
```

---

## Running locally

**Backend**

```bash
cd Backend
npm install
cp .env.example .env     # fill in MONGO_URI and JWT_SECRET
npm run seed             # optional — loads the demo dataset
npm run dev              # http://localhost:3000
```

**Frontend**

```bash
cd Frontend
npm install
cp .env.example .env.local     # VITE_API_URL=http://localhost:3000
npm run dev                    # http://localhost:5173
```

### Demo accounts (after `npm run seed`)

All use the password `password123`.

| Role      | Email                  | Notes                                      |
|-----------|------------------------|--------------------------------------------|
| Admin     | admin@campushire.dev   | Placement cell                             |
| Recruiter | priya@nimbus.dev       | Verified, two published jobs               |
| Recruiter | rohit@quanta.io        | Verified                                   |
| Recruiter | neha@orbitpay.com      | Pending verification — cannot post         |
| Student   | ishaan@student.dev     | CSE, 8.6 CGPA, 2026 — eligible for most    |
| Student   | ananya@student.dev     | ECE, 9.1 CGPA, 2026                        |
| Student   | kabir@student.dev      | MECH, 6.4 CGPA, 2027 — ineligible for most |

---

## API

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | authenticated |
| GET/PUT | `/api/users/profile` | authenticated |
| GET | `/api/users/notifications` | authenticated |
| PUT | `/api/users/notifications/:id/read` | authenticated |
| PUT | `/api/users/notifications/read-all` | authenticated |
| GET | `/api/jobs` | public (decorated for students) |
| GET | `/api/jobs/my-jobs` | recruiter |
| GET | `/api/jobs/:id` | public |
| POST | `/api/jobs` | recruiter, verified |
| PUT | `/api/jobs/:id` · `/publish` · `/close` | recruiter + ownership |
| DELETE | `/api/jobs/:id` | recruiter + ownership |
| POST | `/api/applications/:jobId` | student |
| GET | `/api/applications/my-applications` | student |
| GET | `/api/applications/job/:jobId` | recruiter + ownership |
| GET | `/api/applications/:id` | owner or admin |
| PUT | `/api/applications/:id/status` | recruiter |
| PUT | `/api/applications/:id/withdraw` | student |
| GET | `/api/admin/stats` · `/users` · `/jobs` · `/applications` | admin |
| PUT | `/api/admin/users/:id/activate` · `/deactivate` | admin |
| GET | `/api/admin/recruiters/pending` | admin |
| PUT | `/api/admin/recruiters/:id/verify` · `/reject` | admin |

---

## Deployment

### Backend → Render

1. Push this repo to GitHub.
2. On Render: **New → Web Service**, connect the repo.
3. Settings: **Root Directory** `Backend`, **Build** `npm install`,
   **Start** `npm start`, **Health check path** `/api/health`.
4. Environment variables:
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — a long random string
   - `CLIENT_URL` — your Vercel URL (comma separated if more than one)
5. In Atlas, allow Render's egress IPs, or `0.0.0.0/0` for a free instance.

`Backend/render.yaml` is a Blueprint for the same thing if you would rather
import it than click through the form.

### Frontend → Vercel

1. **New Project**, import the repo, set **Root Directory** to `Frontend`.
2. Vercel detects Vite; `Frontend/vercel.json` supplies the SPA rewrite so deep
   links like `/my-applications` resolve.
3. Environment variable: `VITE_API_URL` — your Render URL, no trailing slash.
4. Redeploy after setting `CLIENT_URL` on Render so CORS matches.

---

## Notes on the design

Dark slate ground with a fixed two-bloom ambient gradient and a masked hairline
grid. Indigo → violet carries identity and state; amber is reserved for the single
primary action on any screen, so it always means "act here". Every surface is one
frosted panel component, and all motion is a short eased rise that respects
`prefers-reduced-motion`.
