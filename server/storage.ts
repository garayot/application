import { db } from "./db";
import {
  users,
  applicants,
  secretariat,
  asds,
  positions,
  schoolsDivisionOffice,
  majors,
  applicationCodes,
  ier,
  ies,
  car,
  type User,
  type InsertUser,
  type Applicant,
  type Secretariat,
  type ASDS,
  type ApplicationCode,
  type IER,
  type IES,
  type CAR,
  type Position,
  type Major,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;

  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Applicant
  getApplicantByUserId(userId: number): Promise<Applicant | undefined>;
  getApplicantById(appId: number): Promise<Applicant | undefined>;
  createApplicantProfile(data: any): Promise<Applicant>;
  updateApplicantProfile(appId: number, data: any): Promise<Applicant>;
  getAllApplicants(): Promise<Applicant[]>;

  // Positions & Schools
  getPositions(): Promise<Position[]>;
  getPositionById(positionId: number): Promise<Position | undefined>;
  createPosition(data: any): Promise<Position>;
  updatePosition(positionId: number, data: any): Promise<Position>;
  deletePosition(positionId: number): Promise<void>;
  getSchools(): Promise<any[]>;
  getMajors(): Promise<Major[]>;

  // Applications
  createApplication(data: any): Promise<ApplicationCode>;
  getApplicationsByApplicant(appId: number): Promise<any[]>; // with details
  getAllApplications(): Promise<any[]>; // for HR
  getApplicationById(appCodeId: number): Promise<any>;

  // Evaluation
  createIER(data: any): Promise<IER>;
  getIERByAppCodeId(appCodeId: number): Promise<IER | undefined>;

  createIES(data: any): Promise<IES>;
  getIESByIERId(ierId: number): Promise<IES | undefined>;

  createCAR(data: any): Promise<CAR>;
  getCARByIESId(iesId: number): Promise<CAR | undefined>;

  // Seed helpers
  seedPositions(): Promise<void>;
  seedSchools(): Promise<void>;
  seedAdmin(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Auth
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Applicant
  async getApplicantByUserId(userId: number): Promise<Applicant | undefined> {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.userId, userId));
    return applicant;
  }

  async getApplicantById(appId: number): Promise<Applicant | undefined> {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.appId, appId));
    return applicant;
  }

  async createApplicantProfile(data: any): Promise<Applicant> {
    const [applicant] = await db.insert(applicants).values(data).returning();
    return applicant;
  }

  async updateApplicantProfile(appId: number, data: any): Promise<Applicant> {
    const [applicant] = await db
      .update(applicants)
      .set(data)
      .where(eq(applicants.appId, appId))
      .returning();
    return applicant;
  }

  async getAllApplicants(): Promise<Applicant[]> {
    return await db.select().from(applicants);
  }

  // Positions & Schools
  async getPositions(): Promise<Position[]> {
    return await db.select().from(positions);
  }

  async getPositionById(positionId: number): Promise<Position | undefined> {
    const [position] = await db
      .select()
      .from(positions)
      .where(eq(positions.positionId, positionId));
    return position;
  }

  async createPosition(data: any): Promise<Position> {
    const [result] = await db
      .insert(positions)
      .values({
        position: data.position,
        salaryGrade: Number(data.salaryGrade),
        monthlySalary: String(data.monthlySalary),
        standardEducation: Number(data.standardEducation || 0),
        standardTraining: Number(data.standardTraining || 0),
        standardExperience: Number(data.standardExperience || 0),
        schoolYear: data.schoolYear,
        levels: data.levels,
      })
      .returning();
    return result;
  }

  async updatePosition(positionId: number, data: any): Promise<Position> {
    const updateData: any = {};
    if (data.position !== undefined) updateData.position = data.position;
    if (data.salaryGrade !== undefined)
      updateData.salaryGrade = Number(data.salaryGrade);
    if (data.monthlySalary !== undefined)
      updateData.monthlySalary = String(data.monthlySalary);
    if (data.standardEducation !== undefined)
      updateData.standardEducation = Number(data.standardEducation);
    if (data.standardTraining !== undefined)
      updateData.standardTraining = Number(data.standardTraining);
    if (data.standardExperience !== undefined)
      updateData.standardExperience = Number(data.standardExperience);
    if (data.schoolYear !== undefined) updateData.schoolYear = data.schoolYear;
    if (data.levels !== undefined) updateData.levels = data.levels;

    const [result] = await db
      .update(positions)
      .set(updateData)
      .where(eq(positions.positionId, positionId))
      .returning();
    return result;
  }

  async deletePosition(positionId: number): Promise<void> {
    await db.delete(positions).where(eq(positions.positionId, positionId));
  }

  async getSchools(): Promise<any[]> {
    return await db.select().from(schoolsDivisionOffice);
  }

  async getMajors(): Promise<Major[]> {
    return await db.select().from(majors);
  }

  // Applications
  async createApplication(data: any): Promise<ApplicationCode> {
    const [app] = await db.insert(applicationCodes).values(data).returning();
    return app;
  }

  async getApplicationsByApplicant(appId: number): Promise<any[]> {
    // Join with position
    const result = await db
      .select({
        appCodeId: applicationCodes.appCodeId,
        applicantCode: applicationCodes.applicantCode,
        status: applicationCodes.status,
        createdAt: applicationCodes.createdAt,
        position: positions,
      })
      .from(applicationCodes)
      .innerJoin(
        positions,
        eq(applicationCodes.positionId, positions.positionId),
      )
      .where(eq(applicationCodes.appId, appId))
      .orderBy(desc(applicationCodes.createdAt));
    return result;
  }

  async getAllApplications(): Promise<any[]> {
    const result = await db
      .select({
        appCode: applicationCodes,
        applicant: applicants,
        position: positions,
      })
      .from(applicationCodes)
      .innerJoin(applicants, eq(applicationCodes.appId, applicants.appId))
      .innerJoin(
        positions,
        eq(applicationCodes.positionId, positions.positionId),
      )
      .orderBy(desc(applicationCodes.createdAt));

    return result.map((r) => ({
      ...r.appCode,
      applicant: r.applicant,
      position: r.position,
    }));
  }

  async getApplicationById(appCodeId: number): Promise<any> {
    const [app] = await db
      .select()
      .from(applicationCodes)
      .where(eq(applicationCodes.appCodeId, appCodeId));
    if (!app) return null;

    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.appId, app.appId));
    const [position] = await db
      .select()
      .from(positions)
      .where(eq(positions.positionId, app.positionId));

    // Check for IER, IES, CAR
    const [ierData] = await db
      .select()
      .from(ier)
      .where(eq(ier.appCodeId, appCodeId));
    let iesData = undefined;
    let carData = undefined;

    if (ierData) {
      const [foundIes] = await db
        .select()
        .from(ies)
        .where(eq(ies.ierId, ierData.ierId));
      if (foundIes) {
        const [school] = await db
          .select()
          .from(schoolsDivisionOffice)
          .where(eq(schoolsDivisionOffice.schoolId, foundIes.schoolId));
        iesData = {
          ...foundIes,
          schoolName: school?.name,
        };
        const [foundCar] = await db
          .select()
          .from(car)
          .where(eq(car.iesId, foundIes.iesId));
        carData = foundCar;
      }
    }

    return {
      ...app,
      applicant,
      position,
      ier: ierData
        ? {
            ...ierData,
            standardEducation: position.standardEducation,
            standardTraining: position.standardTraining,
            standardExperience: position.standardExperience,
          }
        : undefined,
      ies: iesData,
      car: carData,
    };
  }

  // Evaluation
  async createIER(data: any): Promise<IER> {
    const [result] = await db.insert(ier).values(data).returning();
    // Update application status
    await db
      .update(applicationCodes)
      .set({
        status: data.remarks === "qualified" ? "qualified" : "disqualified",
      })
      .where(eq(applicationCodes.appCodeId, data.appCodeId));
    return result;
  }

  async getIERByAppCodeId(appCodeId: number): Promise<IER | undefined> {
    const [result] = await db
      .select()
      .from(ier)
      .where(eq(ier.appCodeId, appCodeId));
    return result;
  }

  async createIES(data: any): Promise<IES> {
    const [ierRecord] = await db
      .select()
      .from(ier)
      .where(eq(ier.ierId, data.ierId));

    if (!ierRecord) throw new Error("IER not found");

    const calculateScore = (increment: number) => {
      if (increment >= 10) return 10;
      if (increment >= 8) return 8;
      if (increment >= 6) return 6;
      if (increment >= 4) return 4;
      if (increment >= 2) return 2;
      return 0;
    };

    const educationScore = calculateScore(ierRecord.incrementEducation || 0);
    const trainingScore = calculateScore(ierRecord.incrementTraining || 0);
    const experienceScore = calculateScore(ierRecord.incrementExperience || 0);

    const pbetRating = Number(data.pbetLetLptRating || 0);
    const classObs = Number(data.classObs || 0);
    const nonClassObs = Number(data.nonClassObs || 0);

    const actualScore =
      educationScore +
      trainingScore +
      experienceScore +
      pbetRating +
      classObs +
      nonClassObs;

    const [result] = await db
      .insert(ies)
      .values({
        ...data,
        education: educationScore.toString(),
        training: trainingScore.toString(),
        experience: experienceScore.toString(),
        actualScore,
      })
      .returning();
    // Update application status to under assessment
    const [ierRec] = await db
      .select()
      .from(ier)
      .where(eq(ier.ierId, data.ierId));
    if (ierRec) {
      await db
        .update(applicationCodes)
        .set({ status: "under_assessment" })
        .where(eq(applicationCodes.appCodeId, ierRec.appCodeId));
    }
    return result;
  }

  async getIESByIERId(ierId: number): Promise<IES | undefined> {
    const [result] = await db.select().from(ies).where(eq(ies.ierId, ierId));
    return result;
  }

  async createCAR(data: any): Promise<CAR> {
    const [result] = await db.insert(car).values(data).returning();
    // Update application status to finalized
    const [iesRec] = await db
      .select()
      .from(ies)
      .where(eq(ies.iesId, data.iesId));
    if (iesRec) {
      const [ierRec] = await db
        .select()
        .from(ier)
        .where(eq(ier.ierId, iesRec.ierId));
      if (ierRec) {
        await db
          .update(applicationCodes)
          .set({ status: "finalized" })
          .where(eq(applicationCodes.appCodeId, ierRec.appCodeId));
      }
    }
    return result;
  }

  async getCARByIESId(iesId: number): Promise<CAR | undefined> {
    const [result] = await db.select().from(car).where(eq(car.iesId, iesId));
    return result;
  }

  // Seeds
  async seedPositions() {
    const count = await db.select().from(positions);
    if (count.length === 0) {
      await db.insert(positions).values([
        {
          position: "Teacher I",
          salaryGrade: 11,
          monthlySalary: "27000",
          standardEducation: 6,
          standardTraining: 1,
          standardExperience: 2,
        },
        {
          position: "Teacher II",
          salaryGrade: 12,
          monthlySalary: "29165",
          standardEducation: 8,
          standardTraining: 2,
          standardExperience: 4,
        },
        {
          position: "Master Teacher I",
          salaryGrade: 18,
          monthlySalary: "46725",
          standardEducation: 15,
          standardTraining: 10,
          standardExperience: 10,
        },
      ]);
    }
  }

  async seedSchools() {
    const count = await db.select().from(schoolsDivisionOffice);
    if (count.length === 0) {
      await db.insert(schoolsDivisionOffice).values([
        { name: "Central Elementary School", address: "Poblacion, City" },
        { name: "National High School", address: "Brgy. San Jose, City" },
      ]);
    }
  }

  async seedAdmin(): Promise<void> {
    const existing = await this.getUserByUsername("admin");
    if (!existing) {
      // Default admin (Secretariat/ASDS roles would need specific user accounts in real app, but for now generic admin)
      await this.createUser({
        username: "admin",
        password: "password",
        role: "admin",
      });
      await this.createUser({
        username: "hr",
        password: "password",
        role: "admin",
      });
      await this.createUser({
        username: "asds",
        password: "password",
        role: "admin",
      });
    }
  }

  async seedMajors() {
    const count = await db.select().from(majors);
    if (count.length === 0) {
      await db.insert(majors).values([
        { name: "English" },
        { name: "Mathematics" },
        { name: "Filipino" },
        { name: "MAPEH" },
        { name: "Araling Panlipunan" },
        { name: "EPP/TLE" },
        { name: "Science" },
        { name: "Values" },
        { name: "Other" },
      ]);
    }
  }
}

export const storage = new DatabaseStorage();
