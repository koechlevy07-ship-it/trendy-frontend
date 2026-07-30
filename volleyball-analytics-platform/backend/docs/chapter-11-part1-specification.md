# Chapter 11 - Team & Organization Management Module
## Part 1 - Enterprise Engineering Specification

---

## 11.1 Chapter Overview

The **Team & Organization Management Module** is the authoritative organizational management subsystem of the AI-Powered Volleyball Analytics Platform. It is responsible for managing the hierarchical structure of all organizations participating in the platform, including:

- **Federations** (National, Regional)
- **Leagues** (Professional, Amateur)
- **Clubs** (Professional, Amateur)
- **Academies** (Youth Development, Talent Identification)
- **Schools** (Educational Institutions)
- **Universities** (Sports Departments)
- **National Teams** (Senior, U23, U21, U19, U17, Beach, Sitting)
- **Regional Organizations** (Counties, Provinces, Districts)

This module provides the structural backbone that links together:
- Players, Coaches, Officials
- Competitions, Venues
- Analytics, AI-generated match data
- Statistics, Training Management

It serves as the **single source of truth** for all organizational entities and their relationships.

---

## 11.2 Engineering Objectives

### Identity Management
- Maintain one unique record per organization
- Duplicate identities shall never exist

### Team Assignment
- Support assignment of players and staff to:
  - Clubs
  - National teams
  - Academies
  - Schools
  - Universities
- An individual may belong to multiple organizations over time
- Historical assignments shall never be deleted

### Career History
- Maintain complete career records including:
  - Previous clubs
  - Jersey numbers
  - Seasons
  - Positions
  - Awards
  - Transfers
- Historical information remains immutable after archival

### AI Integration
Every organization and team profile shall expose AI metadata used by Computer Vision:
- Team identifiers
- Jersey templates
- Team color profiles
- Logo references
- Court preferences
- AI recognition metadata

The AI Engine shall never store duplicate organization/team identity information.

### Medical Integration
Medical personnel shall access:
- Injury history
- Recovery progress
- Physical assessments
Without modifying organization/team identity records.

### Security
- Personal information protected according to RBAC policies
- Only authorized personnel may edit identity records

### Scalability
Architecture shall support:
- Millions of organizations
- Millions of teams
- Multi-country deployment
- Multi-federation deployment
- Cloud-native horizontal scaling

---

## 11.3 Functional Scope

### Entity Categories

#### Federation (Highest Governing Authority)
- League administration
- Organization registration
- Competition governance
- Policy enforcement
- National team management

#### League (Competition Organizer)
- Season management
- Club registration
- Fixture ownership
- Standings management

#### Club (Professional/Amateur)
- Multiple teams
- Staff management
- Player registration
- Facilities
- Historical records

#### Academy (Youth Development)
- Youth development programs
- Talent identification
- Training programs
- Player progression tracking

#### Educational Institutions
- Schools
- Colleges
- Universities
- Sports departments

#### National Teams
- Senior team
- U23, U21, U19, U17
- Beach Volleyball
- Sitting Volleyball

#### Regional Organizations
- Counties
- Provinces
- Districts
- Regional Associations

---

## 11.4 Domain Architecture

```
                    Federation
                         │
         ┌───────────────┼────────────────┐
         │               │                │
     Leagues      Regional Bodies   National Teams
         │               │
         │               │
      Organizations (Clubs, Schools, Universities, Academies)
                         │
                  ┌──────┴─────────┐
                  │                │
              Teams          Training Units
                  │
        ┌─────────┼──────────┐
        │         │          │
    Players    Coaches    Support Staff
```

The hierarchy shall be extensible without requiring database redesign.

---

## 11.5 Backend Folder Structure

```
backend/
└── src/
    └── modules/
        ├── organization/
        │   ├── controllers/
        │   ├── services/
        │   ├── repositories/
        │   ├── validators/
        │   ├── middlewares/
        │   ├── routes/
        │   ├── dto/
        │   ├── schemas/
        │   └── events/
        │
        ├── team/
        │   ├── controllers/
        │   ├── services/
        │   ├── repositories/
        │   ├── validators/
        │   ├── middlewares/
        │   ├── routes/
        │   ├── dto/
        │   ├── schemas/
        │   └── events/
        │
        ├── season/
        ├── branding/
        ├── facilities/
        ├── shared/
        └── common/
```

