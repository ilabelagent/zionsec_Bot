import { Express, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertUserSchema, users } from "@shared/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in the environment variables. Please set a secure secret for JWT.");
}


export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@valifi.com";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123";

async function ensureDefaultAdmin() {
  // If defaults intentionally disabled, allow empty password to skip seeding
  if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
    return;
  }

  try {
    const existingUser = await storage.getUserByEmail(DEFAULT_ADMIN_EMAIL);

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
      await storage.upsertUser({
        email: DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        profileImageUrl: "",
        isAdmin: true,
      });
      console.log(`[auth] Created default admin user (${DEFAULT_ADMIN_EMAIL}).`);
      return;
    }

    if (!existingUser.isAdmin) {
      await storage.updateUserStatus(existingUser.id, true);
      console.log(`[auth] Promoted existing user ${DEFAULT_ADMIN_EMAIL} to admin.`);
    }
  } catch (error) {
    console.warn("[auth] Failed to ensure default admin user:", error);
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, user?: object) => {
    if (err) return res.sendStatus(403); // Invalid token
    if (!user) return res.sendStatus(403); // Invalid token
    // Set both formats for compatibility
    (req as any).userId = (user as any).userId;
    // Set Replit Auth compatible format for existing routes
    (req as any).user = {
      claims: {
        sub: (user as any).userId
      }
    };
    next();
  });
};

export async function setupAuth(app: Express) {
  if (process.env.NODE_ENV === "development") {
    await ensureDefaultAdmin();
  }

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid user data", error: validation.error.toString() });
      }

      const { email, password, firstName, lastName } = validation.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await storage.upsertUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        profileImageUrl: "", // Default empty
        isAdmin: false,
      });

      const token = generateToken(newUser.id);
      res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id);
      res.json({ message: "Logged in successfully", token });
    } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (_req, res) => {
    // On the client side, the token should be removed from localStorage.
    // This endpoint is mostly for acknowledging the logout action.
    res.json({ message: "Logged out successfully" });
  });
}
