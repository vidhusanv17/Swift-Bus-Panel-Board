import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const buses = pgTable("buses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  busNumber: text("bus_number").notNull(),
  route: text("route").notNull(),
  destination: text("destination").notNull(),
  etaMinutes: integer("eta_minutes").notNull(),
  status: text("status").notNull(), // 'on-time', 'arriving', 'delayed'
  platform: text("platform"),
  lastUpdated: timestamp("last_updated").defaultNow()
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageEnglish: text("message_english").notNull(),
  messagePunjabi: text("message_punjabi").notNull(),
  isActive: integer("is_active").default(1), // 1 for active, 0 for inactive
  priority: integer("priority").default(1), // Higher number = higher priority
  createdAt: timestamp("created_at").defaultNow()
});

export const insertBusSchema = createInsertSchema(buses).pick({
  busNumber: true,
  route: true,
  destination: true,
  etaMinutes: true,
  status: true,
  platform: true
});

export const insertAnnouncementSchema = createInsertSchema(announcements).pick({
  messageEnglish: true,
  messagePunjabi: true,
  isActive: true,
  priority: true
});

export type InsertBus = z.infer<typeof insertBusSchema>;
export type Bus = typeof buses.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;
