from database import SessionLocal
from models import (
    User, Branch, MembershipPlan, Member, Membership, CheckIn,
    Trainer, WorkoutProgram, Payment, AuditLog, GroupClass, ClassBooking,
    Product, Sale
)
from datetime import date, datetime, timedelta
from random import choice, randint, uniform, seed as rseed
import uuid

rseed(42)

def demo_status():
    """Populate the database with realistic demo data for charts and records."""
    db = SessionLocal()
    today = date.today()

    try:
        branch = db.query(Branch).first()
        if not branch:
            print("No branch found. Run seed.py first.")
            return
        admin = db.query(User).filter(User.email == "admin@gympro.com").first()
        if not admin:
            print("Admin user not found. Run seed.py first.")
            return

        # ---- Members (expand to ~20 with varied statuses) ----
        if db.query(Member).count() < 5:
            first_names = ["Alex", "Sara", "David", "Emma", "Chris", "Lily", "Omar", "Nora", "Ben", "Maya",
                            "Leo", "Ava", "Liam", "Zoe", "Ryan", "Ivy", "Ethan", "Luna", "Noah", "Aria"]
            last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
                           "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas",
                           "Taylor", "Moore", "Jackson", "Martin", "Lee"]
            genders = ["male", "female"]
            statuses = ["active", "active", "active", "active", "active", "active", "active", "expired", "pending", "suspended"]
            for i in range(20):
                fn = choice(first_names)
                ln = choice(last_names)
                gender = choice(genders)
                db.add(Member(
                    full_name=f"{fn} {ln}",
                    phone=f"+1{randint(1000000000, 9999999999)}",
                    email=f"{fn.lower()}.{ln.lower()}@example.com",
                    gender=gender,
                    birth_date=date(randint(1975, 2002), randint(1, 12), randint(1, 28)),
                    address=f"{randint(1, 999)} Fitness St, Fitness City",
                    emergency_contact="Emergency Contact +15551112222",
                    medical_notes=choice(["", "Asthma", "Lower back strain", "None", "Knee injury"]),
                    height=round(uniform(155, 195), 1),
                    weight=round(uniform(55, 110), 1),
                    join_date=today - timedelta(days=randint(1, 600)),
                    membership_status=choice(statuses),
                    branch_id=branch.id
                ))
            db.commit()
            print(f"Added {20} members")

        members = db.query(Member).all()
        plans = db.query(MembershipPlan).all()
        if not plans:
            print("No membership plans found. Run seed.py first.")
            return

        # ---- Memberships ----
        if db.query(Membership).count() == 0:
            for m in members:
                plan = choice(plans)
                start = m.join_date
                end = start + timedelta(days=plan.duration_days)
                status = m.membership_status
                if status == "expired" and end > today:
                    status = "active"
                db.add(Membership(
                    member_id=m.id,
                    plan_id=plan.id,
                    start_date=start,
                    end_date=end,
                    status=status,
                    remaining_visits=plan.max_visits,
                    freeze_days_used=randint(0, plan.freeze_days),
                    auto_renew=choice([True, False]),
                    created_at=datetime.combine(start, datetime.min.time())
                ))
            db.commit()
            print(f"Added {len(members)} memberships")

        # ---- Trainers ----
        if db.query(Trainer).count() == 0:
            trainer_names = [
                ("Coach Mike", "Strength & Conditioning"),
                ("Lena Foster", "Yoga & Pilates"),
                ("Sam Carter", "HIIT & Cardio"),
                ("Dana Reid", "Nutrition & Weight Loss"),
                ("Tony Cruz", "CrossFit"),
            ]
            for name, spec in trainer_names:
                db.add(Trainer(
                    name=name,
                    phone=f"+1{randint(1000000000, 9999999999)}",
                    email=name.lower().replace(" ", ".") + "@gympro.com",
                    salary=round(uniform(2500, 5000), 2),
                    specialization=spec,
                    schedule={"mon": "8-5", "tue": "8-5", "wed": "8-5", "thu": "8-5", "fri": "8-5"},
                    branch_id=branch.id
                ))
            db.commit()
            print("Added 5 trainers")

        trainers = db.query(Trainer).all()

        # ---- Workout Programs ----
        if db.query(WorkoutProgram).count() == 0:
            program_names = ["Weight Loss Plan", "Muscle Gain", "Full Body Blast", "Beginner Program",
                              "Strength Training", "Endurance Builder", "Core & Cardio"]
            for m in members:
                db.add(WorkoutProgram(
                    trainer_id=choice(trainers).id,
                    member_id=m.id,
                    name=choice(program_names),
                    description="Custom program tailored to member goals.",
                    exercises=[
                        {"name": "Bench Press", "sets": 4, "reps": 10, "weight": 60},
                        {"name": "Squats", "sets": 4, "reps": 12, "weight": 80},
                        {"name": "Deadlift", "sets": 3, "reps": 8, "weight": 100},
                    ],
                    created_at=datetime.combine(m.join_date, datetime.min.time())
                ))
            db.commit()
            print(f"Added {len(members)} workout programs")

        # ---- Check-ins (last 14 days, random) ----
        if db.query(CheckIn).count() == 0:
            checkins = 0
            for day_offset in range(14, -1, -1):
                day = today - timedelta(days=day_offset)
                for m in members:
                    if randint(0, 100) < 65:
                        entry = datetime.combine(day, datetime.min.time().replace(hour=randint(5, 10), minute=randint(0, 59)))
                        exit = entry + timedelta(hours=randint(1, 3))
                        db.add(CheckIn(
                            member_id=m.id,
                            branch_id=branch.id,
                            entry_time=entry,
                            exit_time=exit,
                            method=choice(["qr", "manual", "barcode", "rfid"]),
                            created_at=entry
                        ))
                        checkins += 1
            db.commit()
            print(f"Added {checkins} check-ins")

        # ---- Payments (last 90 days) ----
        if db.query(Payment).count() == 0:
            methods = ["cash", "credit_card", "bank_transfer", "apple_pay"]
            payments = 0
            for m in members:
                plan = choice(plans)
                for _ in range(randint(1, 4)):
                    days_ago = randint(0, 90)
                    pdate = today - timedelta(days=days_ago)
                    amount = plan.price * uniform(0.5, 1)
                    status = "completed" if randint(0, 100) < 85 else "pending"
                    db.add(Payment(
                        member_id=m.id,
                        amount=round(amount, 2),
                        method=choice(methods),
                        status=status,
                        transaction_id=str(uuid.uuid4())[:16],
                        invoice_id=f"INV-{randint(10000, 99999)}",
                        branch_id=branch.id,
                        created_at=datetime.combine(pdate, datetime.min.time().replace(hour=randint(9, 18)))
                    ))
                    payments += 1
            db.commit()
            print(f"Added {payments} payments")

        # ---- Group Classes & Bookings ----
        if db.query(GroupClass).count() == 0:
            classes = [
                ("Morning Yoga", "yoga", 25),
                ("Power CrossFit", "crossfit", 20),
                ("Zumba Dance", "zumba", 30),
                ("Cardio Blast", "cardio", 25),
                ("HIIT Express", "other", 20),
            ]
            for name, ctype, capacity in classes:
                gc = GroupClass(
                    name=name,
                    type=ctype,
                    trainer_id=choice(trainers).id,
                    branch_id=branch.id,
                    schedule=f"{choice(['Mon','Tue','Wed','Thu','Fri','Sat'])} {randint(7, 19)}:00",
                    capacity=capacity,
                    description=f"High-energy {name} session."
                )
                db.add(gc)
                db.flush()
                for m in members[:12]:
                    db.add(ClassBooking(
                        class_id=gc.id,
                        member_id=m.id,
                        date=today - timedelta(days=randint(0, 10)),
                        status=choice(["attended", "attended", "attended", "booked", "cancelled", "no_show"]),
                        booking_time=datetime.now() - timedelta(days=randint(0, 10))
                    ))
            db.commit()
            print("Added group classes & bookings")

        # ---- Products & Sales (for POS/revenue) ----
        if db.query(Product).count() == 0:
            products = [
                ("Whey Protein", "supplements", 30, 29.99, 49.99),
                ("Pre-Workout", "supplements", 40, 19.99, 34.99),
                ("BCAA", "supplements", 25, 14.99, 24.99),
                ("Energy Drink", "drinks", 80, 1.50, 3.00),
                ("Protein Shake", "drinks", 100, 2.00, 4.50),
                ("Gym T-Shirt", "merchandise", 50, 8.00, 19.99),
                ("Water Bottle", "merchandise", 60, 3.00, 9.99),
                ("Resistance Bands", "equipment", 35, 7.00, 15.99),
            ]
            for name, cat, qty, purchase, selling in products:
                db.add(Product(
                    name=name,
                    barcode=str(uuid.uuid4())[:12],
                    category=cat,
                    quantity=randint(10, qty + 20),
                    supplier=choice(["ProFit Supply Co", "GymSource Inc", "FitNutrition Ltd"]),
                    purchase_price=purchase,
                    selling_price=selling,
                    low_stock_threshold=10,
                    branch_id=branch.id
                ))
            db.commit()
            print("Added 8 products")

        products = db.query(Product).all()
        if db.query(Sale).count() == 0:
            for _ in range(60):
                p = choice(products)
                qty = randint(1, 5)
                sdate = today - timedelta(days=randint(0, 60))
                unit = p.selling_price
                total = round(unit * qty, 2)
                db.add(Sale(
                    items=[{"product_id": p.id, "quantity": qty, "unit_price": unit, "total": total}],
                    subtotal=total,
                    tax=round(total * 0.1, 2),
                    discount=0,
                    total=round(total * 1.1, 2),
                    payment_method=choice(["cash", "credit_card", "apple_pay"]),
                    status="completed",
                    branch_id=branch.id,
                    cashier_id=admin.id,
                    created_at=datetime.combine(sdate, datetime.min.time().replace(hour=randint(10, 20)))
                ))
            db.commit()
            print("Added 60 sales")

        # ---- Audit Logs (recent activities) ----
        if db.query(AuditLog).count() == 0:
            actions = ["created", "updated", "deleted", "checked_in", "processed_payment"]
            resources = ["member", "payment", "check-in", "membership", "sale", "product"]
            for _ in range(25):
                db.add(AuditLog(
                    user_id=admin.id,
                    action=choice(actions),
                    resource=choice(resources),
                    resource_id=str(randint(1, 100)),
                    details=f"{choice(actions).title()} a {choice(resources)} record",
                    ip_address=f"192.168.{randint(0,255)}.{randint(1,255)}",
                    user_agent="Mozilla/5.0",
                    created_at=datetime.now() - timedelta(hours=randint(0, 72))
                ))
            db.commit()
            print("Added 25 audit logs")

        print("\nDemo data added successfully!")
        print("The dashboard now has charts, records, and status data.")

    except Exception as e:
        print(f"Error adding demo data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    demo_status()
