import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  uniqueIndex,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", [
  "student",
  "lecturer",
  "department_admin",
  "faculty_admin",
  "registrar",
  "finance",
  "accommodation",
  "library",
  "graduation_staff",
  "admin",
]);

export const clearanceTypeEnum = pgEnum("clearance_type", [
  "academic",
  "financial",
  "library",
  "department",
  "accommodation",
]);

export const clearanceStatusEnum = pgEnum("clearance_status", [
  "pending",
  "cleared",
  "blocked",
]);

export const graduationAppStatusEnum = pgEnum("graduation_app_status", [
  "pending",
  "approved",
  "rejected",
]);

export const passStatusEnum = pgEnum("pass_status", [
  "not_used",
  "used",
  "revoked",
]);

export const scanResultEnum = pgEnum("scan_result", [
  "valid",
  "already_used",
  "invalid",
  "revoked",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "unpaid",
  "partial",
  "paid",
]);

export const allocationStatusEnum = pgEnum("allocation_status", [
  "active",
  "checked_out",
  "cancelled",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
]);

// ---------- Identity ----------

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    role: roleEnum("role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Every sign-in and activation-verify attempt, used to rate-limit brute-forcing.
export const loginAttempts = pgTable("login_attempts", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pre-provisioned rosters the registrar/HR loads ahead of time. A student or
// lecturer proves they match a row here (registration/staff number + national
// ID + university email) to activate their account and set their own password.
export const studentRegistry = pgTable("student_registry", {
  id: text("id").primaryKey(),
  registrationNumber: text("registration_number").notNull().unique(),
  nationalId: text("national_id").notNull(),
  universityEmail: text("university_email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  programId: text("program_id")
    .notNull()
    .references(() => programs.id),
  yearOfStudy: integer("year_of_study").notNull().default(1),
  activatedUserId: text("activated_user_id")
    .references(() => users.id)
    .unique(),
});

export const lecturerRegistry = pgTable("lecturer_registry", {
  id: text("id").primaryKey(),
  staffNumber: text("staff_number").notNull().unique(),
  nationalId: text("national_id").notNull(),
  universityEmail: text("university_email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  departmentId: text("department_id")
    .notNull()
    .references(() => departments.id),
  title: text("title"),
  activatedUserId: text("activated_user_id")
    .references(() => users.id)
    .unique(),
});

// ---------- Academic structure ----------

export const faculties = pgTable("faculties", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
});

export const departments = pgTable("departments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  facultyId: text("faculty_id")
    .notNull()
    .references(() => faculties.id),
});

export const programs = pgTable("programs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  degreeLevel: text("degree_level").notNull(),
  departmentId: text("department_id")
    .notNull()
    .references(() => departments.id),
  totalCreditsRequired: integer("total_credits_required").notNull().default(120),
});

export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  credits: integer("credits").notNull().default(3),
  departmentId: text("department_id")
    .notNull()
    .references(() => departments.id),
});

export const requirementCategoryEnum = pgEnum("requirement_category", ["core", "elective"]);

// The curriculum for a program: which courses a student must (or may) take.
// Distinct from `courses.departmentId`, which just says who teaches a course.
export const programRequirements = pgTable(
  "program_requirements",
  {
    id: text("id").primaryKey(),
    programId: text("program_id")
      .notNull()
      .references(() => programs.id),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id),
    category: requirementCategoryEnum("category").notNull().default("core"),
  },
  (t) => [uniqueIndex("program_requirement_program_course_idx").on(t.programId, t.courseId)]
);

export const students = pgTable("students", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  studentNumber: text("student_number").notNull().unique(),
  programId: text("program_id")
    .notNull()
    .references(() => programs.id),
  yearOfStudy: integer("year_of_study").notNull().default(1),
  status: text("status").notNull().default("active"),
});

export const lecturers = pgTable("lecturers", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  staffNumber: text("staff_number").notNull().unique(),
  departmentId: text("department_id")
    .notNull()
    .references(() => departments.id),
  title: text("title"),
});

export const lecturerCourses = pgTable(
  "lecturer_courses",
  {
    id: text("id").primaryKey(),
    lecturerId: text("lecturer_id")
      .notNull()
      .references(() => lecturers.userId),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id),
    semester: text("semester").notNull(),
  },
  (t) => [uniqueIndex("lecturer_course_semester_idx").on(t.lecturerId, t.courseId, t.semester)]
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.userId),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id),
    semester: text("semester").notNull(),
    grade: text("grade"),
  },
  (t) => [uniqueIndex("enrollment_student_course_semester_idx").on(t.studentId, t.courseId, t.semester)]
);

// Weekly recurring timetable slots for a course offering. Department-managed.
export const classSessions = pgTable("class_sessions", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id),
  semester: text("semester").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday .. 6 = Saturday
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "10:30"
  venue: text("venue"),
});

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: text("id").primaryKey(),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => enrollments.id),
    date: text("date").notNull(), // "2026-08-28"
    status: attendanceStatusEnum("status").notNull().default("present"),
    markedAt: timestamp("marked_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("attendance_enrollment_date_idx").on(t.enrollmentId, t.date)]
);

