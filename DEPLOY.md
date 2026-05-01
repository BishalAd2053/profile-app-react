# Deployment Guide

## Local Development

```bash
# Requires Docker
docker compose up

# Visit http://localhost:8081
# Admin: http://localhost:8081/admin (default: admin/admin)
```

---

## Deploy to Render.com (Free)

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Connect to Render
1. Go to https://render.com/dashboard
2. Sign up (free, GitHub login works)
3. Click **New +** → **Blueprint**
4. Connect your GitHub repo: `BishalAd2053/profile-app-react`
5. Select `main` branch
6. Click **Create**

Render auto-detects `render.yaml` and deploys:
- **Backend** as a Docker web service (Spring Boot)
- **Frontend** as a static site (React build)

### 3. Configure Admin Password
After deployment, the backend generates a random admin password. To view/change it:
1. In Render dashboard, go to **profile-app-backend** service
2. Click **Environment**
3. Look for `APP_ADMIN_PASSWORD` — this is auto-generated
4. To set your own: edit the value (⚠️ restart service after)

### 4. Access Your Site
- **Frontend**: https://profile-app-frontend.onrender.com (auto domain)
- **Backend API**: https://profile-app-backend.onrender.com/api/profile
- **Admin**: https://profile-app-frontend.onrender.com/admin

### 5. Update Profile Data
1. Go to `/admin` → log in with `admin` / `{your-password}`
2. Edit and save
3. Changes persist (stored in Render's attached disk)

---

## Deploy to Vercel + Railway (Alternative)

### Frontend on Vercel
```bash
npm install -g vercel
cd frontend
vercel deploy
```
Set `VITE_API_URL=https://profile-app-backend.railway.app` during setup.

### Backend on Railway
1. Go to https://railway.app
2. Connect GitHub repo
3. Select only the `backend/` directory as the root
4. Railway detects the Docker file and deploys

---

## Environment Variables

| Variable | Default | Use |
|---|---|---|
| `APP_PROFILE_DATA_PATH` | `/data/profile.json` | Backend: where profile data is persisted |
| `APP_ADMIN_USERNAME` | `admin` | Backend: login username |
| `APP_ADMIN_PASSWORD` | `admin` (local) or auto-generated (Render) | Backend: login password |
| `VITE_API_URL` | `/api` (local) | Frontend: backend API base URL |

---

## Notes

- **Cold starts**: Free tier services sleep after 15 min of inactivity. First request takes ~30s. Upgrade to paid if you need always-on.
- **Data persistence**: Backend uses Render's disk storage (1 GB free). Profile data survives restarts.
- **HTTPS**: Automatic on `*.onrender.com` domain
- **Custom domain**: Render allows custom domains (go to Settings → Custom Domain)

---

## Troubleshooting

**Frontend shows "Could not load profile"**
- Check the backend is running: visit `https://profile-app-backend.onrender.com/actuator/health`
- Verify `VITE_API_URL` is set correctly in the Render frontend environment

**Admin login fails**
- Default password on Render is auto-generated. Check Render backend environment variables.
- If forgotten, restart the backend service to regenerate.

**Profile data lost after restart**
- Make sure the backend service has the disk attached (Render dashboard → Service → Disks)
