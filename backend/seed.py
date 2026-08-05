from database import engine, SessionLocal, Base
from models import User, Branch, GymSettings, MembershipPlan, Member
from auth import get_password_hash
from datetime import date, datetime

def seed_database():
    db = SessionLocal()
    
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # Check if data already exists
        if db.query(User).first():
            print("Database already seeded. Skipping seed.")
            return
        
        # Create default branch
        branch = Branch(
            name="Main Branch",
            address="123 Gym Street, Fitness City",
            phone="+1234567890",
            email="main@gympro.com"
        )
        db.add(branch)
        db.commit()
        db.refresh(branch)
        
        # Create super admin user
        super_admin = User(
            email="admin@gympro.com",
            full_name="Super Admin",
            hashed_password=get_password_hash("admin123"),
            role="super_admin",
            phone="+1234567890",
            branch_id=branch.id
        )
        db.add(super_admin)
        db.commit()
        db.refresh(super_admin)
        
        # Create gym settings
        settings = GymSettings(
            name="GymPro Fitness Center",
            address="123 Gym Street, Fitness City",
            phone="+1234567890",
            email="info@gympro.com",
            currency="USD",
            tax_rate=0.1,
            business_hours={
                "monday": {"open": "06:00", "close": "22:00", "is_closed": False},
                "tuesday": {"open": "06:00", "close": "22:00", "is_closed": False},
                "wednesday": {"open": "06:00", "close": "22:00", "is_closed": False},
                "thursday": {"open": "06:00", "close": "22:00", "is_closed": False},
                "friday": {"open": "06:00", "close": "22:00", "is_closed": False},
                "saturday": {"open": "08:00", "close": "20:00", "is_closed": False},
                "sunday": {"open": "08:00", "close": "20:00", "is_closed": False}
            },
            languages=["en", "ar"]
        )
        db.add(settings)
        db.commit()
        
        # Create membership plans
        plans = [
            MembershipPlan(
                name="Daily Pass",
                price=10.0,
                duration_days=1,
                freeze_days=0,
                max_visits=1,
                description="Single day access to all facilities",
                branch_id=branch.id
            ),
            MembershipPlan(
                name="Weekly Pass",
                price=50.0,
                duration_days=7,
                freeze_days=0,
                max_visits=7,
                description="One week unlimited access",
                branch_id=branch.id
            ),
            MembershipPlan(
                name="Monthly Basic",
                price=99.0,
                duration_days=30,
                freeze_days=3,
                max_visits=None,
                description="Monthly membership with 3 freeze days",
                branch_id=branch.id
            ),
            MembershipPlan(
                name="Monthly Premium",
                price=149.0,
                duration_days=30,
                freeze_days=5,
                max_visits=None,
                description="Premium membership with group classes access",
                branch_id=branch.id
            ),
            MembershipPlan(
                name="Quarterly",
                price=269.0,
                duration_days=90,
                freeze_days=10,
                max_visits=None,
                description="3 months membership with 10 freeze days",
                branch_id=branch.id
            ),
            MembershipPlan(
                name="Annual",
                price=899.0,
                duration_days=365,
                freeze_days=30,
                max_visits=None,
                description="Full year membership with 30 freeze days",
                branch_id=branch.id
            )
        ]
        
        for plan in plans:
            db.add(plan)
        db.commit()
        
        # Create sample members
        members = [
            Member(
                full_name="John Doe",
                phone="+1234567891",
                email="john.doe@example.com",
                gender="male",
                birth_date=date(1990, 1, 15),
                address="456 Member Ave, Fitness City",
                emergency_contact="Jane Doe +1234567892",
                height=180.0,
                weight=80.0,
                join_date=date(2024, 1, 1),
                membership_status="active",
                branch_id=branch.id
            ),
            Member(
                full_name="Jane Smith",
                phone="+1234567893",
                email="jane.smith@example.com",
                gender="female",
                birth_date=date(1992, 5, 20),
                address="789 Fitness Blvd, Fitness City",
                emergency_contact="Bob Smith +1234567894",
                height=165.0,
                weight=55.0,
                join_date=date(2024, 2, 15),
                membership_status="active",
                branch_id=branch.id
            ),
            Member(
                full_name="Mike Johnson",
                phone="+1234567895",
                email="mike.johnson@example.com",
                gender="male",
                birth_date=date(1988, 8, 10),
                address="321 Health Street, Fitness City",
                emergency_contact="Sarah Johnson +1234567896",
                height=175.0,
                weight=75.0,
                join_date=date(2024, 3, 1),
                membership_status="active",
                branch_id=branch.id
            )
        ]
        
        for member in members:
            db.add(member)
        db.commit()
        
        print("Database seeded successfully!")
        print("\nDefault credentials:")
        print("Email: admin@gympro.com")
        print("Password: admin123")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
