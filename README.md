# Location Privacy Teaching System

An interactive web-based teaching system that demonstrates location data re-identification risks and privacy protection techniques. Built with React/Vite frontend and Python FastAPI backend.

## Screenshots

![Location Privacy Lab](.github/screenshot.png)

## Features

- **Synthetic Dataset Generation**: Creates 30-50 realistic user profiles with Calgary location trajectories
- **Interactive Map**: Mapbox-powered visualization with trajectory lines, heatmaps, and home/work markers
- **Re-identification Risk Analysis**: DBSCAN clustering to infer home/work locations and calculate uniqueness scores
- **Privacy Techniques**:
  - **K-Anonymity**: Grid-based generalization
  - **Spatial Cloaking**: Random displacement within radius
  - **Differential Privacy**: Laplace noise mechanism
- **Educational Mode**: Interactive tooltips and guided walkthrough

## Tech Stack

**Frontend**: React, TypeScript, Vite, Tailwind CSS, Mapbox GL, Recharts, Radix UI
**Backend**: Python, FastAPI, NumPy, Pandas, Scikit-learn

---

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.10+
- Mapbox API token (free at [mapbox.com](https://account.mapbox.com/))

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Create environment file
echo "VITE_MAPBOX_TOKEN=your_mapbox_token_here" > .env
echo "VITE_API_URL=http://localhost:8000/api" >> .env

# Start development server
pnpm dev
```

Open http://localhost:5173 in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/generate-dataset` | Generate synthetic location data |
| POST | `/api/calculate-risk` | Calculate re-identification risk |
| POST | `/api/anonymize/k-anonymity` | Apply k-anonymity |
| POST | `/api/anonymize/spatial-cloaking` | Apply spatial cloaking |
| POST | `/api/anonymize/differential-privacy` | Apply differential privacy |
| POST | `/api/identify-patterns/{user_id}` | Identify user patterns |

---

## Privacy Algorithms

### K-Anonymity
Generalizes locations to grid cells ensuring each user is indistinguishable from at least k-1 others.

### Spatial Cloaking
Replaces exact GPS coordinates with randomized positions within a specified radius.

### Differential Privacy
Adds calibrated Laplace noise to coordinates based on privacy budget (ε). Lower epsilon = more privacy = more noise.

---

## Project Structure

```
lt-privacy/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/          # MapView, TimelineSlider
│   │   │   ├── Sidebar/      # UserSelector, PrivacyControls
│   │   │   ├── Dashboard/    # RiskMeter, ComparisonChart
│   │   │   └── Teaching/     # Tooltip, Walkthrough
│   │   ├── services/         # API client
│   │   └── types/            # TypeScript definitions
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI routes
│   │   ├── core/             # Privacy algorithms
│   │   ├── models/           # Pydantic schemas
│   │   └── services/         # Dataset generator, risk calculator
│   ├── main.py
│   └── requirements.txt
└── README.md
```

---

## License

MIT