**Every module follows identical layered architecture.**

---

## 11.6 Layered Architecture

Every request passes through:

```
HTTP Request
      │
      ▼
API Router
      │
      ▼
Authentication
      │
      ▼
Authorization
      │
      ▼
Validation
      │
      ▼
Controller
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
MongoDB
      │
      ▼
Response Builder
      │
      ▼
HTTP Response
```

### Responsibilities

| Layer | Responsibilities |
|-------|------------------|
| **Controller** | Receive HTTP requests, parse parameters, invoke services, return standardized responses |
| **Service** | Business rules, workflow execution, transaction management, domain events |
| **Repository** | MongoDB queries, aggregation pipelines, pagination, indexed queries |
| **Validator** | DTO validation, data normalization, schema enforcement |
| **Controller** | Never: business logic, direct DB queries, complex validation |

---

## 11.7 Organization Domain Model

### Organization Entity
```
Organization
├── Identity
│   ├── id (UUID)
│   ├── organizationId (business key)
│   ├── name (legal name)
│   ├── shortName (abbreviated)
│   ├── displayName
│   ├── type (OrganizationType enum)
│   └── status (OrganizationStatus enum)
│
├── Registration
│   ├── registrationNumber
│   ├── registrationDate
│   ├── registrationAuthority
│   ├── licenseNumber
│   └── licenseExpiry
│
├── Governance
│   ├── parentOrganizationId
│   ├── governingBodyId
│   ├── affiliationDate
│   └── governanceTier (0=federation, 1=league, etc.)
│
├── Address
│   ├── street, city, stateProvince, country, postalCode
│   └── coordinates (lat/long)
│
├── Contact
│   ├── email, phone, website, socialMedia
│
├── Branding
│   ├── primaryColor, secondaryColor, accentColor
│   ├── logoUrl, logoDarkUrl, logoLightUrl, faviconUrl, bannerUrl
│   └── brandingGuidelinesUrl
│
├── Teams (teamIds[])
├── Facilities (facilityIds[])
├── Documents (documentIds[])
├── Licenses (licenseIds[])
├── Competition Membership (competitionIds[])
│
├── AI Metadata
│   ├── organizationEmbedding (vector)
│   ├── teamColorProfile (primary/secondary/accent)
│   ├── jerseyTemplates (home/away/alternate)
│   ├── logoReferences
│   └── courtPreferences
│
├── Multi-tenancy
│   ├── tenantId
│   └── dataRegion
│
├── Audit Information
│   ├── createdAt, updatedAt, createdBy, updatedBy
│   ├── version (optimistic locking)
│   ├── isDeleted, deletedAt, deletedBy
│
└── Historical Records (immutable)
```

### Organization Types
- `FEDERATION` - National governing body
- `LEAGUE` - Competition organizer
- `CLUB` - Professional/amateur club
- `ACADEMY` - Youth development
- `SCHOOL` - Educational institution
- `UNIVERSITY` - Higher education
- `REGIONAL` - County/province/district
- `NATIONAL_TEAM` - National team program

### Organization Status
- `PENDING_VERIFICATION`
- `ACTIVE`
- `SUSPENDED`
- `ARCHIVED`
- `DISSOLVED`

---

## 11.8 Team Domain Model

### Team Entity
```
Team
├── Team Identity
│   ├── id (UUID)
│   ├── teamId (business key)
│   ├── name, shortName, displayName
│   ├── organizationId (parent reference)
│   ├── category (TeamCategory enum)
│   ├── gender (TeamGender enum)
│   └── status (TeamStatus enum)
│
├── Team Details
│   ├── division, level, foundingDate, foundingSeason
│
├── League Membership
│   ├── leagueIds[]
│   ├── currentSeasonId
│   └── seasonHistory[] (TeamSeasonRecord[])
│
├── Roster
│   ├── activeRoster (TeamRosterEntry[])
│   └── historicalRoster (immutable, all-time players)
│
├── Coaching Staff
│   └── coachingStaff[] (TeamCoachingStaffEntry[])
│
├── AI Recognition Metadata
│   ├── teamEmbedding (vector)
│   ├── jerseyRecognition (home/away/alternate/goalkeeper)
│   │   ├── primaryColor, secondaryColor, pattern, numberFont, numberColor
│   ├── logoUrl, teamPhotoUrl
│   ├── courtSidePreference
│   └── recognitionConfidenceThreshold
│
├── Branding (optional override)
│   ├── primaryColor, secondaryColor, accentColor
│   ├── logoUrl, mascot, nickname
│
├── References
│   ├── statisticsProfileId
│   ├── medicalProfileId
│   ├── trainingProgramId
│   └── scheduleId
│
├── Audit Information
└── Historical Records (immutable)
```

