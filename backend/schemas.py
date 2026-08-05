from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any, TypeVar, Generic
from datetime import datetime, date
from enum import Enum

T = TypeVar('T')

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    OWNER = "owner"
    BRANCH_MANAGER = "branch_manager"
    RECEPTIONIST = "receptionist"
    CASHIER = "cashier"
    TRAINER = "trainer"
    ACCOUNTANT = "accountant"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"

class MembershipStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    SUSPENDED = "suspended"
    PENDING = "pending"

class PaymentMethod(str, Enum):
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    BANK_TRANSFER = "bank_transfer"
    APPLE_PAY = "apple_pay"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class CheckInMethod(str, Enum):
    QR = "qr"
    BARCODE = "barcode"
    RFID = "rfid"
    MANUAL = "manual"

class ClassType(str, Enum):
    YOGA = "yoga"
    CROSSFIT = "crossfit"
    ZUMBA = "zumba"
    CARDIO = "cardio"
    OTHER = "other"

class BookingStatus(str, Enum):
    BOOKED = "booked"
    ATTENDED = "attended"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class ProductCategory(str, Enum):
    SUPPLEMENTS = "supplements"
    DRINKS = "drinks"
    MERCHANDISE = "merchandise"
    EQUIPMENT = "equipment"

class DocumentType(str, Enum):
    ID = "id"
    MEDICAL_REPORT = "medical_report"
    CONTRACT = "contract"
    IMAGE = "image"
    OTHER = "other"

class NotificationType(str, Enum):
    MEMBERSHIP_EXPIRY = "membership_expiry"
    BIRTHDAY = "birthday"
    PAYMENT_REMINDER = "payment_reminder"
    PROMOTION = "promotion"
    SYSTEM = "system"

