# LeadMind Deployment Guide

This document outlines the steps to deploy the LeadMind Multi-Agent AI Sales Platform to production.

## 1. Database (MongoDB)
Since the app uses MongoDB, you should move from a local instance to a managed cloud database:
- **Recommended**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- **Steps**:
    1. Create a free/paid cluster.
    2. Get the Connection String (SRV).
    3. Update `mongodb` in your `.env` file.

## 2. Backend (FastAPI)
The backend is a Python FastAPI application.
- **Recommended Hosting**: [Railway](https://railway.app/) or [Render](https://render.com/).
- **Deployment Steps**:
    1. Connect your GitHub repository.
    2. Set the **Root Directory** to `backend`.
    3. Set the **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
    4. Add **Environment Variables**:
        - `mongodb`: Your MongoDB Atlas URI.
        - `NVIDIA_API_KEY`: Your NVIDIA API key.
        - `JWT_SECRET`: A strong random string.
        - `BACKEND_BASE_URL`: The URL provided by the hosting service.

## 3. Frontend (Next.js)
The frontend is a standard Next.js application.
- **Recommended Hosting**: [Vercel](https://vercel.com/).
- **Deployment Steps**:
    1. Connect your GitHub repository.
    2. Set the **Root Directory** to `frontend`.
    3. Vercel will auto-detect Next.js and configure the build settings.
    4. Add **Environment Variables**:
        - `NEXT_PUBLIC_API_URL`: Your Backend URL (e.g., `https://your-backend.up.railway.app`).

## 4. Required Code Changes for Production

### CORS Configuration
You MUST update the CORS origins in `backend/main.py` to allow your production frontend URL.

```python
# backend/main.py

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-frontend.vercel.app"  # Add your production URL here
    ],
    ...
)
```

### Static Files & Logos
The app serves logos from `public/logos`. On many serverless platforms (like Vercel or ephemeral Railway disks), these files will be lost on redeploy.
- **Solution**: Consider using a cloud storage provider like **Cloudinary** (there is already a `migrate_to_cloudinary.py` script in the backend) or AWS S3 for persistent storage.

## 5. Background Workers
The app uses `lifespan` to start background loops (`scheduler_loop`, `campaign_engine_loop`, `auto_pipeline_loop`).
## 6. Docker Deployment (Recommended for Local/VPS)
You can dockerize the entire stack using Docker Compose. This will spin up the Backend, Frontend, and MongoDB automatically.

### Steps:
1.  **Environment Variables**: Ensure your `.env` file has `NVIDIA_API_KEY` and `JWT_SECRET`.
2.  **Build and Start**:
    ```bash
    docker-compose up --build
    ```
3.  **Access the App**:
    - **Frontend**: [http://localhost:3000](http://localhost:3000)
    - **Backend**: [http://localhost:8000](http://localhost:8000)

### Configuration Note:
If you are deploying to a production server (VPS), update the `args` section in `docker-compose.yml` for the `frontend` service:
```yaml
args:
  - NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

