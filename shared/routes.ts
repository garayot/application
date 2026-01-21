import { z } from "zod";
import { 
  insertUserSchema, 
  insertApplicantSchema, 
  insertApplicationCodeSchema, 
  insertIerSchema, 
  insertIesSchema, 
  insertCarSchema,
  applicants,
  positions,
  applicationCodes,
  ier,
  ies,
  car
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// Custom Inputs
const registerSchema = insertUserSchema.extend({
  role: z.enum(["user", "admin"]).default("user"),
  // Optional profile fields could be merged here for a single-step registration, 
  // but we'll likely keep it multi-step or separate
});

// API Contract
export const api = {
  auth: {
    register: {
      method: "POST" as const,
      path: "/api/register",
      input: registerSchema,
      responses: {
        201: z.object({ id: z.number(), username: z.string(), role: z.string() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: "POST" as const,
      path: "/api/login",
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ id: z.number(), username: z.string(), role: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/user",
      responses: {
        200: z.object({ id: z.number(), username: z.string(), role: z.string() }).nullable(),
      },
    },
  },
  applicants: {
    getProfile: {
      method: "GET" as const,
      path: "/api/applicant/profile",
      responses: {
        200: z.custom<typeof applicants.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    updateProfile: {
      method: "POST" as const, // Or PUT
      path: "/api/applicant/profile",
      input: insertApplicantSchema,
      responses: {
        200: z.custom<typeof applicants.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: { // For HR
      method: "GET" as const,
      path: "/api/applicants",
      responses: {
        200: z.array(z.custom<typeof applicants.$inferSelect>()),
      },
    }
  },
  applications: {
    create: {
      method: "POST" as const,
      path: "/api/applications",
      input: insertApplicationCodeSchema,
      responses: {
        201: z.custom<typeof applicationCodes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listMy: { // For applicant
      method: "GET" as const,
      path: "/api/my-applications",
      responses: {
        200: z.array(z.custom<typeof applicationCodes.$inferSelect & { position: typeof positions.$inferSelect, status: string }>()),
      },
    },
    listAll: { // For HR/ASDS
      method: "GET" as const,
      path: "/api/applications",
      responses: {
        200: z.array(z.custom<typeof applicationCodes.$inferSelect & { applicant: typeof applicants.$inferSelect, position: typeof positions.$inferSelect }>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/applications/:id",
      responses: {
        200: z.custom<typeof applicationCodes.$inferSelect & { 
          applicant: typeof applicants.$inferSelect, 
          position: typeof positions.$inferSelect,
          ier?: typeof ier.$inferSelect,
          ies?: typeof ies.$inferSelect,
          car?: typeof car.$inferSelect
        }>(),
        404: errorSchemas.notFound,
      },
    }
  },
  ier: {
    create: {
      method: "POST" as const,
      path: "/api/applications/:id/ier",
      input: insertIerSchema.omit({ appCodeId: true }),
      responses: {
        201: z.custom<typeof ier.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  ies: {
    create: {
      method: "POST" as const,
      path: "/api/ier/:id/ies",
      input: insertIesSchema.omit({ ierId: true }),
      responses: {
        201: z.custom<typeof ies.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  car: {
    create: {
      method: "POST" as const,
      path: "/api/ies/:id/car",
      input: insertCarSchema.omit({ iesId: true }),
      responses: {
        201: z.custom<typeof car.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  positions: {
    list: {
      method: "GET" as const,
      path: "/api/positions",
      responses: {
        200: z.array(z.custom<typeof positions.$inferSelect>()),
      },
    }
  },
  schools: {
    list: {
      method: "GET" as const,
      path: "/api/schools",
      responses: {
        200: z.array(z.object({ schoolId: z.number(), name: z.string(), address: z.string() })),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
