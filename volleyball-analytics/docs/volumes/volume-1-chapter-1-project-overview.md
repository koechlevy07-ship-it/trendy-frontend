# VOLUME 1: MASTER BLUEPRINT & SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

---

## DOCUMENT CONTROL

| Field | Value |
|---|---|
| **Project Title** | AI-Based Real-Time Volleyball Player Performance Analysis and Statistics Management System Using Computer Vision |
| **Document Version** | 1.0 |
| **Document Status** | Draft |
| **Classification** | Academic / Commercial |
| **Prepared By** | Software Engineering Team |
| **Date** | July 2025 |

---

## TABLE OF CONTENTS — VOLUME 1

| Chapter | Title | Status |
|---|---|---|
| 1 | Project Overview | ✅ Complete |
| 2 | Software Architecture & System Design | Pending |
| 3 | Functional Requirements | Pending |
| 4 | Non-Functional Requirements | Pending |
| 5 | Use Cases & User Stories | Pending |
| 6 | Technology Stack & Justification | Pending |
| 7 | Development Roadmap | Pending |
| 8 | Risk Analysis & Mitigation | Pending |

---

# CHAPTER 1: PROJECT OVERVIEW

---

## 1.1 Project Title

**AI-Based Real-Time Volleyball Player Performance Analysis and Statistics Management System Using Computer Vision**

---

## 1.2 Project Description

The AI-Based Real-Time Volleyball Player Performance Analysis and Statistics Management System is an intelligent sports analytics platform that uses **Computer Vision** and **Artificial Intelligence** to automatically observe a volleyball match through one or more cameras, detect players and the ball, recognize volleyball actions, generate player and team statistics in real time, and present insights through a modern web dashboard.

Unlike traditional volleyball statistics systems that rely on manual input by statisticians, this system performs automatic analysis directly from **live video streams**. It continuously tracks players and the ball, recognizes game events, updates statistics, and generates comprehensive reports without human intervention.

The project is intended for **schools, universities, volleyball clubs, coaches, analysts, and sports organizations** seeking an affordable alternative to commercial analytics platforms.

---

## 1.3 Problem Statement

Traditional volleyball statistics are usually collected manually by trained statisticians. This approach has several critical limitations:

| Problem | Impact |
|---|---|
| **Human errors during data entry** | Inaccurate statistics that mislead coaching decisions |
| **High operational costs** | Need for dedicated, trained statisticians per match |
| **Delayed availability of statistics** | Coaches cannot make real-time tactical adjustments |
| **Inconsistent analysis across observers** | Different statisticians produce different results for the same match |
| **Limited access for schools and amateur clubs** | Commercial sports analytics platforms are too expensive |

This project addresses these limitations by developing an **AI-powered system** capable of automatically generating match statistics using computer vision techniques, eliminating the need for manual data entry while improving accuracy and reducing cost.

---

## 1.4 Aim

To develop an **AI-powered volleyball analytics platform** that automatically detects volleyball events and generates player performance statistics in real time using ordinary video cameras.

---

## 1.5 Main Objectives

| ID | Objective | Description |
|---|---|---|
| **OBJ-01** | Video Capture | Capture live video from webcam, mobile phone camera, IP camera, or recorded video files |
| **OBJ-02** | Object Detection | Automatically detect volleyball court, players, ball, and net |
| **OBJ-03** | Player Identification | Automatically identify every player by jersey number, team, position, and tracking ID |
| **OBJ-04** | Player Tracking | Track every player continuously throughout the match |
| **OBJ-05** | Ball Tracking | Track the volleyball throughout every rally |
| **OBJ-06** | Action Recognition | Recognize volleyball actions including serve, ace, reception, set, spike, kill, block, dig, free ball, attack error, service error, net touch, and rotation fault |
| **OBJ-07** | Automatic Statistics | Automatically update statistics without manual input |
| **OBJ-08** | Data Storage | Store all statistics in a centralized database |
| **OBJ-09** | Live Dashboard | Display real-time dashboards during match playback |
| **OBJ-10** | Reporting | Generate comprehensive reports after every match |

