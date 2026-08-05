from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Text, Enum, JSON, Date
from sqlalchemy.orm import relationship, foreign
from database import Base
from datetime import datetime
import enum

def enum_values(enum_class):
    return [e.value for e in enum_class]

class UserRole(enum.Enum):
    SUPER_ADMIN = "super_admin"
    OWNER = "owner"
    BRANCH_MANAGER = "branch_manager"
    RECEPTIONIST = "receptionist"
    CASHIER = "cashier"
    TRAINER = "trainer"
    ACCOUNTANT = "accountant"

class Gender(enum.Enum):
    MALE = "male"
    FEMALE = "female"

class MembershipStatus(enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    SUSPENDED = "suspended"
    PENDING = "pending"

class PaymentMethod(enum.Enum):
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    BANK_TRANSFER = "bank_transfer"
    APPLE_PAY = "apple_pay"

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class CheckInMethod(enum.Enum):
    QR = "qr"
    BARCODE = "barcode"
    RFID = "rfid"
    MANUAL = "manual"

class ClassType(enum.Enum):
    YOGA = "yoga"
    CROSSFIT = "crossfit"
    ZUMBA = "zumba"
    CARDIO = "cardio"
    OTHER = "other"

class BookingStatus(enum.Enum):
    BOOKED = "booked"
    ATTENDED = "attended"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class ProductCategory(enum.Enum):
    SUPPLEMENTS = "supplements"
    DRINKS = "drinks"
    MERCHANDISE = "merchandise"
    EQUIPMENT = "equipment"

class DocumentType(enum.Enum):
    ID = "id"
    MEDICAL_REPORT = "medical_report"
    CONTRACT = "contract"
    IMAGE = "image"
    OTHER = "other"

class NotificationType(enum.Enum):
    MEMBERSHIP_EXPIRY = "membership_expiry"
    BIRTHDAY = "birthday"
    PAYMENT_REMINDER = "payment_reminder"
    PROMOTION = "promotion"
    SYSTEM = "system"

class NotificationChannel(enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"

class NotificationStatus(enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole, values_callable=enum_values), default=UserRole.RECEPTIONIST, nullable=False)
    avatar = Column(String)
    phone = Column(String)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    branch = relationship("Branch", back_populates="users", foreign_keys=[branch_id])
    audit_logs = relationship("AuditLog", back_populates="user")

class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String)
    manager_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship("User", back_populates="branch", foreign_keys="User.branch_id")
    members = relationship("Member", back_populates="branch")
    membership_plans = relationship("MembershipPlan", back_populates="branch")
    checkins = relationship("CheckIn", back_populates="branch")
    trainers = relationship("Trainer", back_populates="branch")
    group_classes = relationship("GroupClass", back_populates="branch")
    payments = relationship("Payment", back_populates="branch")
    products = relationship("Product", back_populates="branch")
    sales = relationship("Sale", back_populates="branch")

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    photo = Column(String)
    phone = Column(String, nullable=False)
    email = Column(String)
    gender = Column(Enum(Gender, values_callable=enum_values), nullable=False)
    birth_date = Column(Date, nullable=False)
    address = Column(String)
    emergency_contact = Column(String)
    medical_notes = Column(Text)
    height = Column(Float)
    weight = Column(Float)
    join_date = Column(Date, default=datetime.utcnow)
    membership_status = Column(Enum(MembershipStatus, values_callable=enum_values), default=MembershipStatus.ACTIVE)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    branch = relationship("Branch", back_populates="members")
    memberships = relationship("Membership", back_populates="member")
    checkins = relationship("CheckIn", back_populates="member")
    workout_programs = relationship("WorkoutProgram", back_populates="member")
    nutrition_plans = relationship("NutritionPlan", back_populates="member")
    body_measurements = relationship("BodyMeasurement", back_populates="member")
    class_bookings = relationship("ClassBooking", back_populates="member")
    payments = relationship("Payment", back_populates="member")
    documents = relationship("Document", back_populates="member")

class MembershipPlan(Base):
    __tablename__ = "membership_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    duration_days = Column(Integer, nullable=False)
    freeze_days = Column(Integer, default=0)
    max_visits = Column(Integer)
    description = Column(Text)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    branch = relationship("Branch", back_populates="membership_plans")
    memberships = relationship("Membership", back_populates="plan")