### Team Categories
- `SENIOR_MEN`, `SENIOR_WOMEN`
- `U23`, `U21`, `U19`, `U17`
- `YOUTH`, `JUNIOR`
- `PARA_VOLLEYBALL`, `BEACH_VOLLEYBALL`, `SITTING_VOLLEYBALL`
- `DEVELOPMENT`, `ACADEMY`, `RECREATIONAL`

### Team Gender
- `MEN`, `WOMEN`, `COED`

### Team Status
- `REGISTERING`, `ACTIVE`, `INACTIVE`, `SUSPENDED`, `ARCHIVED`, `DISBANDED`

---

## 11.9 Organization Lifecycle

```
Registration
      │
      ▼
Document Verification
      │
      ▼
Approval
      │
      ▼
Organization Creation
      │
      ▼
Administrator Assignment
      │
      ▼
Team Registration
      │
      ▼
Competition Enrollment
      │
      ▼
Operational Status
      │
      ▼
Suspension / Archive
```

**Each transition generates immutable audit records.**

---

## 11.10 Team Lifecycle

```
Team Registration
      │
      ▼
Organization Validation
      │
      ▼
Coach Assignment
      │
      ▼
Player Registration
      │
      ▼
Competition Enrollment
      │
      ▼
Season Activation
      │
      ▼
AI Recognition Initialization
      │
      ▼
Active Competition
      │
      ▼
Season Completion
      │
      ▼
Archive Historical Data
```

**Historical team data shall never be overwritten.**

---

## 11.11 AI Developer Master Prompt

**Objective:** Develop the Team & Organization Management Module (Part 1) as the authoritative subsystem for managing organizations, clubs, leagues, federations, academies, schools, universities, national teams, and team structures within the AI-Powered Volleyball Analytics Platform.

**Execution Rules:**
- Use Node.js, Express.js, MongoDB, and Mongoose
- Organize code under `src/modules/` with dedicated folders for organization, team, roles, and assignment
- Enforce DTO-based validation before service execution
- Build standardized API response structures and centralized error handling
- Design entities to support future AI computer vision integration, historical team assignments, and multi-organization membership without schema-breaking changes
- Implement comprehensive audit logging hooks and RBAC integration points
- Do not implement unrelated modules (matches, analytics, medical, or authentication internals) in this chapter; only expose integration interfaces where required
- Ensure the design is horizontally scalable, testable, and ready for enterprise deployment

---

## 11.12 Completion Report - Part 1

| Item | Status |
|------|--------|
| Chapter | 11 |
| Part | 1 |
| Module Architecture Defined | ✅ |
| Folder Structure Defined | ✅ |
| Organization Domain Model | ✅ |
| Team Domain Model | ✅ |
| Lifecycle Workflows | ✅ |
| AI Integration Points | ✅ |
| Execution Boundary Respected | ✅ |

### Files Created
- `src/modules/organization/schemas/organization.model.ts` - Domain models for Organization, Team, and related entities
- `src/modules/organization/architecture.ts` - Complete module architecture specification
- This specification document

### Execution Boundary
Part 1 concludes after defining:
- Chapter overview, engineering objectives, functional scope
- Domain architecture, backend folder structure, layered architecture
- Organization domain model, team domain model
- Organization lifecycle, team lifecycle
- AI Developer Master Prompt, AI Execution Package

**Part 2 will cover boundary respected execution boundary - no implementation code beyond architectural definitions.**

---

*End of Chapter 11 Part 1 Specification*