import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBusSchema, insertAnnouncementSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all buses
  app.get("/api/buses", async (req, res) => {
    try {
      const buses = await storage.getAllBuses();
      res.json(buses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch buses" });
    }
  });

  // Get specific bus
  app.get("/api/buses/:id", async (req, res) => {
    try {
      const bus = await storage.getBus(req.params.id);
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }
      res.json(bus);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bus" });
    }
  });

  // Create new bus
  app.post("/api/buses", async (req, res) => {
    try {
      const validatedData = insertBusSchema.parse(req.body);
      const bus = await storage.createBus(validatedData);
      res.status(201).json(bus);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bus data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bus" });
      }
    }
  });

  // Update bus
  app.patch("/api/buses/:id", async (req, res) => {
    try {
      const updates = insertBusSchema.partial().parse(req.body);
      const bus = await storage.updateBus(req.params.id, updates);
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }
      res.json(bus);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update bus" });
      }
    }
  });

  // Delete bus
  app.delete("/api/buses/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBus(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Bus not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bus" });
    }
  });

  // Get active announcements
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getActiveAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Create new announcement
  app.post("/api/announcements", async (req, res) => {
    try {
      const validatedData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(validatedData);
      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid announcement data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create announcement" });
      }
    }
  });

  // Get current time (for synchronization)
  app.get("/api/time", (req, res) => {
    res.json({
      currentTime: new Date().toISOString(),
      timezone: "Asia/Kolkata"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
