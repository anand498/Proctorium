# Proctorium Client - Exam Proctoring Frontend

A modern React TypeScript frontend for the Proctorium exam proctoring system, built with Vite and Tailwind CSS.

## Features

### 🔐 Authentication System
- **Admin Portal**: Secure login for administrators to monitor exams
- **Candidate Portal**: User-friendly login for students taking exams
- **JWT Token Management**: Automatic token handling and validation
- **Role-based Access Control**: Different interfaces for admins and users

### 👨‍💼 Admin Dashboard
- **Exam Management**: View all exam sessions and their details
- **Proctoring Monitoring**: Real-time access to proctoring flags and alerts
- **Flag Analysis**: Detailed view of suspicious activities during exams
- **Screenshot Review**: Access to captured screenshots during flagged events
- **Exam Deletion**: Remove completed or invalid exam sessions

### 👨‍🎓 Student Interface
- **Exam Dashboard**: Clean interface showing available exams
- **Exam Instructions**: Clear guidelines before starting exams
- **Real-time Proctoring**: Live camera monitoring during exams
- **Progress Tracking**: Visual progress indicators and timer
- **Question Navigation**: Easy navigation between exam questions

### 🎥 AI-Powered Proctoring
- **Face Detection**: Real-time face detection using TensorFlow.js and BlazeFace
- **Multiple Face Detection**: Alerts when multiple people are detected
- **Tab Switching Detection**: Monitors when users leave the exam window
- **Camera Monitoring**: Continuous monitoring of camera feed
- **Automatic Screenshot Capture**: Screenshots taken during suspicious activities

### 🧪 Testing Dashboard
- **System Verification**: Test camera and proctoring functionality
- **Permission Checks**: Verify camera access and browser compatibility
- **Flag Testing**: Interactive testing of proctoring detection
- **Setup Validation**: Ensure optimal exam environment

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS for modern, responsive design
- **Icons**: Lucide React for consistent iconography
- **AI/ML**: TensorFlow.js with BlazeFace model for face detection
- **HTTP Client**: Axios for API communication
- **Routing**: React Router for navigation

## Project Structure

```
client/
├── src/
│   ├── components/           # React components
│   │   ├── AdminAuth.tsx     # Admin login component
│   │   ├── UserAuth.tsx      # Student login component
│   │   ├── AdminDashboard.tsx # Admin monitoring interface
│   │   ├── UserDashboard.tsx  # Student exam selection
│   │   ├── ExamPage.tsx      # Main exam interface
│   │   ├── FaceDetection.tsx # AI proctoring component
│   │   └── TestingDashboard.tsx # System testing interface
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication state management
│   ├── services/
│   │   └── api.ts           # Backend API integration
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles with Tailwind
├── public/
│   └── index.html           # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── postcss.config.js       # PostCSS configuration
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend API running on `http://localhost:8000`

### Installation

1. **Install dependencies**:
   ```bash
   cd client
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Open http://localhost:3000 in your browser
   - Default redirects to Candidate Portal

### Default Credentials

Based on the backend setup:
- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `user`, password: `user123`

## API Integration

The client integrates with the Proctorium backend API:

### Authentication Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

### Admin Endpoints
- `GET /api/admin/exams` - Get all exam sessions
- `GET /api/admin/exams/{id}` - Get specific exam details
- `DELETE /api/admin/exams/{id}` - Delete exam session
- `GET /api/admin/flags/{id}` - Get exam proctoring flags

### Proctoring Endpoints
- `POST /api/proctoring/data` - Submit proctoring data
- `GET /api/proctoring/data/{id}` - Get proctoring data
- `POST /api/proctoring/screenshot` - Upload screenshot

## Key Features Explained

### Face Detection System
- Uses TensorFlow.js BlazeFace model for real-time face detection
- Detects when no face is visible (user looking away)
- Identifies multiple faces in the camera view
- Captures screenshots automatically during violations
- Uploads evidence to the backend for admin review

### Proctoring Flags
- **No Face Detected**: When student looks away or leaves camera view
- **Multiple Faces**: When additional people appear in camera
- **Tab Switch**: When student navigates away from exam window
- **Camera Error**: When camera access fails or is blocked

### Responsive Design
- Mobile-friendly interface using Tailwind CSS
- Adaptive layouts for different screen sizes
- Accessible design with proper contrast and focus states

## Environment Configuration

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:8000
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Browser Compatibility

- Chrome 80+ (recommended)
- Firefox 75+
- Safari 13+
- Edge 80+

**Note**: Camera access and TensorFlow.js require modern browser features.

## Security Features

- JWT token-based authentication
- Automatic token refresh handling
- Role-based route protection
- Secure API communication
- Camera permission validation

## Development Notes

- Hot module replacement for fast development
- TypeScript for type safety
- ESLint and Prettier for code quality
- Modular component architecture
- Comprehensive error handling

## Troubleshooting

### Camera Issues
- Ensure camera permissions are granted
- Check if camera is being used by other applications
- Verify HTTPS is used in production (required for camera access)

### API Connection Issues
- Verify backend is running on correct port
- Check CORS configuration in backend
- Ensure API URL is correctly set in environment variables

### Build Issues
- Clear node_modules and reinstall dependencies
- Check Node.js version compatibility
- Verify all TypeScript types are properly defined
