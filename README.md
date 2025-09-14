# Exam Proctoring Application

An AI-powered online exam proctoring system with real-time face detection and automated screenshot capture.

## Features

- **Real-time Face Detection**: Uses TensorFlow.js BlazeFace for browser-based face detection
- **Automated Screenshot Capture**: Captures screenshots when suspicious activities are detected
- **MongoDB Integration**: Stores exam data and proctoring logs
- **MinIO Object Storage**: Secure storage for captured screenshots
- **JWT Authentication**: Secure user authentication system
- **Admin Dashboard**: View exam results and flagged activities
- **Responsive UI**: Built with React 18

## Services

### MongoDB Database
- Port: 27017
- Database: exam_proctoring
- Credentials: admin/password123

### MinIO Object Storage
- Console: http://localhost:9001
- API: http://localhost:9000
- Credentials: minioadmin/minioadmin123
- Bucket: exam-screenshots

### FastAPI Backend
- URL: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### React Frontend
- URL: http://localhost:3000

## Quick Start

1. **Start all services**:
   ```bash
   docker compose up -d
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/docs
   - MinIO Console: http://localhost:9001

3. **Login credentials**:
   - Admin: `admin` / `admin123`
   - User: `user` / `user123`

## Face Detection Monitoring

The system continuously monitors for:
- **No face detected**: Triggers screenshot when no face is visible
- **Multiple faces**: Triggers screenshot when more than one face is detected
- **Normal operation**: One face detected (no alerts)

### Console Logging

The application uses **minimal logging** to reduce noise:
- ✅ **Silent operation**: No logs during normal face detection
- ⚠️ **Issue alerts only**: Logs only appear when suspicious activity is detected
- 📸 **Screenshot events**: Logs when screenshots are captured and submitted

**Example issue logs**:
```
⚠️ No face detected
🚨 No face detected - triggering alert
📸 Capturing screenshot for: no_face_detected
✅ Screenshot submitted successfully for: no_face_detected
```

## Technology Stack

- **Frontend**: React 18, TensorFlow.js, BlazeFace
- **Backend**: FastAPI, PyMongo, Pydantic v2
- **Database**: MongoDB 6.0
- **Storage**: MinIO
- **Containerization**: Docker & Docker Compose

## Development

To modify and rebuild:

```bash
# Rebuild specific service
docker compose build frontend
docker compose build backend

# Restart services
docker compose up -d

# View logs
docker logs exam_proctoring_backend
docker logs exam_proctoring_frontend
```

## Technology Stack

- **Frontend**: React 18 with TensorFlow.js for face detection
- **Backend**: FastAPI with PyMongo for MongoDB operations
- **Database**: MongoDB for document storage
- **Object Storage**: MinIO for screenshot and image storage
- **Authentication**: JWT tokens with OAuth2 compatible endpoints
- **Containerization**: Docker and Docker Compose

## Project Structure

```
exam-proctoring-app
├── frontend
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── components
│   │   │   ├── admin
│   │   │   │   ├── AdminDashboard.js
│   │   │   │   ├── ExamTable.js
│   │   │   │   └── FlagDetails.js
│   │   │   ├── user
│   │   │   │   ├── ExamPage.js
│   │   │   │   ├── ProctorAcknowledgment.js
│   │   │   │   ├── ThankYou.js
│   │   │   │   └── FaceDetection.js
│   │   │   ├── auth
│   │   │   │   ├── Login.js
│   │   │   │   └── ProtectedRoute.js
│   │   │   └── common
│   │   │       ├── Header.js
│   │   │       └── Loader.js
│   │   ├── services
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   └── faceDetection.js
│   │   ├── utils
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── package-lock.json
├── backend
│   ├── app
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── admin.py
│   │   │   └── proctoring.py
│   │   ├── models
│   │   │   ├── __init__.py
│   │   │   ├── exam.py
│   │   │   └── user.py
│   │   ├── database
│   │   │   ├── __init__.py
│   │   │   └── connection.py
│   │   ├── services
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── exam_service.py
│   │   │   └── storage_service.py
│   │   └── utils
│   │       ├── __init__.py
│   │       └── helpers.py
│   ├── requirements.txt
│   └── .env
├── docker-compose.yml
└── README.md
```

## Quick Start with Docker Compose

### Prerequisites

- Docker and Docker Compose installed on your system
- At least 4GB RAM available for containers

### Running the Application

1. **Clone the repository and navigate to the project directory:**
   ```bash
   cd exam-proctoring-app
   ```

2. **Start all services using Docker Compose:**
   ```bash
   docker compose up -d
   ```
   
   This will start:
   - **MongoDB** - Document database for storing user data, exams, and proctoring flags
   - **MinIO** - Object storage for screenshots and images
   - **Backend (FastAPI)** - API server with MongoDB integration
   - **Frontend (React)** - Web application with face detection

3. **Wait for all services to be ready (approximately 2-3 minutes for first run)**

4. **Access the applications:**
   - **Frontend (React App)**: http://localhost:3000
   - **Backend API (FastAPI)**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin123)
   - **MongoDB**: localhost:27017 (admin/password123)

### Default Credentials

#### Admin Login
- **Username**: admin
- **Password**: admin123

#### User Login
- **Username**: user  
- **Password**: user123

### Stopping the Application

```bash
docker compose down
```

### Viewing Logs

```bash
# View all service logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
docker compose logs -f minio
```

### Rebuilding Services

If you make changes to the code and need to rebuild:

```bash
# Rebuild and restart all services
docker compose build
docker compose up -d