---

## 1.6 Research Objectives

The research component of the project includes:

| ID | Research Objective |
|---|---|
| **RES-01** | Evaluate AI-based volleyball event recognition accuracy |
| **RES-02** | Compare automated statistics with manually collected statistics |
| **RES-03** | Measure player tracking accuracy across different camera angles |
| **RES-04** | Measure ball detection and trajectory prediction accuracy |
| **RES-05** | Evaluate real-time processing performance under varying conditions |
| **RES-06** | Demonstrate a low-cost alternative to commercial volleyball analytics systems |

---

## 1.7 Scope

### 1.7.1 Match Management

| Feature | Description |
|---|---|
| Create matches | Register new matches with teams, date, venue, and tournament |
| Start matches | Begin live analysis when match starts |
| Pause matches | Temporarily halt analysis during breaks |
| End matches | Conclude match and finalize statistics |

### 1.7.2 Team Management

| Feature | Description |
|---|---|
| Register teams | Create team profiles with name, logo, and details |
| Team rosters | Maintain complete player rosters per team |
| Coach assignment | Assign coaches to teams |
| Team logos | Upload and manage team branding |

### 1.7.3 Player Management

| Feature | Description |
|---|---|
| Register players | Create player profiles with full details |
| Jersey numbers | Assign and track jersey numbers |
| Playing positions | Record primary and secondary positions |
| Physical attributes | Store height, weight, and age |
| Team assignment | Assign players to teams with history |

### 1.7.4 AI Analysis

Automatic detection of:

- Players (with jersey number identification)
- Ball (with trajectory prediction)
- Court (lines and boundaries)
- Net (position and height)

### 1.7.5 Player Tracking

Continuous tracking of:

- Every player on court (position, speed, direction)
- Volleyball (position, velocity, trajectory)

### 1.7.6 Event Recognition

Automatic recognition of volleyball events:

| Category | Events |
|---|---|
| **Serving** | Serve, Serve Ace, Service Error |
| **Attacking** | Spike, Kill, Attack Error, Free Ball |
| **Blocking** | Block, Solo Block, Block Assist |
| **Defense** | Dig, Save |
| **Receiving** | Reception, Perfect Reception |
| **Setting** | Assist, Setting Error |
| **Faults** | Net Touch, Rotation Fault |

### 1.7.7 Statistics Generation

Automatic generation of the following statistics:

#### Serving Statistics
- Total serves
- Aces
- Errors
- Serve percentage

#### Attacking Statistics
- Attack attempts
- Kills
- Attack errors
- Kill percentage

#### Blocking Statistics
- Solo blocks
- Block assists
- Total blocks

#### Defensive Statistics
- Digs
- Saves

#### Receiving Statistics
- Reception attempts
- Perfect receptions
- Reception efficiency

#### Setting Statistics
- Assists
- Setting errors

#### Movement Statistics
- Distance covered (meters)
- Average speed (km/h)
- Maximum speed (km/h)

#### Jump Statistics
- Number of jumps
- Estimated jump height
- Average jump height

### 1.7.8 Reporting

Generate the following reports:

- Match reports (full match summary)
- Player reports (individual performance)
- Team reports (team performance)
- Tournament reports (across multiple matches)

---

## 1.8 Expected Users

The system shall support different user roles:

### Administrator

| Responsibility |
|---|
| Managing users (create, edit, delete, assign roles) |
| Managing teams (register, update, deactivate) |
| Managing players (register, update, assign) |
| Managing tournaments (create, configure, schedule) |
| Viewing system-wide reports |
| Configuring AI settings and thresholds |

### Coach

| Responsibility |
|---|
| Watch live statistics during matches |
| Review match videos with overlay |
| View player performance trends |
| Download and share reports |
| Compare players across matches |
| View heat maps and tactical insights |

### Statistician (Optional)

