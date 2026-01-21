import { pgTable, text, serial, integer, boolean, timestamp, date, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const remarksEnum = pgEnum("remarks", ["qualified", "disqualified"]);
export const biEnum = pgEnum("for_background_investigation", ["yes", "no"]);
export const appStatusEnum = pgEnum("app_status", ["submitted", "qualified", "disqualified", "under_assessment", "finalized"]);

// Users table for Authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("user").notNull(),
});

// Applicant Profile
export const applicants = pgTable("applicants", {
  appId: serial("app_id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(), // Link to auth user
  name: text("name").notNull(),
  address: text("address").notNull(),
  age: integer("age").notNull(),
  sex: text("sex").notNull(),
  civilStatus: text("civil_status").notNull(),
  religion: text("religion").notNull(),
  disability: text("disability"),
  ethnicGroup: text("ethnic_group"),
  email: text("email").notNull(),
  contact: text("contact").notNull(),
  education: text("education").notNull(),
  training: integer("training").default(0), // Number of hours/trainings
  experience: integer("experience").default(0), // Number of months/years
  eligibility: text("eligibility").notNull(),
  // Documents (storing paths/urls)
  pdsUrl: text("pds_url"),
  letterUrl: text("letter_url"),
});

// Secretariat Profile
export const secretariat = pgTable("secretariat", {
  secId: serial("sec_id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  age: integer("age").notNull(),
  sex: text("sex").notNull(),
});

// ASDS Profile
export const asds = pgTable("asds", {
  asdsId: serial("asds_id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  age: integer("age").notNull(),
  sex: text("sex").notNull(),
});

// Positions
export const positions = pgTable("positions", {
  positionId: serial("position_id").primaryKey(),
  position: text("position").notNull(), // e.g., "Teacher I"
  salaryGrade: integer("salary_grade").notNull(),
  monthlySalary: decimal("monthly_salary").notNull(),
});

// Schools Division Office
export const schoolsDivisionOffice = pgTable("schools_division_office", {
  schoolId: serial("school_id").primaryKey(),
  name: text("name").notNull(), // Added name for clarity
  address: text("address").notNull(),
});

// Application Code (The main application record)
export const applicationCodes = pgTable("application_codes", {
  appCodeId: serial("app_code_id").primaryKey(),
  appId: integer("app_id").references(() => applicants.appId).notNull(),
  positionId: integer("position_id").references(() => positions.positionId).notNull(),
  status: appStatusEnum("status").default("submitted").notNull(),
  applicantCode: text("applicant_code").notNull().unique(), // Generated unique code
  createdAt: timestamp("created_at").defaultNow(),
});

// IER (Initial Evaluation Result)
export const ier = pgTable("ier", {
  ierId: serial("ier_id").primaryKey(),
  appCodeId: integer("app_code_id").references(() => applicationCodes.appCodeId).notNull(),
  positionId: integer("position_id").references(() => positions.positionId).notNull(),
  eligibility: text("eligibility").notNull(), // Confirmed eligibility
  remarks: remarksEnum("remarks").notNull(), // qualified/disqualified
  feedback: text("feedback"), // Optional feedback message
  
  // New Qualification fields
  standardEducation: integer("standard_education").default(0),
  standardTraining: integer("standard_training").default(0),
  standardExperience: integer("standard_experience").default(0),
  applicantEducation: integer("applicant_education").default(0),
  applicantTraining: integer("applicant_training").default(0),
  applicantExperience: integer("applicant_experience").default(0),
  incrementEducation: integer("increment_education").default(0),
  incrementTraining: integer("increment_training").default(0),
  incrementExperience: integer("increment_experience").default(0),
});

// IES (Initial Evaluation Sheet)
export const ies = pgTable("ies", {
  iesId: serial("ies_id").primaryKey(),
  ierId: integer("ier_id").references(() => ier.ierId).notNull(),
  schoolId: integer("school_id").references(() => schoolsDivisionOffice.schoolId).notNull(),
  education: decimal("education").notNull(), // Max 10
  training: decimal("training").notNull(), // Max 10
  experience: decimal("experience").notNull(), // Max 10
  performance: decimal("performance").notNull(), // Max 30
  classObs: decimal("class_obs").notNull(), // Max 25
  portfolioBei: decimal("portfolio_bei").notNull(), // Max 15
  actualScore: decimal("actual_score").notNull(), // Computed
});

// CAR (Comparative Assessment Result)
export const car = pgTable("car", {
  carId: serial("car_id").primaryKey(),
  iesId: integer("ies_id").references(() => ies.iesId).notNull(),
  remarks: text("remarks"), // Nullable
  backgroundInvestigation: text("background_investigation"), // Nullable
  forAppointment: text("for_appointment"), // Nullable
  statusOfAppointment: text("status_of_appointment"), // Nullable
  forBi: biEnum("for_background_investigation").notNull(),
  dateOfFinalDeliberation: timestamp("date_of_final_deliberation"),
  finalizedBy: integer("finalized_by").references(() => asds.asdsId), // Who finalized it
});

// Relations
export const userRelations = relations(users, ({ one }) => ({
  applicant: one(applicants, { fields: [users.id], references: [applicants.userId] }),
  secretariat: one(secretariat, { fields: [users.id], references: [secretariat.userId] }),
  asds: one(asds, { fields: [users.id], references: [asds.userId] }),
}));

export const applicantRelations = relations(applicants, ({ many }) => ({
  applications: many(applicationCodes),
}));

export const applicationRelations = relations(applicationCodes, ({ one, many }) => ({
  applicant: one(applicants, { fields: [applicationCodes.appId], references: [applicants.appId] }),
  position: one(positions, { fields: [applicationCodes.positionId], references: [positions.positionId] }),
  ier: one(ier, { fields: [applicationCodes.appCodeId], references: [ier.appCodeId] }),
}));

export const ierRelations = relations(ier, ({ one }) => ({
  application: one(applicationCodes, { fields: [ier.appCodeId], references: [applicationCodes.appCodeId] }),
  ies: one(ies, { fields: [ier.ierId], references: [ies.ierId] }),
}));

export const iesRelations = relations(ies, ({ one }) => ({
  ier: one(ier, { fields: [ies.ierId], references: [ier.ierId] }),
  car: one(car, { fields: [ies.iesId], references: [car.iesId] }),
}));

export const carRelations = relations(car, ({ one }) => ({
  ies: one(ies, { fields: [car.iesId], references: [ies.iesId] }),
}));

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertApplicantSchema = createInsertSchema(applicants).omit({ appId: true, userId: true });
export const insertSecretariatSchema = createInsertSchema(secretariat).omit({ secId: true, userId: true });
export const insertAsdsSchema = createInsertSchema(asds).omit({ asdsId: true, userId: true });
export const insertPositionSchema = createInsertSchema(positions).omit({ positionId: true });
export const insertSchoolSchema = createInsertSchema(schoolsDivisionOffice).omit({ schoolId: true });
export const insertApplicationCodeSchema = createInsertSchema(applicationCodes).omit({ appCodeId: true, applicantCode: true, createdAt: true, status: true });
export const insertIerSchema = createInsertSchema(ier).omit({ ierId: true });
export const insertIesSchema = createInsertSchema(ies).omit({ iesId: true, actualScore: true }); // Actual score computed server-side
export const insertCarSchema = createInsertSchema(car).omit({ carId: true });

// Types
export type User = typeof users.$inferSelect;
export type Applicant = typeof applicants.$inferSelect;
export type Secretariat = typeof secretariat.$inferSelect;
export type ASDS = typeof asds.$inferSelect;
export type Position = typeof positions.$inferSelect;
export type ApplicationCode = typeof applicationCodes.$inferSelect;
export type IER = typeof ier.$inferSelect;
export type IES = typeof ies.$inferSelect;
export type CAR = typeof car.$inferSelect;
