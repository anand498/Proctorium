#!/bin/bash

# Build frontend with updated helpers
cd /Users/nukamreddysrinivasulu/Desktop/ml_proctor_demo/exam-proctoring-app

echo "🔨 Building frontend with enhanced screenshot logging..."
docker compose build frontend

echo "📱 Restarting frontend container..."
docker compose up -d frontend

echo "✅ Frontend updated! Now test the application:"
echo "1. Go to http://localhost:3000"
echo "2. Login with: admin / admin123"
echo "3. Start an exam and cover your face"
echo "4. Check browser console for detailed screenshot logs"
echo "5. Check backend logs with: docker logs exam_proctoring_backend -f"
