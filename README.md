<p align="center">
  <img src=".github/screenshot.png" alt="Location Privacy Lab" width="800" />
</p>

<h1 align="center">🛡️ Location Privacy Teaching System</h1>

<p align="center">
  An interactive web-based teaching platform that demonstrates how location data can be used to re-identify individuals — and how privacy techniques can protect against it.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.109+-009688?logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Mapbox_GL-3.x-000000?logo=mapbox&logoColor=white" alt="Mapbox" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Usage Guide](#-usage-guide)
  - [Generating a Dataset](#1-generating-a-dataset)
  - [Exploring the Map](#2-exploring-the-map)
  - [Analyzing Risk](#3-analyzing-risk)
  - [Applying Privacy Techniques](#4-applying-privacy-techniques)
  - [Comparing Results](#5-comparing-results)
  - [Educational Walkthrough](#6-educational-walkthrough)
- [API Reference](#-api-reference)
- [Privacy Algorithms](#-privacy-algorithms-explained)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Docker Deployment](#-docker-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧭 Overview

Location data is one of the most sensitive types of personal information. Studies have shown that just **4 spatiotemporal points** are enough to uniquely identify 95% of individuals in a dataset. This application makes that risk tangible.

The **Location Privacy Teaching System** generates synthetic but realistic location datasets for Calgary, AB, Canada, then lets users:

1. **Visualize** user trajectories on an interactive map
2. **Analyze** re-identification risks using clustering algorithms
3. **Apply** privacy-preserving techniques (k-anonymity, spatial cloaking, differential privacy)
4. **Compare** the tradeoff between privacy protection and data utility

This tool is designed for **educators, students, and researchers** in data privacy, information security, and urban computing.

---

## ✨ Features

### 🗺️ Interactive Map Visualization
- Mapbox GL–powered map centered on Calgary, AB
- Trajectory lines connecting user location points over time
- Heatmap layer for location density visualization
- Home (🏠) and work (🏢) location markers
- Timeline slider to filter locations by date range

### 👤 Synthetic Dataset Generation
- Generates **30–50 realistic user profiles** with unique behavioral patterns
- Each user has a home, work (85% of users), and 2–5 leisure locations
- Simulates realistic daily routines: morning commute → work → evening → home
- Uses real Calgary neighborhoods and landmarks for authentic geographic distribution
- **7–21 days** of trajectory data per user, including weekday/weekend patterns

### ⚠️ Re-identification Risk Analysis
- **DBSCAN clustering** to automatically infer home and work locations from raw GPS data
- **Trajectory uniqueness scoring** — measures how distinguishable a user's movement pattern is
- **Minimum points to identify** — calculates how few data points are needed to uniquely identify a user
- **Re-identification probability** — overall percentage risk score per user
- Pattern detection: identifies commute routes, timing habits, and frequent stops

### 🔒 Privacy Protection Techniques
| Technique | Parameter | Description |
|-----------|-----------|-------------|
| **K-Anonymity** | `k` (2–20) | Grid-based generalization ensuring each user is indistinguishable from at least k-1 others |
| **Spatial Cloaking** | `radius` (50–5000m) | Randomized displacement of GPS coordinates within a configurable radius |
| **Differential Privacy** | `ε` (0.01–10.0) | Laplace noise mechanism calibrated by privacy budget epsilon |

### 📊 Dashboard & Comparison
- **Risk Meter** — real-time gauge showing current user's risk level (low/medium/high)
- **Comparison Charts** — side-by-side bar charts showing original vs. anonymized risk scores
- **Utility Loss Metric** — quantifies how much data accuracy is sacrificed for privacy

### 🎓 Educational Mode
- **Interactive tooltips** — hover-triggered explanations for every privacy concept
- **Guided walkthrough** — step-by-step tour through the entire application
- Context-sensitive help for all technical parameters

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Browser (Client)                   │
│                                                      │
│  ┌────────────┐ ┌───────────┐ ┌───────────────────┐  │
│  │  MapView   │ │ Dashboard │ │    Sidebar        │  │
│  │ (Mapbox GL)│ │ (Recharts)│ │ UserSelector      │  │
│  │            │ │ RiskMeter │ │ PrivacyControls   │  │
│  │ Timeline   │ │ Compare   │ │                   │  │
│  └─────┬──────┘ └─────┬─────┘ └────────┬──────────┘  │
│        └──────────────┼────────────────┘             │
│                       │ Axios HTTP                   │
└───────────────────────┼──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│               FastAPI Backend (:8000)                 │
│                                                      │
│  ┌──────────────┐ ┌────────────────┐ ┌────────────┐  │
│  │  API Routes  │ │ Privacy        │ │ Services   │  │
│  │              │ │ Algorithms     │ │            │  │
│  │ /generate    │ │ k-anonymity    │ │ Dataset    │  │
│  │ /risk        │ │ spatial cloak  │ │ Generator  │  │
│  │ /anonymize   │ │ diff. privacy  │ │ Risk Calc  │  │
│  │ /patterns    │ │                │ │ (DBSCAN)   │  │
│  └──────────────┘ └────────────────┘ └────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript 5.9** | Type-safe JavaScript |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **Mapbox GL JS** | Interactive map rendering |
| **react-map-gl** | React wrapper for Mapbox |
| **Recharts** | Data visualization charts |
| **Radix UI** | Accessible headless components |
| **shadcn/ui** | Pre-styled component system |
| **Lucide React** | Icon library |
| **Axios** | HTTP client |

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.10+** | Server language |
| **FastAPI** | Async REST API framework |
| **Uvicorn** | ASGI server |
| **NumPy** | Numerical computations |
| **Pandas** | Data manipulation |
| **scikit-learn** | DBSCAN clustering & ML |
| **Pydantic** | Data validation & schemas |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization (multi-stage build) |
| **Nginx** | Reverse proxy & static file serving |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Installation |
|------------|---------|--------------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **pnpm** | 8+ | `npm install -g pnpm` |
| **Python** | 3.10+ | [python.org](https://www.python.org/) |
| **Mapbox Token** | — | Free at [mapbox.com](https://account.mapbox.com/) |

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install Python dependencies
pip install -r requirements.txt

# Start the API server (with hot reload)
uvicorn main:app --reload --port 8000
```

The API will be running at **http://localhost:8000**. You can view the auto-generated API docs at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
pnpm install

# Create environment configuration
cat > .env << EOF
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_API_URL=http://localhost:8000/api
EOF

# Start the development server
pnpm dev
```

The application will be running at **http://localhost:5173**.

> **💡 Tip:** If you don't have a Mapbox token yet, go to [account.mapbox.com](https://account.mapbox.com/), create a free account, and copy your default public token.

---

## 📘 Usage Guide

### 1. Generating a Dataset

When you first open the application, click the **"Generate Dataset"** button in the sidebar. This will:

- Create **30–50 synthetic user profiles** with realistic Calgary location data
- Each user gets a unique home location, work location (85% chance), and leisure spots
- Location trajectories span **7–21 days** with realistic commute and weekend patterns

The dataset is cached on the server — click **"Refresh"** to generate a new one, or specify a custom number of users.

### 2. Exploring the Map

Once a dataset is generated, the **interactive map** will display:

| Element | Description |
|---------|-------------|
| **Colored dots** | Individual location data points |
| **Lines** | Trajectory paths connecting sequential locations |
| **🏠 Home markers** | Inferred home locations (clustered from nighttime data) |
| **🏢 Work markers** | Inferred work locations (clustered from weekday daytime data) |
| **Heatmap** | Density overlay showing location concentration |

**Map Controls:**
- **Pan & zoom** — Click and drag, scroll wheel, or pinch
- **Timeline slider** — Filter visible data points by date range
- **Toggle layers** — Show/hide trajectory lines, heatmap, and markers

### 3. Analyzing Risk

Select a user from the **User Selector** dropdown in the sidebar. The system will analyze their location data and display:

- **Overall Risk Score** (0–100%) — displayed on the Risk Meter gauge
  - 🟢 **Low** (< 40%): Difficult to re-identify
  - 🟡 **Medium** (40–70%): Moderate re-identification risk
  - 🔴 **High** (> 70%): Easily re-identifiable
- **Uniqueness Score** — How distinguishable this user's trajectory is from others
- **Home/Work Inference** — Whether the algorithm could determine home and work addresses
- **Minimum Points to Identify** — The fewest location readings needed to single out this user
- **Unique Patterns** — Specific behavioral signatures (e.g., "only user who visits location X at time Y")

### 4. Applying Privacy Techniques

Use the **Privacy Controls** panel in the sidebar to apply anonymization:

#### K-Anonymity
Generalizes locations to grid cells so that each user shares their location with at least k-1 others.

```
Parameter: k (2–20)
├── k=2  → Minimal protection, low utility loss
├── k=5  → Balanced protection (recommended starting point)
└── k=20 → Strong protection, significant utility loss
```

- **How it works:** Snaps GPS coordinates to a grid where cell size increases with k
- **Grid formula:** `cell_size = 0.002 + (k - 2) × 0.001` (~200m base + ~100m per k increase)

#### Spatial Cloaking
Displaces each GPS point by a random distance and direction within a specified radius.

```
Parameter: radius_meters (50–5000m)
├──  100m → Slight perturbation, preserves local patterns
├──  500m → Moderate cloaking (recommended starting point)
└── 1000m → Aggressive cloaking, may distort trajectories
```

- **How it works:** For each point, generates a random angle (0–2π) and distance (0–radius), then shifts coordinates

#### Differential Privacy
Adds calibrated Laplace noise to every GPS coordinate, with the noise level controlled by the privacy budget ε.

```
Parameter: epsilon (0.01–10.0)
├── ε=0.1 → Strong privacy, heavy noise
├── ε=1.0 → Balanced (recommended starting point)
└── ε=2.0 → Weaker privacy, light noise
```

- **How it works:** Noise scale = `sensitivity / ε`, where sensitivity = 0.001 degrees (~111m)
- **Key principle:** Lower ε = more noise = more privacy = less utility

### 5. Comparing Results

After applying a privacy technique, the **Comparison Chart** in the dashboard shows:

- **Before vs. After** risk scores displayed as side-by-side bar charts
- **Risk Reduction** — The percentage decrease in re-identification risk
- **Utility Loss** — How much data accuracy was sacrificed (0–100%)
- **Distortion Metrics** — Average, maximum, and standard deviation of coordinate displacement (in meters)

This helps users understand the fundamental **privacy-utility tradeoff**: stronger privacy protection comes at the cost of data accuracy.

### 6. Educational Walkthrough

Click the **help icon (?)** to launch the guided walkthrough mode:

1. **Tooltips** appear on hover over technical terms and UI elements
2. **Step-by-step walkthrough** guides you through the entire workflow
3. Context-sensitive explanations for each privacy parameter

---

## 📡 API Reference

All endpoints are prefixed with `/api`. The backend also provides auto-generated interactive docs:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Endpoints

#### Generate Dataset
```http
GET /api/generate-dataset?num_users=30&refresh=false
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `num_users` | `int` | Random (30–50) | Number of user profiles to generate |
| `refresh` | `bool` | `false` | Force regeneration (bypasses cache) |

**Response:** `Dataset` object containing all user profiles with location histories.

---

#### Calculate Risk (All Users)
```http
POST /api/calculate-risk
Content-Type: application/json

{
  "users": [...],
  "generated_at": "2025-01-01T00:00:00",
  "city": "Calgary"
}
```
**Response:** `Record<user_id, RiskScore>` — risk scores for every user in the dataset.

---

#### Calculate Risk (Single User)
```http
POST /api/calculate-risk/{user_id}
Content-Type: application/json

{ ...dataset }
```
**Response:** `RiskScore` object for the specified user.

---

#### Apply K-Anonymity
```http
POST /api/anonymize/k-anonymity
Content-Type: application/json

{
  "dataset": { ...dataset },
  "k": 5
}
```
| Parameter | Type | Range | Default | Description |
|-----------|------|-------|---------|-------------|
| `k` | `int` | 2–20 | 5 | Minimum group size |

**Response:** `AnonymizedDataset` with the processed data, utility loss, and new risk scores.

---

#### Apply Spatial Cloaking
```http
POST /api/anonymize/spatial-cloaking
Content-Type: application/json

{
  "dataset": { ...dataset },
  "radius_meters": 500
}
```
| Parameter | Type | Range | Default | Description |
|-----------|------|-------|---------|-------------|
| `radius_meters` | `float` | 50–5000 | 500 | Cloaking radius in meters |

**Response:** `AnonymizedDataset`

---

#### Apply Differential Privacy
```http
POST /api/anonymize/differential-privacy
Content-Type: application/json

{
  "dataset": { ...dataset },
  "epsilon": 1.0
}
```
| Parameter | Type | Range | Default | Description |
|-----------|------|-------|---------|-------------|
| `epsilon` | `float` | 0.01–10.0 | 1.0 | Privacy budget |

**Response:** `AnonymizedDataset`

---

#### Identify User Patterns
```http
POST /api/identify-patterns/{user_id}
Content-Type: application/json

{ ...dataset }
```
**Response:** `PatternResult` containing inferred home/work, frequent locations, unique trajectories, and risk factors.

---

#### Compare Privacy Techniques
```http
POST /api/compare-privacy?technique=k-anonymity
Content-Type: application/json

{
  "original_dataset": { ...dataset },
  "anonymized_dataset": { ...dataset },
  "parameters": { "k": 5 }
}
```
**Response:** `ComparisonResult` with original and anonymized risk scores, risk reduction, and utility loss.

---

#### Health Check
```http
GET /health
```
**Response:** `{ "status": "healthy" }`

---

### Data Models

#### LocationPoint
```json
{
  "lat": 51.0447,
  "lon": -114.0719,
  "timestamp": "2025-01-15T08:30:00",
  "location_type": "home"   // "home" | "work" | "leisure" | "transit"
}
```

#### UserProfile
```json
{
  "user_id": "user_001",
  "locations": [ ...LocationPoint[] ],
  "home_location": { ...LocationPoint },
  "work_location": { ...LocationPoint }
}
```

#### RiskScore
```json
{
  "overall_risk": 78.5,
  "uniqueness_score": 82.3,
  "reidentification_probability": 71.0,
  "home_inferred": true,
  "work_inferred": true,
  "unique_patterns": ["Late night commuter", "Weekend gym visitor"],
  "min_points_to_identify": 3
}
```

---

## 🔬 Privacy Algorithms Explained

### K-Anonymity
**Concept:** Ensure each individual's location is shared by at least k-1 other people. This makes it impossible to uniquely identify someone within a group.

**Implementation:**
1. Define a grid over the geographic area (cell size scales with k)
2. Snap every GPS coordinate to the nearest grid cell center
3. All users within the same cell become indistinguishable

**Parameters:**
- Grid size = `0.002 + (k - 2) × 0.001` degrees (~200m base, +100m per k step)
- Higher k → larger grid cells → more privacy → more location distortion

**Limitations:**
- Assumes uniform distribution within cells
- Does not protect against attacks using temporal information
- Utility degrades significantly for large k values

---

### Spatial Cloaking
**Concept:** Replace each exact GPS location with a random point within a circular region, so adversaries cannot determine the true position.

**Implementation:**
1. For each location point, generate a random angle θ ∈ [0, 2π)
2. Generate a random distance d ∈ [0, radius]
3. Shift: `new_lat = lat + d × cos(θ)`, `new_lon = lon + d × sin(θ)`

**Parameters:**
- Radius is converted from meters to degrees: `radius_degrees = radius_meters / 111,000`
- Larger radius → more privacy → more spatial distortion

**Limitations:**
- Consistent patterns (e.g., daily commute) may still be identifiable
- Does not provide formal privacy guarantees
- Uniform random displacement may bias toward the center

---

### Differential Privacy
**Concept:** Add mathematically calibrated noise so that the presence or absence of any individual's data has a bounded effect on the output. This provides provable privacy guarantees.

**Implementation:**
1. Define sensitivity Δ = 0.001 (degrees, ≈111 meters)
2. Calculate noise scale: `scale = Δ / ε`
3. Add Laplace noise: `new_coord = original ± Laplace(0, scale)`

**Parameters:**
- `ε` (epsilon) = privacy budget
- Lower ε → larger noise → stronger privacy → more distortion
- ε → ∞ means no privacy protection

**Formal Guarantee:** For any two neighboring datasets D and D' differing by one individual:
```
P[M(D) ∈ S] ≤ e^ε × P[M(D') ∈ S]
```

**Limitations:**
- Very low ε values can make data nearly unusable
- Noise is independent per-point (doesn't consider trajectory coherence)

---

## 📂 Project Structure

```
lt-privacy/
├── frontend/                      # React + Vite SPA
│   ├── src/
│   │   ├── App.tsx                # Main application component
│   │   ├── main.tsx               # ReactDOM entry point
│   │   ├── index.css              # Global styles & Tailwind
│   │   ├── App.css                # App-specific styles
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── MapView.tsx        # Mapbox GL map with layers
│   │   │   │   └── TimelineSlider.tsx # Date range filter
│   │   │   ├── Dashboard/
│   │   │   │   ├── RiskMeter.tsx      # Risk score gauge
│   │   │   │   └── ComparisonChart.tsx # Before/after comparison
│   │   │   ├── Sidebar/
│   │   │   │   ├── UserSelector.tsx    # User profile picker
│   │   │   │   └── PrivacyControls.tsx # Anonymization controls
│   │   │   ├── Teaching/
│   │   │   │   ├── Tooltip.tsx         # Educational tooltips
│   │   │   │   └── Walkthrough.tsx     # Guided tour
│   │   │   └── ui/                    # shadcn/ui components
│   │   ├── services/
│   │   │   └── api.ts             # Axios API client
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript type definitions
│   │   └── lib/
│   │       └── utils.ts           # Utility functions (cn helper)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── components.json            # shadcn/ui configuration
│   └── eslint.config.js
│
├── backend/                       # Python FastAPI server
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt           # Python dependencies
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py          # All API endpoint handlers
│   │   ├── core/
│   │   │   ├── config.py          # Calgary config & constants
│   │   │   └── privacy_algorithms.py  # K-anonymity, spatial cloaking, diff. privacy
│   │   ├── models/
│   │   │   └── schemas.py         # Pydantic request/response models
│   │   └── services/
│   │       ├── dataset_generator.py   # Synthetic location data generator
│   │       └── risk_calculator.py     # DBSCAN-based risk analysis
│   └── tests/
│
├── Dockerfile                     # Multi-stage Docker build
├── nginx.root.conf                # Nginx reverse proxy config
├── start.sh                       # Container startup script
├── .dockerignore
└── README.md
```

---

## 🔧 Environment Variables

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_MAPBOX_TOKEN` | ✅ Yes | — | Mapbox GL JS public access token |
| `VITE_API_URL` | No | `http://localhost:8000/api` | Backend API base URL |

### Docker Build Args

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_MAPBOX_TOKEN` | ✅ Yes | — | Baked into the frontend build |
| `VITE_API_URL` | No | `/api` | Set to `/api` for production (Nginx proxied) |

---

## 🐳 Docker Deployment

The project uses a **multi-stage Docker build** that outputs a single container running both the frontend (via Nginx) and the backend (via Uvicorn).

### Deployment Options

#### Option 1: Render (Web Service)

1. Connect your GitHub repository to Render.
2. Select **Docker** as the runtime.
3. Add your `VITE_MAPBOX_TOKEN` as a **Build Argument**.
4. Set the port to `10000` (Render should detect this from the Dockerfile).

#### Option 2: DigitalOcean App Platform

1. Connect your GitHub repository to DigitalOcean.
2. The platform will detect the `.do/app.yaml` configuration.
3. Configure your `VITE_MAPBOX_TOKEN` in the **Environment Variables** (set it for both Build and Run time).
4. Deploy.

#### Option 3: DigitalOcean Droplet (Docker Compose)

1. SSH into your Droplet.
2. Install Docker and Docker Compose.
3. Clone the repository.
4. Run:
   ```bash
   VITE_MAPBOX_TOKEN=your_token_here docker-compose up -d --build
   ```

#### Option 4: AWS EC2 (Docker Compose)

1. Launch an EC2 instance (Amazon Linux 2023, `t3.small` or larger; the frontend build needs ~2 GB RAM, or add swap on `t3.micro`).
2. Security group: allow inbound TCP **22** (your IP only) and **80** (and **443** if you add TLS).
3. SSH in, then run `deploy/ec2-setup.sh` (installs Docker + Compose), and log out/in.
4. Clone the repo and start it on port 80:
   ```bash
   git clone https://github.com/Benedict-Kpaduwa/Location-Privacy.git && cd Location-Privacy
   printf 'VITE_MAPBOX_TOKEN=your_token_here\nHOST_PORT=80\n' > .env
   docker compose up -d --build
   ```
5. Visit `http://<instance-public-ip>`. To update: `git pull && docker compose up -d --build`.

For a custom domain and HTTPS, point a DNS record (or an Elastic IP) at the instance and put an Application Load Balancer with an ACM certificate in front, or run Caddy/certbot on the host.

### How It Works

1. **Stage 1 (Node.js):** Builds the React frontend into static files (`/frontend/dist`)
2. **Stage 2 (Python):** Installs the FastAPI backend and copies:
   - The built frontend files → `/var/www/html`
   - Nginx config → `/etc/nginx/conf.d/app.conf`
3. **Runtime:** `start.sh` launches both:
   - **Uvicorn** on port 8080 (backend API, internal)
   - **Nginx** on port 10000 (serves frontend + proxies `/api/*` → Uvicorn)

### Nginx Routing

| Path | Destination |
|------|-------------|
| `/` | Serves `index.html` (SPA with client-side routing) |
| `/api/*` | Proxied to Uvicorn backend on port 8080 |
| `/health` | Proxied to backend health check |
| `/assets/*` | Static assets with 1-year cache headers |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'Add my feature'`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

### Development Tips

- The backend has **hot reload** enabled (`--reload` flag) — changes are reflected instantly
- The frontend uses **Vite HMR** — component updates appear without a full page refresh
- API docs are auto-generated at `/docs` (Swagger) and `/redoc` (ReDoc)
- The generated dataset is **cached** on the server — use `refresh=true` to regenerate

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for teaching privacy in the age of ubiquitous location tracking
</p>
