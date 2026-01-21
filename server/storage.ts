import { db } from "./db";
import { 
  users, applicants, secretariat, asds, positions, schoolsDivisionOffice, 
  applicationCodes, ier, ies, car,
  type User, type InsertUser, type Applicant, type Secretariat, type ASDS,
  type ApplicationCode, type IER, type IES, type CAR, type Position
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
  getSchools(): Promise<any[]>;

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
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Applicant
  async getApplicantByUserId(userId: number): Promise<Applicant | undefined> {
    const [applicant] = await db.select().from(applicants).where(eq(applicants.userId, userId));
    return applicant;
  }

  async getApplicantById(appId: number): Promise<Applicant | undefined> {
    const [applicant] = await db.select().from(applicants).where(eq(applicants.appId, appId));
    return applicant;
  }

  async createApplicantProfile(data: any): Promise<Applicant> {
    const [applicant] = await db.insert(applicants).values(data).returning();
    return applicant;
  }

  async updateApplicantProfile(appId: number, data: any): Promise<Applicant> {
    const [applicant] = await db.update(applicants).set(data).where(eq(applicants.appId, appId)).returning();
    return applicant;
  }

  async getAllApplicants(): Promise<Applicant[]> {
    return await db.select().from(applicants);
  }

  // Positions & Schools
  async getPositions(): Promise<Position[]> {
    return await db.select().from(positions);
  }

  async getSchools(): Promise<any[]> {
    return await db.select().from(schoolsDivisionOffice);
  }

  // Applications
  async createApplication(data: any): Promise<ApplicationCode> {
    const [app] = await db.insert(applicationCodes).values(data).returning();
    return app;
  }

  async getApplicationsByApplicant(appId: number): Promise<any[]> {
    // Join with position
    const result = await db.select({
      appCodeId: applicationCodes.appCodeId,
      applicantCode: applicationCodes.applicantCode,
      status: applicationCodes.status,
      createdAt: applicationCodes.createdAt,
      position: positions
    })
    .from(applicationCodes)
    .innerJoin(positions, eq(applicationCodes.positionId, positions.positionId))
    .where(eq(applicationCodes.appId, appId))
    .orderBy(desc(applicationCodes.createdAt));
    return result;
  }

  async getAllApplications(): Promise<any[]> {
    const result = await db.select({
      appCode: applicationCodes,
      applicant: applicants,
      position: positions
    })
    .from(applicationCodes)
    .innerJoin(applicants, eq(applicationCodes.appId, applicants.appId))
    .innerJoin(positions, eq(applicationCodes.positionId, positions.positionId))
    .orderBy(desc(applicationCodes.createdAt));
    
    return result.map(r => ({
      ...r.appCode,
      applicant: r.applicant,
      position: r.position
    }));
  }

  async getApplicationById(appCodeId: number): Promise<any> {
    const [app] = await db.select().from(applicationCodes).where(eq(applicationCodes.appCodeId, appCodeId));
    if (!app) return null;

    const [applicant] = await db.select().from(applicants).where(eq(applicants.appId, app.appId));
    const [position] = await db.select().from(positions).where(eq(positions.positionId, app.positionId));
    
    // Check for IER, IES, CAR
    const [ierData] = await db.select().from(ier).where(eq(ier.appCodeId, appCodeId));
    let iesData = undefined;
    let carData = undefined;

    if (ierData) {
      const [foundIes] = await db.select().from(ies).where(eq(ies.ierId, ierData.ierId));
      iesData = foundIes;
      if (iesData) {
        const [foundCar] = await db.select().from(car).where(eq(car.iesId, iesData.iesId));
        carData = foundCar;
      }
    }

    return {
      ...app,
      applicant,
      position,
      ier: ierData,
      ies: iesData,
      car: carData
    };
  }

  // Evaluation
  async createIER(data: any): Promise<IER> {
    const [result] = await db.insert(ier).values(data).returning();
    // Update application status
    await db.update(applicationCodes)
      .set({ status: data.remarks === 'qualified' ? 'qualified' : 'disqualified' })
      .where(eq(applicationCodes.appCodeId, data.appCodeId));
    return result;
  }

  async getIERByAppCodeId(appCodeId: number): Promise<IER | undefined> {
    const [result] = await db.select().from(ier).where(eq(ier.appCodeId, appCodeId));
    return result;
  }

  async createIES(data: any): Promise<IES> {
    const [result] = await db.insert(ies).values(data).returning();
    // Update application status to under assessment
    const [ierRec] = await db.select().from(ier).where(eq(ier.ierId, data.ierId));
    if (ierRec) {
        await db.update(applicationCodes)
          .set({ status: 'under_assessment' })
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
     const [iesRec] = await db.select().from(ies).where(eq(ies.iesId, data.iesId));
     if (iesRec) {
        const [ierRec] = await db.select().from(ier).where(eq(ier.ierId, iesRec.ierId));
        if (ierRec) {
             await db.update(applicationCodes)
               .set({ status: 'finalized' })
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
        { position: "Teacher I", salaryGrade: 11, monthlySalary: "27000" },
        { position: "Teacher II", salaryGrade: 12, monthlySalary: "29165" },
        { position: "Master Teacher I", salaryGrade: 18, monthlySalary: "46725" },
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

  async seedAdmin() {
    const existing = await this.getUserByUsername("admin");
    if (!existing) {
      // Default admin (Secretariat/ASDS roles would need specific user accounts in real app, but for now generic admin)
      await this.createUser({ username: "admin", password: "password", role: "admin" });
      await this.createUser({ username: "hr", password: "password", role: "admin" });
      await this.createUser({ username: "asds", password: "password", role: "admin" });
    }
  }
}

export const storage = new DatabaseStorage();