# Rebuild specific service
docker compose build backend
docker compose up -d backend
```

## Manual Setup (Development)

If you prefer to run services individually for development:

### Environment Setup

1. **Copy environment files:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Update environment variables in `backend/.env` as needed**

### Database Setup

1. **Start MongoDB and MinIO:**
   ```bash
   docker-compose up -d mongodb minio
   ```

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI application:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## Architecture Overview

### Services

1. **Frontend (React)** - Port 3000
   - User interface for exam taking and admin dashboard
   - Real-time face detection using TensorFlow.js BlazeFace model
   - Screenshot capture and flag detection
   - React Router v6 for navigation

2. **Backend (FastAPI)** - Port 8000
   - REST API for authentication and data management using PyMongo
   - JWT-based authentication with OAuth2 compatibility
   - Pydantic v2 models for data validation
   - MongoDB operations for storing exam data and flags

3. **MongoDB** - Port 27017
   - Primary NoSQL database for all application data
   - Collections: users, exams, proctoring_flags
   - Document-based storage with ObjectId references
   - Automatic indexing and efficient querying

4. **MinIO** - Ports 9000/9001
   - S3-compatible object storage for screenshots and images
   - Organized bucket structure for different exam sessions
   - RESTful API for file operations

### Data Flow

1. User starts exam → Frontend generates exam ID
2. Proctoring begins → Face detection and monitoring active
3. Flags detected → Screenshots captured and stored
4. Exam completion → All data sent to backend
5. Admin review → Data retrieved and displayed

## API Endpoints

### Authentication
- `POST /auth/login` - User/Admin login
- `POST /auth/logout` - Logout

### Exam Management
- `POST /api/exams` - Submit exam data and screenshots
- `GET /api/exams/{exam_id}` - Get specific exam data
- `GET /api/exams` - Get all exams (admin only)
- `DELETE /api/exams/{exam_id}` - Delete exam data (admin only)

### Health Check
- `GET /health` - Service health status

## Troubleshooting

### Common Issues

1. **Services not starting:**
   ```bash
   # Check Docker status
   docker-compose ps
   
   # Check logs for errors
   docker-compose logs [service-name]
   ```

2. **Port conflicts:**
   ```bash
   # Change ports in docker-compose.yml if needed
   # Default ports: 3000 (frontend), 8000 (backend), 27017 (mongo), 9000/9001 (minio)
   ```

3. **MinIO bucket not found:**
   ```bash
   # Bucket is created automatically, but if issues persist:
   docker-compose restart minio
   ```

4. **MongoDB connection issues:**
   ```bash
   # Reset MongoDB data
   docker-compose down
   docker volume rm exam-proctoring-app_mongodb_data
   docker-compose up -d
   ```

### Development Tips

- Use `docker-compose up` (without -d) to see real-time logs
- Frontend hot-reload is enabled for development
- Backend auto-reloads on code changes in development mode
- Access MinIO console at http://localhost:9001 to manage files

## Testing

### Run Backend Tests
```bash
cd backend
pytest
```

### Run Frontend Tests  
```bash
cd frontend
npm test
```

## Production Deployment

### Security Considerations

1. **Update default credentials** in production:
   - Change MongoDB admin password
   - Change MinIO access keys  
   - Update JWT secret key
   - Use strong admin/user passwords

2. **Environment Variables:**
   ```bash
   # Update these in production .env file
   MONGO_URI=mongodb://username:password@your-mongo-host:27017/exam_proctoring
   MINIO_ENDPOINT=your-minio-host:9000
   JWT_SECRET_KEY=your-super-secure-secret-key
   ```

3. **HTTPS Configuration:**
   - Use reverse proxy (nginx/apache) for SSL termination
   - Update CORS_ORIGINS for production domains

4. **Resource Limits:**
   - Add memory and CPU limits to docker-compose.yml
   - Configure proper backup strategies for MongoDB and MinIO

### Performance Optimization

- Enable MongoDB replica sets for high availability
- Use MinIO distributed mode for production
- Implement CDN for static assets
- Add Redis for session management and caching

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section above
- Review service logs using `docker-compose logs`
- Ensure all ports are available and not in use

## License

This project is licensed under the MIT License - see the LICENSE file for details.