| Responsibility |
|---|
| Review AI-generated events for accuracy |
| Correct AI errors if necessary |
| Validate and approve statistics |
| Flag uncertain detections for review |

### Analyst

| Responsibility |
|---|
| Analyze player performance over time |
| Compare teams and players |
| Review tactical insights and patterns |
| Generate custom reports |
| Export data for further analysis |

---

## 1.9 Expected Benefits

| Benefit | Description |
|---|---|
| **Eliminate manual data entry** | Fully automated statistics collection |
| **Reduce operational costs** | No need for dedicated statisticians |
| **Improve statistical accuracy** | AI-based detection reduces human error |
| **Provide real-time analytics** | Instant statistics during live matches |
| **Improve coaching decisions** | Data-driven tactical adjustments |
| **Support talent identification** | Identify promising players through performance data |
| **Player self-evaluation** | Players can review their own performance |
| **Affordable analytics** | Accessible for schools, universities, and amateur clubs |

---

## 1.10 System Modules

The completed platform will consist of the following **20 modules**:

| Module ID | Module Name | Category |
|---|---|---|
| MOD-01 | Authentication System | Core |
| MOD-02 | User Management | Core |
| MOD-03 | Team Management | Core |
| MOD-04 | Player Management | Core |
| MOD-05 | Tournament Management | Core |
| MOD-06 | Match Management | Core |
| MOD-07 | Camera Management | AI Pipeline |
| MOD-08 | AI Detection Engine | AI Pipeline |
| MOD-09 | Player Tracking Engine | AI Pipeline |
| MOD-10 | Ball Tracking Engine | AI Pipeline |
| MOD-11 | Pose Estimation Engine | AI Pipeline |
| MOD-12 | Volleyball Action Recognition Engine | AI Pipeline |
| MOD-13 | Statistics Engine | Analytics |
| MOD-14 | Database Management | Infrastructure |
| MOD-15 | REST API | Infrastructure |
| MOD-16 | Live Dashboard | Frontend |
| MOD-17 | Reports | Analytics |
| MOD-18 | Heat Maps | Analytics |
| MOD-19 | Player Rankings | Analytics |
| MOD-20 | AI Insights | Analytics |

### Module Descriptions

#### MOD-01: Authentication System
User login, registration, password management, JWT tokens, session management, role-based access control.

#### MOD-02: User Management
CRUD operations for users, role assignment, profile management, activity logs.

#### MOD-03: Team Management
Team registration, roster management, coach assignment, team logos, team statistics aggregation.

#### MOD-04: Player Management
Player registration, jersey number assignment, position tracking, physical attributes, performance history.

#### MOD-05: Tournament Management
Tournament creation, match scheduling, standings, bracket management, tournament statistics.

#### MOD-06: Match Management
Match creation, live match control (start/pause/end), match events, match statistics, match video association.

#### MOD-07: Camera Management
Camera connection, stream configuration, resolution management, multi-camera support, recording.

#### MOD-08: AI Detection Engine
YOLO-based object detection for players, ball, court, and net. Frame-by-frame detection pipeline.

#### MOD-09: Player Tracking Engine
ByteTrack-based multi-object tracking for continuous player identification and position tracking.

#### MOD-10: Ball Tracking Engine
Ball detection, trajectory prediction, velocity calculation, rally detection.

#### MOD-11: Pose Estimation Engine
MediaPipe-based body pose estimation for action recognition input and jump height estimation.

#### MOD-12: Volleyball Action Recognition Engine
Classification of volleyball actions from tracking data and pose estimation results.

#### MOD-13: Statistics Engine
Real-time statistics computation, aggregation, and database updates from recognized events.

#### MOD-14: Database Management
PostgreSQL database schema, migrations, seed data, backups, optimization.

#### MOD-15: REST API
FastAPI-based REST API serving all frontend and external integration needs.

#### MOD-16: Live Dashboard
React-based real-time dashboard showing live statistics, player positions, and match status.

#### MOD-17: Reports
PDF/Excel report generation for matches, players, teams, and tournaments.

