# Cloud Hosting Guide — Free 3-Tier Production Deployment

Deploy IncidentSphere to the cloud for free using the modern developer stack:
- **Database**: [Neon.tech](https://neon.tech) (Free Serverless PostgreSQL)
- **Backend API**: [Render.com](https://render.com) (Free Docker Web Service)
- **Frontend SPA**: [Vercel.com](https://vercel.com) (Free Global Edge CDN)

Total Cost: **$0.00 / month**  
Setup Time: **~10 minutes**

---

## Step 1: Create Free PostgreSQL Database on Neon.tech

1. Go to [https://neon.tech](https://neon.tech) and sign up with GitHub.
2. Click **Create Project**:
   - **Name**: `incidentsphere-db`
   - **Postgres version**: `16`
   - **Region**: Choose the closest region (e.g. `US East (Ohio)` or `AWS Frankfurt`).
3. Once created, Neon displays the **Connection Details**:
   - Toggle to **Parameters** or copy the **Connection string**.
   - Note down:
     - **Host**: `ep-xxxx-xxxx.region.aws.neon.tech`
     - **Database**: `neondb`
     - **Username**: `neondb_owner` (or your assigned username)
     - **Password**: `<your-neon-password>`
     - **JDBC Connection String**:
       ```text
       jdbc:postgresql://ep-xxxx-xxxx.region.aws.neon.tech/neondb?sslmode=require
       ```

---

## Step 2: Deploy Backend to Render.com

1. Go to [https://render.com](https://render.com) and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your repository: `nandhubabu/Enterprise-Issue---Incident-Management-System`.
4. Fill in the service parameters:
   - **Name**: `incidentsphere-backend`
   - **Region**: Same as Neon (e.g. `Oregon (US West)` or `Frankfurt`).
   - **Environment**: `Docker`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Docker Build Context**: `backend`
   - **Instance Type**: `Free`
5. Expand **Advanced** → **Add Environment Variables**:

| Key | Value | Notes |
|:---|:---|:---|
| `SPRING_PROFILES_ACTIVE` | `prod` | Enables PostgreSQL profile |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<neon-host>/neondb?sslmode=require` | From Neon Step 1 |
| `DB_USERNAME` | `<neon-username>` | From Neon Step 1 |
| `DB_PASSWORD` | `<neon-password>` | From Neon Step 1 |
| `JWT_SECRET` | *Click "Generate" or paste a 64-char hex key* | 256-bit signing secret |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` | Auto-creates tables on Neon |

6. Click **Create Web Service**.
7. Render will build the Docker container and start the Spring Boot app.
   - Once deployed, copy your backend URL (e.g. `https://incidentsphere-backend.onrender.com`).
   - Verify health check in browser: `https://incidentsphere-backend.onrender.com/actuator/health` → `{"status":"UP"}`.

---

## Step 3: Deploy Frontend to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** → **Project**.
3. Import `nandhubabu/Enterprise-Issue---Incident-Management-System`.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`.
5. Under **Environment Variables**, add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://incidentsphere-backend.onrender.com/api` (use your Render backend URL with `/api` at the end).
6. Click **Deploy**.
7. In ~45 seconds, Vercel will give you a live HTTPS domain:
   ```text
   https://enterprise-issue-incident-management-system.vercel.app
   ```

---

## Step 4: Add Your Live Demo Link to GitHub README

Once deployed, add the live demo badge to the top of `README.md`:

```markdown
[![Live Demo](https://img.shields.io/badge/Live_Demo-IncidentSphere-blue?style=for-the-badge&logo=vercel)](https://your-app.vercel.app)
```

Now recruiters can click one link, sign in with `@nandhu` / `Admin@123`, and test your enterprise incident management system live!
