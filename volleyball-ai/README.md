# AI-Based Real-Time Volleyball Player Performance Analysis Using Computer Vision

An AI-powered volleyball analytics system that uses computer vision to automatically detect players, track movements, recognize volleyball actions, and generate match statistics in real-time from video footage.

## Architecture

```
Camera → Video Stream → OpenCV → YOLO Detection → Player Tracking
→ Pose Estimation → Action Recognition (LSTM) → Statistics Generator
→ MySQL Database → Flask REST API → React Dashboard
```

## Tech Stack

**Backend:**
- Flask (Python web framework)
- SQLAlchemy (ORM)
- MySQL (database)
- OpenCV (video processing)
- YOLOv8 (object detection)
- MediaPipe (pose estimation)
- PyTorch + LSTM (action recognition)

**Frontend:**
- React 18
- React Router
- Axios (HTTP client)
- Recharts (visualization)

## Project Structure

```
volleyball-ai/
├── backend/
│   ├── server.py              # Flask app entry point
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment config
│   ├── models/
│   │   ├── team.py           # Team model
│   │   ├── player.py         # Player model
│   │   ├── match.py          # Match & MatchEvent models
│   │   └── statistics.py     # PlayerStatistic model
│   ├── routes/
│   │   ├── teams.py          # Team CRUD endpoints
│   │   ├── players.py        # Player CRUD endpoints
│   │   ├── matches.py        # Match CRUD endpoints
│   │   ├── statistics.py     # Statistics endpoints
│   │   └── video.py          # Video upload & processing
│   ├── cv_engine/
│   │   ├── detection/
│   │   │   └── yolo_detector.py    # YOLO player/ball detection
│   │   ├── tracking/
│   │   │   └── byte_track.py       # Object tracking
│   │   ├── pose/
│   │   │   └── pose_estimator.py   # MediaPipe pose estimation
│   │   ├── action_recognition/
│   │   │   ├── action_classifier.py # LSTM action classification
│   │   │   └── statistics_generator.py
│   │   └── pipeline.py             # Main video processing pipeline
│   └── uploads/               # Uploaded videos
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js            # Main React app
│   │   ├── App.css           # Global styles
│   │   ├── components/
│   │   │   └── Navbar.js     # Navigation component
│   │   └── pages/
│   │       ├── Dashboard.js  # Main dashboard
│   │       ├── Matches.js    # Match list
│   │       ├── MatchDetail.js # Match detail view
│   │       ├── Players.js    # Player list
│   │       └── UploadVideo.js # Video upload page
│   └── package.json
└── README.md
```

## Setup

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure MySQL in .env file

# Start server
python server.py
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/teams/ | List all teams |
| POST | /api/teams/ | Create a team |
| GET | /api/players/ | List all players |
| POST | /api/players/ | Create a player |
| GET | /api/matches/ | List all matches |
| POST | /api/matches/ | Create a match |
| GET | /api/matches/:id/events | Get match events |
| GET | /api/statistics/match/:id | Get match statistics |
| POST | /api/video/upload/:id | Upload match video |
| POST | /api/video/process/:id | Run AI analysis |

## CV Pipeline

1. **Detection** - YOLOv8 detects players and ball in each frame
2. **Tracking** - ByteTrack assigns unique IDs and tracks across frames
3. **Pose Estimation** - MediaPipe extracts body landmarks and features
4. **Action Recognition** - LSTM classifier identifies volleyball actions
5. **Statistics** - Events are converted to player/team statistics

## Actions Detected

serve, serve_ace, reception, set, spike, kill, block, dig, free_ball, attack_error, service_error, net_touch, rotation_fault

## Training

The LSTM action classifier requires labeled volleyball action sequences. To train:

1. Collect labeled video clips of each action
2. Extract pose features using MediaPipe
3. Train the LSTM model on sequences of 30 frames
4. Save model weights and load in ActionClassifier