class Membership(Base):
    __tablename__ = "memberships"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("membership_plans.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(Enum(MembershipStatus, values_callable=enum_values), default=MembershipStatus.ACTIVE)
    remaining_visits = Column(Integer)
    freeze_days_used = Column(Integer, default=0)
    auto_renew = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    member = relationship("Member", back_populates="memberships")
    plan = relationship("MembershipPlan", back_populates="memberships")
    payments = relationship("Payment", back_populates="membership")

class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    entry_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    exit_time = Column(DateTime)
    method = Column(Enum(CheckInMethod, values_callable=enum_values), default=CheckInMethod.MANUAL)
    created_at = Column(DateTime, default=datetime.utcnow)

    member = relationship("Member", back_populates="checkins")
    branch = relationship("Branch", back_populates="checkins")

class Trainer(Base):
    __tablename__ = "trainers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    photo = Column(String)
    phone = Column(String, nullable=False)
    email = Column(String)
    salary = Column(Float, nullable=False)
    specialization = Column(String, nullable=False)
    schedule = Column(JSON)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    branch = relationship("Branch", back_populates="trainers")
    workout_programs = relationship("WorkoutProgram", back_populates="trainer")
    nutrition_plans = relationship("NutritionPlan", back_populates="trainer")
    group_classes = relationship("GroupClass", back_populates="trainer")

class WorkoutProgram(Base):
    __tablename__ = "workout_programs"

    id = Column(Integer, primary_key=True, index=True)
    trainer_id = Column(Integer, ForeignKey("trainers.id"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    exercises = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    trainer = relationship("Trainer", back_populates="workout_programs")
    member = relationship("Member", back_populates="workout_programs")

class NutritionPlan(Base):
    __tablename__ = "nutrition_plans"

    id = Column(Integer, primary_key=True, index=True)
    trainer_id = Column(Integer, ForeignKey("trainers.id"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    name = Column(String, nullable=False)
    calories = Column(Integer, nullable=False)
    protein = Column(Float, nullable=False)
    carbs = Column(Float, nullable=False)
    fat = Column(Float, nullable=False)
    meals = Column(JSON)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    trainer = relationship("Trainer", back_populates="nutrition_plans")
    member = relationship("Member", back_populates="nutrition_plans")

class BodyMeasurement(Base):
    __tablename__ = "body_measurements"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    date = Column(Date, default=datetime.utcnow, nullable=False)
    weight = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    bmi = Column(Float)
    body_fat = Column(Float)
    muscle_mass = Column(Float)
    waist = Column(Float)
    chest = Column(Float)
    arms = Column(Float)
    legs = Column(Float)
    before_photo = Column(String)
    after_photo = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    member = relationship("Member", back_populates="body_measurements")

class GroupClass(Base):
    __tablename__ = "group_classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(Enum(ClassType, values_callable=enum_values), nullable=False)
    trainer_id = Column(Integer, ForeignKey("trainers.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    schedule = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    trainer = relationship("Trainer", back_populates="group_classes")
    branch = relationship("Branch", back_populates="group_classes")
    bookings = relationship("ClassBooking", back_populates="group_class")

class ClassBooking(Base):
    __tablename__ = "class_bookings"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("group_classes.id"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(BookingStatus, values_callable=enum_values), default=BookingStatus.BOOKED)
    booking_time = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    group_class = relationship("GroupClass", back_populates="bookings")
    member = relationship("Member", back_populates="class_bookings")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    membership_id = Column(Integer, ForeignKey("memberships.id"))
    amount = Column(Float, nullable=False)
    method = Column(Enum(PaymentMethod, values_callable=enum_values), nullable=False)
    status = Column(Enum(PaymentStatus, values_callable=enum_values), default=PaymentStatus.PENDING)
    transaction_id = Column(String)
    invoice_id = Column(String)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    member = relationship("Member", back_populates="payments")
    membership = relationship("Membership", back_populates="payments")
    branch = relationship("Branch", back_populates="payments")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False)
    items = Column(JSON)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0)
    discount = Column(Float, default=0)
    total = Column(Float, nullable=False)
    status = Column(String, default="draft")
    due_date = Column(Date)
    paid_date = Column(Date)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    barcode = Column(String, unique=True)
    category = Column(Enum(ProductCategory, values_callable=enum_values), nullable=False)
    quantity = Column(Integer, nullable=False)
    supplier = Column(String)
    purchase_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    low_stock_threshold = Column(Integer, default=10)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    branch = relationship("Branch", back_populates="products")

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    items = Column(JSON)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0)
    discount = Column(Float, default=0)
    total = Column(Float, nullable=False)
    payment_method = Column(Enum(PaymentMethod, values_callable=enum_values), nullable=False)
    status = Column(String, default="completed")
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    cashier_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    branch = relationship("Branch", back_populates="sales")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    type = Column(Enum(DocumentType, values_callable=enum_values), nullable=False)
    file_url = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_size = Column(Integer)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    member = relationship("Member", back_populates="documents")

class GymSettings(Base):
    __tablename__ = "gym_settings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    logo = Column(String)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String)
    currency = Column(String, default="USD")
    tax_rate = Column(Float, default=0)
    business_hours = Column(JSON)
    languages = Column(JSON, default=["en"])
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    resource_id = Column(String)
    details = Column(Text)
    ip_address = Column(String)
    user_agent = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(NotificationType, values_callable=enum_values), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    recipient_id = Column(Integer)
    recipient_type = Column(String)
    channel = Column(Enum(NotificationChannel, values_callable=enum_values), nullable=False)
    status = Column(Enum(NotificationStatus, values_callable=enum_values), default=NotificationStatus.PENDING)
    scheduled_at = Column(DateTime)
    sent_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