#### MOD-18: Heat Maps
Court heat maps showing player movement patterns, attack zones, and defensive coverage.

#### MOD-19: Player Rankings
Ranking system based on performance metrics, position-specific criteria, and historical data.

#### MOD-20: AI Insights
AI-generated insights including Player of the Match, Best Server, Best Attacker, Best Blocker, Best Receiver, Best Setter, and Match MVP Prediction.

---

## 1.11 Development Phases

The project will be implemented in the following **10 phases**:

| Phase | Name | Description | Modules Covered |
|---|---|---|---|
| **Phase 1** | Project Setup & Architecture | Environment configuration, folder structure, Docker setup, CI/CD | Infrastructure |
| **Phase 2** | Database Design & Backend API | Database schema, FastAPI backend, REST endpoints | MOD-14, MOD-15 |
| **Phase 3** | Frontend Dashboard | React application, routing, authentication UI | MOD-01, MOD-02, MOD-16 |
| **Phase 4** | Computer Vision Pipeline | Camera input, frame processing, preprocessing | MOD-07 |
| **Phase 5** | Object Detection & Tracking | YOLO detection, ByteTrack tracking, ball tracking | MOD-08, MOD-09, MOD-10 |
| **Phase 6** | Pose Estimation & Action Recognition | MediaPipe integration, action classification | MOD-11, MOD-12 |
| **Phase 7** | Automatic Statistics Generation | Statistics computation, real-time updates | MOD-13 |
| **Phase 8** | Reporting & Analytics | Reports, heat maps, rankings, AI insights | MOD-17, MOD-18, MOD-19, MOD-20 |
| **Phase 9** | Performance Optimization | GPU acceleration, latency reduction, caching | All |
| **Phase 10** | Testing, Deployment & Documentation | Testing, Docker deployment, documentation | All |

---

## 1.12 AI Insights — Special Recognition Awards

The system shall automatically generate the following AI-powered recognition awards:

| Award | Criteria |
|---|---|
| **Player of the Match** | Highest overall performance score combining all statistics |
| **Best Server** | Highest serve efficiency (aces vs errors) |
| **Best Attacker** | Highest kill percentage and attack volume |
| **Best Blocker** | Most blocks (solo + assists) |
| **Best Receiver** | Highest reception efficiency |
| **Best Setter** | Most assists with lowest setting errors |
| **Match MVP Prediction** | AI-predicted most valuable player based on weighted performance metrics |

---

## 1.13 Video Input Sources

The system shall support the following video input sources:

| Source | Connection Method | Use Case |
|---|---|---|
| **Webcam** | USB / Built-in | Local analysis, testing |
| **Mobile Phone Camera** | WiFi / USB Tethering | Low-cost field setup |
| **IP Camera** | Network (RTSP/HTTP) | Permanent venue installation |
| **Recorded Video** | File upload | Post-match analysis |

---

## 1.14 Key Definitions

| Term | Definition |
|---|---|
| **Computer Vision** | Field of AI that enables computers to interpret and understand visual information from images and videos |
| **Object Detection** | Identifying and locating objects within an image or video frame |
| **Object Tracking** | Following objects across consecutive video frames |
| **Pose Estimation** | Detecting human body keypoints and estimating body posture |
| **Action Recognition** | Classifying human actions from visual data |
| **YOLO** | You Only Look Once — a real-time object detection algorithm |
| **ByteTrack** | A multi-object tracking algorithm |
| **MediaPipe** | Google's framework for building multimodal ML pipelines |
| **OCR** | Optical Character Recognition — reading text from images |
| **Rally** | A sequence of play between a serve and a point-ending event |
| **Heat Map** | A visual representation of data density over a court area |
| **FPS** | Frames Per Second — measure of video processing speed |

---

## 1.15 Document Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | July 2025 | Development Team | Initial release — Chapter 1 complete |

---

**END OF CHAPTER 1**

**Next:** Chapter 2 — Software Architecture & System Design