class NotificationChannel(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"

class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    branch_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    phone: Optional[str] = None
    branch_id: Optional[int] = None
    avatar: Optional[str] = None

class UserResponse(UserBase):
    id: int
    avatar: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

# Member Schemas
class MemberBase(BaseModel):
    full_name: str
    phone: str
    email: Optional[EmailStr] = None
    gender: Gender
    birth_date: date
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_notes: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    branch_id: int

class MemberCreate(MemberBase):
    pass

class MemberUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    gender: Optional[Gender] = None
    birth_date: Optional[date] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_notes: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    photo: Optional[str] = None
    membership_status: Optional[MembershipStatus] = None

class MemberResponse(MemberBase):
    id: int
    photo: Optional[str] = None
    join_date: date
    membership_status: MembershipStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Membership Plan Schemas
class MembershipPlanBase(BaseModel):
    name: str
    price: float
    duration_days: int
    freeze_days: int = 0
    max_visits: Optional[int] = None
    description: Optional[str] = None
    branch_id: int

class MembershipPlanCreate(MembershipPlanBase):
    pass

class MembershipPlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    duration_days: Optional[int] = None
    freeze_days: Optional[int] = None
    max_visits: Optional[int] = None
    description: Optional[str] = None

class MembershipPlanResponse(MembershipPlanBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Membership Schemas
class MembershipBase(BaseModel):
    member_id: int
    plan_id: int
    start_date: date
    end_date: date
    auto_renew: bool = False

class MembershipCreate(MembershipBase):
    pass

class MembershipUpdate(BaseModel):
    status: Optional[MembershipStatus] = None
    auto_renew: Optional[bool] = None

class MembershipResponse(MembershipBase):
    id: int
    status: MembershipStatus
    remaining_visits: Optional[int] = None
    freeze_days_used: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# CheckIn Schemas
class CheckInBase(BaseModel):
    member_id: int
    branch_id: int
    method: CheckInMethod = CheckInMethod.MANUAL

class CheckInCreate(CheckInBase):
    pass

class CheckInResponse(CheckInBase):
    id: int
    entry_time: datetime
    exit_time: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Trainer Schemas
class TrainerBase(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    salary: float
    specialization: str
    schedule: Optional[Dict[str, Any]] = None
    branch_id: int

class TrainerCreate(TrainerBase):
    pass

class TrainerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    salary: Optional[float] = None
    specialization: Optional[str] = None
    schedule: Optional[Dict[str, Any]] = None
    photo: Optional[str] = None

class TrainerResponse(TrainerBase):
    id: int
    photo: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Workout Program Schemas
class Exercise(BaseModel):
    name: str
    sets: int
    reps: int
    weight: Optional[float] = None
    rest_time: Optional[int] = None
    notes: Optional[str] = None

class WorkoutProgramBase(BaseModel):
    trainer_id: int
    member_id: int
    name: str
    description: Optional[str] = None
    exercises: List[Exercise]

class WorkoutProgramCreate(WorkoutProgramBase):
    pass

class WorkoutProgramUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    exercises: Optional[List[Exercise]] = None

class WorkoutProgramResponse(WorkoutProgramBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Nutrition Plan Schemas
class Meal(BaseModel):
    name: str
    time: str
    foods: List[str]
    calories: int

class NutritionPlanBase(BaseModel):
    trainer_id: int
    member_id: int
    name: str
    calories: int
    protein: float
    carbs: float
    fat: float
    meals: List[Meal]
    notes: Optional[str] = None

class NutritionPlanCreate(NutritionPlanBase):
    pass

class NutritionPlanUpdate(BaseModel):
    name: Optional[str] = None
    calories: Optional[int] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    meals: Optional[List[Meal]] = None
    notes: Optional[str] = None

class NutritionPlanResponse(NutritionPlanBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Body Measurement Schemas
class BodyMeasurementBase(BaseModel):
    member_id: int
    date: date
    weight: float
    height: float
    body_fat: Optional[float] = None
    muscle_mass: Optional[float] = None
    waist: Optional[float] = None
    chest: Optional[float] = None
    arms: Optional[float] = None
    legs: Optional[float] = None
    before_photo: Optional[str] = None
    after_photo: Optional[str] = None
    notes: Optional[str] = None

class BodyMeasurementCreate(BodyMeasurementBase):
    pass

class BodyMeasurementUpdate(BaseModel):
    weight: Optional[float] = None
    height: Optional[float] = None
    body_fat: Optional[float] = None
    muscle_mass: Optional[float] = None
    waist: Optional[float] = None
    chest: Optional[float] = None
    arms: Optional[float] = None
    legs: Optional[float] = None
    before_photo: Optional[str] = None
    after_photo: Optional[str] = None
    notes: Optional[str] = None

class BodyMeasurementResponse(BodyMeasurementBase):
    id: int
    bmi: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Group Class Schemas
class GroupClassBase(BaseModel):
    name: str
    type: ClassType
    trainer_id: int
    branch_id: int
    schedule: str
    capacity: int
    description: Optional[str] = None

class GroupClassCreate(GroupClassBase):
    pass

class GroupClassUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[ClassType] = None
    trainer_id: Optional[int] = None
    schedule: Optional[str] = None
    capacity: Optional[int] = None
    description: Optional[str] = None

class GroupClassResponse(GroupClassBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Class Booking Schemas
class ClassBookingBase(BaseModel):
    class_id: int
    member_id: int
    date: date

class ClassBookingCreate(ClassBookingBase):
    pass

class ClassBookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None

class ClassBookingResponse(ClassBookingBase):
    id: int
    status: BookingStatus
    booking_time: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Payment Schemas
class PaymentBase(BaseModel):
    member_id: int
    membership_id: Optional[int] = None
    amount: float
    method: PaymentMethod
    branch_id: int

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    transaction_id: Optional[str] = None

class PaymentResponse(PaymentBase):
    id: int
    status: PaymentStatus
    transaction_id: Optional[str] = None
    invoice_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    barcode: Optional[str] = None
    category: ProductCategory
    quantity: int
    supplier: Optional[str] = None
    purchase_price: float
    selling_price: float
    low_stock_threshold: int = 10
    branch_id: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    barcode: Optional[str] = None
    category: Optional[ProductCategory] = None
    quantity: Optional[int] = None
    supplier: Optional[str] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    low_stock_threshold: Optional[int] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Sale Schemas
class SaleItem(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    total: float

class SaleBase(BaseModel):
    items: List[SaleItem]
    subtotal: float
    tax: float = 0
    discount: float = 0
    total: float
    payment_method: PaymentMethod
    branch_id: int
    cashier_id: int

class SaleCreate(SaleBase):
    pass

class SaleResponse(SaleBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Document Schemas
class DocumentBase(BaseModel):
    member_id: int
    type: DocumentType
    file_url: str
    file_name: str
    file_size: int

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True

# Gym Settings Schemas
class DayHours(BaseModel):
    open: str
    close: str
    is_closed: bool = False

class BusinessHours(BaseModel):
    monday: DayHours
    tuesday: DayHours
    wednesday: DayHours
    thursday: DayHours
    friday: DayHours
    saturday: DayHours
    sunday: DayHours

class GymSettingsBase(BaseModel):
    name: str
    logo: Optional[str] = None
    address: str
    phone: str
    email: Optional[EmailStr] = None
    currency: str = "USD"
    tax_rate: float = 0
    business_hours: BusinessHours
    languages: List[str] = ["en"]

class GymSettingsUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    currency: Optional[str] = None
    tax_rate: Optional[float] = None
    business_hours: Optional[BusinessHours] = None
    languages: Optional[List[str]] = None

class GymSettingsResponse(GymSettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    resource: str
    resource_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationBase(BaseModel):
    type: NotificationType
    title: str
    message: str
    recipient_id: Optional[int] = None
    recipient_type: Optional[str] = None
    channel: NotificationChannel
    scheduled_at: Optional[datetime] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    status: Optional[NotificationStatus] = None

class NotificationResponse(NotificationBase):
    id: int
    status: NotificationStatus
    sent_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Schemas
class MembershipStatistics(BaseModel):
    active: int
    expired: int
    frozen: int
    pending: int

class ChartData(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]

class TrainerStatistics(BaseModel):
    trainer_id: int
    trainer_name: str
    total_members: int
    active_programs: int
    revenue_generated: float

class Activity(BaseModel):
    id: int
    user: str
    action: str
    description: str
    timestamp: datetime

class DashboardStats(BaseModel):
    total_members: int
    active_members: int
    expired_memberships: int
    today_checkins: int
    revenue_today: float
    revenue_this_month: float
    revenue_this_year: float
    membership_statistics: MembershipStatistics
    attendance_chart: ChartData
    sales_chart: ChartData
    trainer_statistics: List[TrainerStatistics]
    recent_activities: List[Activity]
    notifications: List[NotificationResponse]

# Pagination
class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
