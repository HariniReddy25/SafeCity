# SafeCity — Integrated Emergency Response & Civil Defense Platform

SafeCity is a human-controlled, safety-focused emergency response, resource coordination, civil defense broadcast, and community volunteer platform. It equips citizens, professional first-responders, and emergency command administrators with real-time tools to manage crisis situations effectively.

---

## Key Features (Features 1–9)

1. **Feature 1 — Core Authentication & Emergency Reporting**
   - Secure JWT authentication with role-based access control (Citizen, Responder, Admin).
   - SOS reporting and detailed emergency incident submission with evidence attachments and geographic coordinates.

2. **Feature 2 — Duplicate Emergency Detection & Merger**
   - Automated detection of duplicate emergency reports based on proximity, temporal windows, and category matching.
   - Admin tool to merge duplicate reports into a unified Master Incident with master tracking codes.

3. **Feature 3 — Emergency Escalation Clock / SLA**
   - Background SLA monitoring engine for unassigned/unresolved incidents.
   - Priority-based escalation timers (`CRITICAL`: 10m, `HIGH`: 30m, `MEDIUM`: 60m, `LOW`: 120m) triggering administrative alerts.

4. **Feature 4 — Physical Resource Coordination**
   - Fleet and resource management (Ambulances, Fire Engines, Police Patrol Units, Rescue Squads).
   - Dispatch tracking, status lifecycle (`AVAILABLE`, `DISPATCHED`, `MAINTENANCE`), and release workflow.

5. **Feature 5 — Advanced Emergency Response Intelligence & AI Safety Support**
   - Operational intelligence evaluating incident severity scores (0–100), response readiness, SLA status, and recommended resource allocations without replacing human decision-making.
   - Interactive AI Safety Assistant (`/citizen/assistant`) providing instant safety tips and emergency guidance.

6. **Feature 6 — Geo-Fenced Civil Defense Emergency Broadcast System**
   - Administrative broadcast creation with geographic center coordinates and broadcast radius (km).
   - Targeted notification delivery to citizens located within the broadcast zone via Haversine distance calculations.

7. **Feature 7 — Operations & SLA Analytics Dashboard**
   - Comprehensive administrative analytics panel (`/admin/analytics`).
   - Metrics for SLA compliance rates, average response and assignment times, priority distributions, resource utilization, and 7-day incident trends.

8. **Feature 8 — Evacuation & Emergency Shelter Management**
   - Real-time shelter registry with capacity monitoring, occupancy limits, auto-`FULL` status, and facility inventory.
   - Nearby shelter discovery for citizens sorted by Haversine distance and interactive map visualization.

9. **Feature 9 — Community Volunteer & First-Responder Coordination**
   - Citizen volunteer registration with non-hazardous skill validation (First Aid, Translation, Food/Water Distribution, Shelter Support).
   - Strict safety separation ensuring volunteers are never assigned to active emergency hazards or fires.
   - Admin approval workflow (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`) and human review of participation requests.
   - Privacy protection rounding volunteer coordinates (~1km precision) for public views.

---

## Technology Stack

- **Backend**: Java 17, Spring Boot 3.3.2, Spring Security (JJWT 0.12.6), Spring Data JPA, Hibernate, Haversine Geo Utility.
- **Frontend**: React 19 (`^19.2.8`), React Router v7 (`^7.18.2`), Vite (`^8.2.0`), Axios (`^1.19.0`), Lucide Icons (`^1.31.0`), Leaflet Maps (`^1.9.4`), React-Leaflet (`^5.0.0`).
- **Database**: H2 File Database (default for instant setup: `./data/safecity_db`) or MySQL 8.0+.
- **Build Tools**: Apache Maven (`mvnw`), Node.js / npm.

---

## User Roles & Demo Accounts

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@safecity.com` | `Admin123!` | Full Command Center: Reports, Responders, Resources, Broadcasts, Shelters, Volunteers, Analytics |
| **Citizen** | `citizen@safecity.com` | `Citizen123!` | Citizen Portal: Report SOS/Emergency, Safety Map, Shelters, Volunteer Center, AI Assistant, Notifications |
| **Responder** | `responder@safecity.com` | `Responder123!` | Responder Roster: View Assigned Incidents, Update Status, Add Response Notes |

---

## Getting Started

### Prerequisites
- **Java**: JDK 17 or higher
- **Node.js**: v18 or higher
- **npm**: v9 or higher

### Running the Backend

```bash
cd backend
.\mvnw.cmd spring-boot:run
```
*The Spring Boot server will start on `http://localhost:8080`. H2 database is initialized automatically via DataInitializer.*

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```
*The Vite frontend server will start on `http://localhost:5173`.*

### Production Build

```bash
cd frontend
npm run build
```
*The built frontend static assets are automatically output to `backend/src/main/resources/static` so Spring Boot serves the production web application directly.*

---

## Project Structure

```
SafeCity/
├── backend/
│   ├── src/main/java/com/safecity/
│   │   ├── config/          # JWT & Security Configuration
│   │   ├── controller/      # REST API Controllers (Features 1–9)
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # JPA Entities
│   │   ├── exception/       # Global Exception Handlers
│   │   ├── repository/      # Spring Data Repositories
│   │   ├── scheduler/       # SLA Escalation Scheduler
│   │   ├── service/         # Business Logic & Implementation
│   │   └── util/            # Haversine & Helper Utilities
│   ├── src/main/resources/  # application.yml, Static Web Assets
│   │   └── static/          # Production React Bundle (Required)
│   ├── src/test/java/       # Maven Test Suite (81 Passing Tests)
│   ├── mvnw / mvnw.cmd      # Maven Executable Wrapper
│   └── pom.xml              # Maven Project Manifest
├── frontend/
│   ├── src/
│   │   ├── assets/          # Web Assets & Styling
│   │   ├── components/      # Reusable UI Cards, Buttons, Navbar, Maps
│   │   ├── context/         # AuthContext & Session Management
│   │   ├── pages/           # Citizen, Admin, Responder Views (Features 1–9)
│   │   └── services/        # Axios API Client & Endpoints
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
└── README.md
```

---

## License & Safety Notice

SafeCity is designed for emergency management and civil defense operations. All volunteer features enforce strict safety separation, ensuring untrained citizens are never auto-assigned to active emergency hazards or life-threatening situations.
