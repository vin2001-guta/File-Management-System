# Backend Deployment

This backend is a Spring Boot 3 application running on Java 17.

## Required Environment Variables

Set these in your deployment platform:

```env
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:mysql://your-db-host:3306/drive_clone?useSSL=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=your-db-user
SPRING_DATASOURCE_PASSWORD=your-db-password
APP_JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
APP_CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

Optional variables:

```env
PORT=8080
APP_FILE_UPLOAD_DIR=/app/uploads
APP_FILE_MAX_SIZE=104857600
SPRING_JPA_HIBERNATE_DDL_AUTO=update
APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://*.vercel.app
```

Use `APP_CORS_ALLOWED_ORIGIN_PATTERNS` for wildcard domains. Keep `APP_CORS_ALLOWED_ORIGINS` for exact domains. The backend can start without a CORS origin, but browser requests from the frontend will be blocked until one of these values matches the frontend domain.

## Docker Deployment

From the `backend` directory, build and run:

```bash
docker build -t drive-clone-backend .
docker run --env-file .env -p 8080:8080 drive-clone-backend
```

From the repository root, use:

```bash
docker build -t drive-clone-backend backend
docker run --env-file backend/.env -p 8080:8080 drive-clone-backend
```

Health check URL:

```text
GET /api/actuator/health
```

## Non-Docker Build

```bash
mvn clean package -DskipTests
java -Dspring.profiles.active=prod -jar target/drive-clone-backend-1.0.0.jar
```

## Database

Create a MySQL database before the first deploy. You can use `src/main/resources/create_database.sql` locally, or create the database from your cloud provider dashboard.

## File Uploads

Uploaded files are stored on the server filesystem. For production, choose a host with persistent disk storage or later move uploads to object storage such as S3 or Cloudinary. On ephemeral hosts, uploaded files may disappear after redeploys or restarts.
