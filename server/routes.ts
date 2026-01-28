import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import path from "path";
import express from "express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Serve uploaded files (mocked/local)
  const uploadsDir = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsDir));

  // --- Applicant Routes ---

  app.get(api.applicants.getProfile.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const applicant = await storage.getApplicantByUserId(req.user!.id);
    if (!applicant) return res.sendStatus(404);
    res.json(applicant);
  });

  app.post(api.applicants.updateProfile.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Check if profile exists
    let applicant = await storage.getApplicantByUserId(req.user!.id);
    
    try {
      const data = api.applicants.updateProfile.input.parse(req.body);
      
      if (applicant) {
        applicant = await storage.updateApplicantProfile(applicant.appId, data);
      } else {
        applicant = await storage.createApplicantProfile({ ...data, userId: req.user!.id });
      }
      res.json(applicant);
    } catch (e) {
      res.status(400).json({ message: "Validation failed" });
    }
  });

  // Applications
  app.post(api.applications.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const applicant = await storage.getApplicantByUserId(req.user!.id);
    if (!applicant) return res.status(400).json({ message: "Please complete your profile first" });

    try {
      const data = api.applications.create.input.parse(req.body);
      // Generate Applicant Code (mock logic: APP-{Date}-{Random})
      const code = `APP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*1000)}`;
      
      const appCode = await storage.createApplication({
        ...data,
        appId: applicant.appId,
        applicantCode: code,
      });

      // Create IER automatically for initial screening
      const position = await db.select().from(positions).where(eq(positions.positionId, appCode.positionId)).then(rows => rows[0]);
      if (position) {
        const ierData = {
          appCodeId: appCode.appCodeId,
          positionId: position.positionId,
          eligibility: applicant.eligibility,
          remarks: (Number(applicant.education) >= (Number(position.standardEducation) || 0) &&
                    (Number(applicant.training) || 0) >= (Number(position.standardTraining) || 0) &&
                    (Number(applicant.experience) || 0) >= (Number(position.standardExperience) || 0)) ? 'qualified' : 'disqualified' as any,
          applicantEducation: Number(applicant.education),
          applicantTraining: Number(applicant.training || 0),
          applicantExperience: Number(applicant.experience || 0),
        };
        await storage.createIER(ierData);
      }

      res.status(201).json(appCode);
    } catch (e) {
        console.log(e);
      res.status(400).json({ message: "Validation failed" });
    }
  });

  app.get(api.applications.listMy.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const applicant = await storage.getApplicantByUserId(req.user!.id);
    if (!applicant) return res.json([]);
    
    const apps = await storage.getApplicationsByApplicant(applicant.appId);
    res.json(apps);
  });

  app.get(api.applications.listAll.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") return res.sendStatus(403);
    const apps = await storage.getAllApplications();
    res.json(apps);
  });

  app.get(api.applications.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // If user is admin, allow. If user is applicant, check ownership.
    const fullApp = await storage.getApplicationById(Number(req.params.id));
    if (!fullApp) return res.sendStatus(404);

    if (req.user?.role !== "admin") {
      const applicant = await storage.getApplicantByUserId(req.user!.id);
      if (!applicant || applicant.appId !== fullApp.appId) return res.sendStatus(403);
    }

    res.json(fullApp);
  });

  // IER (HR)
  app.post(api.ier.create.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") return res.sendStatus(403);
    const appCodeId = Number(req.params.id);

    try {
      const data = req.body; // Use raw body for calculation logic
      const app = await storage.getApplicationById(appCodeId);
      if (!app) return res.sendStatus(404);

      // Calculation logic
      const stdEdu = Number(app.position.standardEducation || 0);
      const stdTra = Number(app.position.standardTraining || 0);
      const stdExp = Number(app.position.standardExperience || 0);
      
      const appEdu = Number(data.applicantEducation || 0);
      const appTra = Number(data.applicantTraining || 0);
      const appExp = Number(data.applicantExperience || 0);

      const incEdu = appEdu - stdEdu;
      const incTra = appTra - stdTra;
      const incExp = appExp - stdExp;

      // Disqualification logic: if Education increment is negative
      let remarks = data.remarks || 'qualified';
      if (incEdu < 0) {
        remarks = 'disqualified';
      }

      const result = await storage.createIER({
        ...data,
        appCodeId: appCodeId,
        positionId: app.positionId,
        remarks: remarks,
        incrementEducation: incEdu,
        incrementTraining: incTra,
        incrementExperience: incExp,
      });
      res.status(201).json(result);
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: "Validation failed" });
    }
  });

  // Positions
  app.post("/api/positions", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") return res.sendStatus(403);
    try {
      const data = req.body;
      const [result] = await db.insert(positions).values({
        position: data.position,
        salaryGrade: Number(data.salaryGrade),
        monthlySalary: String(data.monthlySalary),
        standardEducation: Number(data.standardEducation || 0),
        standardTraining: Number(data.standardTraining || 0),
        standardExperience: Number(data.standardExperience || 0),
      }).returning();
      res.status(201).json(result);
    } catch (e) {
      console.error("Position creation error:", e);
      res.status(400).json({ message: "Failed to create position", error: String(e) });
    }
  });

  app.patch("/api/positions/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") return res.sendStatus(403);
    try {
      const id = Number(req.params.id);
      const data = req.body;
      const updateData: any = {};
      if (data.position !== undefined) updateData.position = data.position;
      if (data.salaryGrade !== undefined) updateData.salaryGrade = Number(data.salaryGrade);
      if (data.monthlySalary !== undefined) updateData.monthlySalary = String(data.monthlySalary);
      if (data.standardEducation !== undefined) updateData.standardEducation = Number(data.standardEducation);
      if (data.standardTraining !== undefined) updateData.standardTraining = Number(data.standardTraining);
      if (data.standardExperience !== undefined) updateData.standardExperience = Number(data.standardExperience);

      const [result] = await db.update(positions)
        .set(updateData)
        .where(eq(positions.positionId, id))
        .returning();
      res.json(result);
    } catch (e) {
      console.error("Position update error:", e);
      res.status(400).json({ message: "Failed to update position", error: String(e) });
    }
  });

  app.delete("/api/positions/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") return res.sendStatus(403);
    try {
      const id = Number(req.params.id);
      await db.delete(positions).where(eq(positions.positionId, id));
      res.sendStatus(204);
    } catch (e) {
      res.status(400).json({ message: "Failed to delete position" });
    }
  });

  // IES (HR)
  app.post(api.ies.create.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") return res.sendStatus(403);
    const ierId = Number(req.params.id);

    try {
        const data = req.body;
        // Compute actual score based on manual inputs
        const actualScore = 
            Number(data.education || 0) + 
            Number(data.training || 0) + 
            Number(data.experience || 0) + 
            Number(data.performance || 0) + 
            Number(data.classObs || 0) + 
            Number(data.portfolioBei || 0);

        const result = await storage.createIES({
            ...data,
            ierId,
            actualScore: actualScore.toFixed(2),
        });
        res.status(201).json(result);
    } catch (e) {
        res.status(400).json({ message: "Validation failed" });
    }
  });

  // CAR (ASDS)
  app.post(api.car.create.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") return res.sendStatus(403);
    const iesId = Number(req.params.id);

    try {
        const data = req.body;
        
        // Ensure forBi is present as it is notNull in schema
        if (!data.forBi) {
            data.forBi = "yes";
        }

        const result = await storage.createCAR({
            ...data,
            iesId,
            finalizedBy: null, // Set to null to avoid foreign key constraint on asds table
            dateOfFinalDeliberation: new Date(),
        });
        res.status(201).json(result);
    } catch(e) {
        console.error("CAR creation error:", e);
        res.status(400).json({ message: "Validation failed" });
    }
  });


  // Lists
  app.get(api.positions.list.path, async (req, res) => {
    const pos = await storage.getPositions();
    res.json(pos);
  });

  app.get(api.schools.list.path, async (req, res) => {
    const schools = await storage.getSchools();
    res.json(schools);
  });
  
  app.get(api.applicants.list.path, async (req, res) => {
     if (!req.isAuthenticated() || req.user!.role !== "admin") return res.sendStatus(403);
     const applicants = await storage.getAllApplicants();
     res.json(applicants);
  });


  // Seed Data
  await storage.seedPositions();
  await storage.seedSchools();
  await storage.seedAdmin();

  return httpServer;
}
