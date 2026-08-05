# Gym Management System

A comprehensive, enterprise-grade gym management system built with modern technologies.

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/UI
- React Router
- React Hook Form
- Zod
- TanStack Query
- Axios
- Recharts
- Framer Motion

### Backend
- Python FastAPI
- SQLAlchemy
- Alembic
- JWT Authentication
- Role Based Access Control (RBAC)
- REST API
- Pydantic

### Database
- PostgreSQL

### Deployment
- Docker
- Docker Compose
- Nginx

## Features

### Authentication & Authorization
- Secure JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Multiple user roles: Super Admin, Owner, Branch Manager, Receptionist, Cashier, Trainer, Accountant
- Password reset functionality

### Member Management
- Complete CRM for gym members
- Member profiles with photos
- Membership status tracking
- Search, filter, and pagination
- Import/Export functionality

### Membership Plans
- Unlimited membership plans
- Flexible pricing and duration
- Freeze days support
- Visit limits

### Check-in System
- QR code support
- Barcode support
- RFID ready
- Manual check-in
- Visit history tracking

### Trainers
- Trainer profiles
- Schedule management
- Specialization tracking
- Member assignment

### Workout Programs
- Custom workout plans
- Exercise tracking
- Progress monitoring
- Sets, reps, weight tracking

### Nutrition Plans
- Custom nutrition plans
- Calorie and macro tracking
- Meal planning
- Progress tracking

### Body Measurements
- Comprehensive measurement tracking
- BMI calculation
- Progress charts
- Before/after photos

### Group Classes
- Yoga, CrossFit, Zumba, Cardio
- Class scheduling
- Booking system
- Capacity management
- Waiting list

### Payments & Billing
- Multiple payment methods (Cash, Credit Card, Bank Transfer, Apple Pay)
- Invoice generation
- Partial payments
- Refunds
- Discounts and taxes

### Point of Sale (POS)
- Barcode scanner support
- Receipt printing
- Discounts
- Returns
- Real-time inventory updates

### Inventory Management
- Product tracking
- Supplier management
- Low stock alerts
- Purchase and selling prices

### Reports
- Revenue reports
- Membership reports
- Attendance reports
- Sales reports
- Inventory reports
- Trainer reports
- Export to PDF/Excel

### Multi-Branch Support
- Unlimited branches
- Branch-specific data
- Branch management

### Settings
- Gym configuration
- Business hours
- Tax rates
- Currency settings
- Language support (English/Arabic)

### Additional Features
- Dark/Light mode
- RTL support (Arabic)
- Responsive design
- Audit logging
- Notifications
- Global search

## Installation

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- PostgreSQL 15+

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd gym_mangment_system
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start the services:
```bash
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost/api
- API Documentation: http://localhost/api/docs

### Local Development

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up database:
```bash
# Set DATABASE_URL in .env file
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gym_db"
```

5. Run the server:
```bash
uvicorn main:app --reload
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment:
```bash
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000/api/v1
```

4. Run the development server:
```bash
npm run dev
```

## Project Structure

```
gym_mangment_system/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication utilities
│   ├── dependencies.py      # FastAPI dependencies
│   ├── routers/             # API route handlers
│   │   ├── auth.py
│   │   ├── members.py
│   │   ├── memberships.py
│   │   ├── checkins.py
│   │   ├── trainers.py
│   │   ├── workouts.py
│   │   ├── nutrition.py
│   │   ├── measurements.py
│   │   ├── classes.py
│   │   ├── payments.py
│   │   ├── pos.py
│   │   ├── inventory.py
│   │   ├── reports.py
│   │   ├── settings.py
│   │   └── audit.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/          # UI components (Shadcn)
│   │   │   ├── layout.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── i18n-provider.tsx
│   │   ├── contexts/        # React contexts
│   │   │   └── auth-context.tsx
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## API Documentation

Once the backend is running, access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Default Credentials

For initial setup, create a super admin user via the API or directly in the database.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team.
