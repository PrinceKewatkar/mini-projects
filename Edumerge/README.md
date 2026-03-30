# Edumerge - Admission Management & CRM System

A web-based Admission Management system for colleges that allows configuring programs/quotas, managing applicants, allocating seats with quota validation, generating admission numbers, tracking documents/fees, and viewing dashboards.

## Tech Stack

- **Backend**: Django 5 + Django REST Framework
- **Frontend**: React 18
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

## Features

### Master Setup (Admin)
- Create Institution, Campus, Department, Program hierarchy
- Configure Academic Years
- Define Quotas (KCET, COMED-K, Management)
- Allocate seats per program per quota

### Applicant Management
- Create applicant profiles with 15 fields
- Track document status (Pending/Submitted/Verified)
- Category and entry type selection

### Admission Allocation
- Government flow with allotment number
- Management flow with direct allocation
- Real-time seat availability check
- Quota validation (no overbooking)

### Admission Confirmation
- Unique admission number generation
- Format: `{INSTITUTION}/{YEAR}/{COURSE_TYPE}/{PROGRAM}/{QUOTA}/{SEQUENCE}`
- Confirmed only after documents verified and fee paid

### Dashboards
- Total intake vs admitted statistics
- Quota-wise seat filling
- Pending documents list
- Pending fees list

### User Roles
- **Admin**: Full access (Masters + Admissions + Dashboard)
- **Admission Officer**: Admissions + Dashboard (no Masters)
- **Management**: View-only Dashboard

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 13+

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Edumerge
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# Create PostgreSQL database
# createdb edumerge
# Or using psql:
psql -U postgres -c "CREATE DATABASE edumerge;"

# Run migrations
python manage.py migrate

# Seed initial data (creates demo users and sample data)
python manage.py seed_data

# Start the backend server
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`

## Default Users

After running `seed_data`, you can login with:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Admission Officer | officer | officer123 |
| Management | management | management123 |

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Get current user

### Masters (Admin only for write operations)
- `GET/POST /api/institutions/` - Institution CRUD
- `GET/POST /api/campuses/` - Campus CRUD
- `GET/POST /api/departments/` - Department CRUD
- `GET/POST /api/programs/` - Program CRUD
- `GET/POST /api/academic-years/` - Academic Year CRUD
- `GET/POST /api/quotas/` - Quota CRUD
- `GET/POST /api/program-quotas/` - Program Quota CRUD

### Admissions
- `GET/POST /api/applicants/` - Applicant management
- `PATCH /api/applicants/{id}/verify_documents/` - Verify documents
- `PATCH /api/applicants/{id}/submit_documents/` - Submit documents
- `GET/POST /api/admissions/` - Admission management
- `POST /api/admissions/allocate/` - Allocate seat
- `POST /api/admissions/{id}/confirm/` - Confirm admission
- `PATCH /api/admissions/{id}/update_fee/` - Update fee status
- `GET /api/admissions/available_seats/` - Check seat availability

### Dashboard
- `GET /api/dashboard/summary/` - Dashboard summary
- `GET /api/dashboard/seat-status/` - Seat status by program
- `GET /api/dashboard/quota-status/` - Quota-wise filling
- `GET /api/dashboard/pending-documents/` - Applicants with pending documents
- `GET /api/dashboard/pending-fees/` - Admissions with pending fees

## Project Structure

```
Edumerge/
├── backend/
│   ├── config/           # Django project settings
│   ├── apps/
│   │   ├── users/        # User authentication & roles
│   │   ├── masters/       # Institution, Campus, Department, Program, Quota
│   │   ├── admissions/    # Applicant, Admission models
│   │   └── dashboard/     # Dashboard API endpoints
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable components (Sidebar, Modal, etc.)
│   │   ├── context/      # Auth context
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service
│   │   └── styles/       # CSS files
│   └── package.json
│
└── README.md
```

## Key Business Rules

1. **Quota Validation**: Total quota seats cannot exceed program intake
2. **Seat Blocking**: No allocation if quota is full
3. **Admission Number**: Generated only once, immutable
4. **Confirmation Rules**:
   - Documents must be verified
   - Fee must be paid
   - Then admission can be confirmed

## Running Tests

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests (if configured)
cd frontend
npm test
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=edumerge
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

## Demo Workflow

### 1. Admin Setup Flow
1. Login as Admin
2. Navigate to Setup → Create Institution → Campus → Department → Program
3. Configure Quotas and allocate seats per program

### 2. Admission Officer Flow
1. Login as Admission Officer
2. Create Applicant with details
3. Mark documents as Submitted → Verify documents
4. Allocate seat (checks availability automatically)
5. Update fee status to Paid
6. Confirm admission (generates admission number)

### 3. Management Flow
1. Login as Management
2. View Dashboard for statistics
3. Monitor seat filling, pending documents, pending fees

## AI Tools Used

This project was developed with assistance from Claude Code (Anthropic) for:
- Project architecture and structure
- Django models and API endpoints
- React components and state management
- Documentation

## License

This project is created for educational/assessment purposes.

## Support

For issues or questions, please contact deepak@edumerge.com