export const tutorAssignments = pgTable("tutor_assignments", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.userId)
    .unique(),
  lecturerId: text("lecturer_id")
    .notNull()
    .references(() => lecturers.userId),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

// ---------- Clearance & Graduation ----------

export const clearances = pgTable(
  "clearances",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.userId),
    type: clearanceTypeEnum("type").notNull(),
    status: clearanceStatusEnum("status").notNull().default("pending"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("clearance_student_type_idx").on(t.studentId, t.type)]
);

export const graduationCeremonies = pgTable("graduation_ceremonies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  ceremonyDate: timestamp("ceremony_date").notNull(),
  venue: text("venue").notNull(),
});

export const graduationApplications = pgTable(
  "graduation_applications",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.userId),
    ceremonyId: text("ceremony_id")
      .notNull()
      .references(() => graduationCeremonies.id),
    status: graduationAppStatusEnum("status").notNull().default("pending"),
    appliedAt: timestamp("applied_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("graduation_app_student_ceremony_idx").on(t.studentId, t.ceremonyId)]
);

export const graduationVisitors = pgTable("graduation_visitors", {
  id: text("id").primaryKey(),
  graduationApplicationId: text("graduation_application_id")
    .notNull()
    .references(() => graduationApplications.id),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  idNumber: text("id_number"),
  relationship: text("relationship").notNull(),
  seatSection: text("seat_section"),
  seatRow: text("seat_row"),
  seatNumber: text("seat_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const graduationPasses = pgTable("graduation_passes", {
  id: text("id").primaryKey(),
  visitorId: text("visitor_id")
    .notNull()
    .references(() => graduationVisitors.id)
    .unique(),
  token: text("token").notNull().unique(),
  status: passStatusEnum("status").notNull().default("not_used"),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
  scannedByUserId: text("scanned_by_user_id").references(() => users.id),
});

export const scanEvents = pgTable("scan_events", {
  id: text("id").primaryKey(),
  passId: text("pass_id").references(() => graduationPasses.id),
  scannedByUserId: text("scanned_by_user_id").references(() => users.id),
  result: scanResultEnum("result").notNull(),
  stationName: text("station_name"),
  scannedAt: timestamp("scanned_at").defaultNow().notNull(),
});

// ---------- Finance ----------

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.userId),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: invoiceStatusEnum("status").notNull().default("unpaid"),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(),
  paidAt: timestamp("paid_at").defaultNow().notNull(),
});

// ---------- Accommodation ----------

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  hall: text("hall").notNull(),
  roomNumber: text("room_number").notNull(),
  capacity: integer("capacity").notNull().default(1),
});

export const roomAllocations = pgTable("room_allocations", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.userId),
  roomId: text("room_id")
    .notNull()
    .references(() => rooms.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: allocationStatusEnum("status").notNull().default("active"),
});

// ---------- Library ----------

export const books = pgTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn").notNull().unique(),
  totalCopies: integer("total_copies").notNull().default(1),
  availableCopies: integer("available_copies").notNull().default(1),
});

export const bookLoans = pgTable("book_loans", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.userId),
  bookId: text("book_id")
    .notNull()
    .references(() => books.id),
  borrowedAt: timestamp("borrowed_at").defaultNow().notNull(),
  dueAt: timestamp("due_at").notNull(),
  returnedAt: timestamp("returned_at"),
  fineAmount: numeric("fine_amount", { precision: 10, scale: 2 }).default("0"),
});

// ---------- Announcements ----------

export const announcements = pgTable("announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  audience: roleEnum("audience"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Relations ----------

export const facultiesRelations = relations(faculties, ({ many }) => ({
  departments: many(departments),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  faculty: one(faculties, { fields: [departments.facultyId], references: [faculties.id] }),
  programs: many(programs),
  courses: many(courses),
  lecturers: many(lecturers),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  department: one(departments, { fields: [programs.departmentId], references: [departments.id] }),
  students: many(students),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  program: one(programs, { fields: [students.programId], references: [programs.id] }),
  enrollments: many(enrollments),
  clearances: many(clearances),
}));

export const lecturersRelations = relations(lecturers, ({ one, many }) => ({
  user: one(users, { fields: [lecturers.userId], references: [users.id] }),
  department: one(departments, { fields: [lecturers.departmentId], references: [departments.id] }),
  courses: many(lecturerCourses),
}));

export const graduationApplicationsRelations = relations(graduationApplications, ({ one, many }) => ({
  student: one(students, { fields: [graduationApplications.studentId], references: [students.userId] }),
  ceremony: one(graduationCeremonies, { fields: [graduationApplications.ceremonyId], references: [graduationCeremonies.id] }),
  visitors: many(graduationVisitors),
}));

export const graduationVisitorsRelations = relations(graduationVisitors, ({ one }) => ({
  application: one(graduationApplications, {
    fields: [graduationVisitors.graduationApplicationId],
    references: [graduationApplications.id],
  }),
  pass: one(graduationPasses, { fields: [graduationVisitors.id], references: [graduationPasses.visitorId] }),
}));

export const graduationPassesRelations = relations(graduationPasses, ({ one, many }) => ({
  visitor: one(graduationVisitors, { fields: [graduationPasses.visitorId], references: [graduationVisitors.id] }),
  scanEvents: many(scanEvents),
}));
