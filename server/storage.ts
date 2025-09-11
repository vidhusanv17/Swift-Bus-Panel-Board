import { type Bus, type InsertBus, type Announcement, type InsertAnnouncement } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Bus operations
  getAllBuses(): Promise<Bus[]>;
  getBus(id: string): Promise<Bus | undefined>;
  createBus(bus: InsertBus): Promise<Bus>;
  updateBus(id: string, updates: Partial<InsertBus>): Promise<Bus | undefined>;
  deleteBus(id: string): Promise<boolean>;
  
  // Announcement operations
  getActiveAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
}

export class MemStorage implements IStorage {
  private buses: Map<string, Bus>;
  private announcements: Map<string, Announcement>;
  private etaUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.buses = new Map();
    this.announcements = new Map();
    this.initializeSampleData();
    this.startEtaUpdateTimer();
  }

  private initializeSampleData() {
    // Initialize with realistic Punjab bus routes
    const sampleBuses: InsertBus[] = [
      {
        busNumber: "PB05-1123",
        route: "LUDHIANA → AMRITSAR",
        destination: "Amritsar",
        etaMinutes: 5,
        status: "on-time",
        platform: "Platform 2"
      },
      {
        busNumber: "PRTC-45",
        route: "JALANDHAR → PATIALA",
        destination: "Patiala",
        etaMinutes: 12,
        status: "arriving",
        platform: "Platform 1"
      },
      {
        busNumber: "VOLVO-21",
        route: "BATHINDA → CHANDIGARH",
        destination: "Chandigarh",
        etaMinutes: 25,
        status: "delayed",
        platform: "Platform 3"
      },
      {
        busNumber: "PB08-2456",
        route: "MOHALI → KAPURTHALA",
        destination: "Kapurthala",
        etaMinutes: 8,
        status: "on-time",
        platform: "Platform 4"
      },
      {
        busNumber: "PRTC-78",
        route: "FEROZEPUR → GURDASPUR",
        destination: "Gurdaspur",
        etaMinutes: 15,
        status: "arriving",
        platform: "Platform 1"
      },
      {
        busNumber: "VOLVO-33",
        route: "MOGA → HOSHIARPUR",
        destination: "Hoshiarpur",
        etaMinutes: 3,
        status: "on-time",
        platform: "Platform 2"
      }
    ];

    sampleBuses.forEach(bus => {
      const id = randomUUID();
      const fullBus: Bus = {
        ...bus,
        id,
        lastUpdated: new Date()
      };
      this.buses.set(id, fullBus);
    });

    // Initialize announcements
    const sampleAnnouncements: InsertAnnouncement[] = [
      {
        messageEnglish: "Next bus to Chandigarh will arrive at Platform 2 in 10 minutes",
        messagePunjabi: "ਅਗਲਾ ਬੱਸ ਚੰਡੀਗੜ੍ਹ ਲਈ 10 ਮਿੰਟ ਵਿੱਚ ਪਲੇਟਫਾਰਮ 2 ਤੇ ਆਵੇਗਾ",
        isActive: 1,
        priority: 1
      },
      {
        messageEnglish: "Passengers are advised to take care of their belongings",
        messagePunjabi: "ਯਾਤਰੀਆਂ ਨੂੰ ਸੁਚਿਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ ਕਿ ਸਾਮਾਨ ਦੀ ਦੇਖਭਾਲ ਕਰੇਂ",
        isActive: 1,
        priority: 2
      },
      {
        messageEnglish: "Maintain cleanliness in the bus stand",
        messagePunjabi: "ਬੱਸ ਸਟੈਂਡ ਵਿੱਚ ਸਾਫ਼-ਸਫਾਈ ਦਾ ਧਿਆਨ ਰੱਖੋ",
        isActive: 1,
        priority: 3
      }
    ];

    sampleAnnouncements.forEach(announcement => {
      const id = randomUUID();
      const fullAnnouncement: Announcement = {
        ...announcement,
        id,
        createdAt: new Date()
      };
      this.announcements.set(id, fullAnnouncement);
    });
  }

  private startEtaUpdateTimer() {
    // Update ETA every minute and adjust status
    this.etaUpdateInterval = setInterval(() => {
      this.buses.forEach((bus, id) => {
        let newEta = Math.max(0, bus.etaMinutes - 1);
        let newStatus = bus.status;

        // Update status based on ETA
        if (newEta === 0) {
          // Bus has arrived, remove it and add a new one
          this.buses.delete(id);
          this.addRandomBus();
          return;
        } else if (newEta <= 5) {
          newStatus = "on-time";
        } else if (newEta <= 15) {
          newStatus = "arriving";
        } else {
          newStatus = "delayed";
        }

        const updatedBus: Bus = {
          ...bus,
          etaMinutes: newEta,
          status: newStatus,
          lastUpdated: new Date()
        };
        this.buses.set(id, updatedBus);
      });
    }, 60000); // Every minute
  }

  private addRandomBus() {
    const routes = [
      { busNumber: "PB01-" + Math.floor(Math.random() * 9999), route: "AMRITSAR → LUDHIANA", destination: "Ludhiana" },
      { busNumber: "PRTC-" + Math.floor(Math.random() * 99), route: "PATIALA → JALANDHAR", destination: "Jalandhar" },
      { busNumber: "VOLVO-" + Math.floor(Math.random() * 99), route: "CHANDIGARH → BATHINDA", destination: "Bathinda" },
      { busNumber: "PB09-" + Math.floor(Math.random() * 9999), route: "KAPURTHALA → MOHALI", destination: "Mohali" },
      { busNumber: "PRTC-" + Math.floor(Math.random() * 99), route: "GURDASPUR → FEROZEPUR", destination: "Ferozepur" },
    ];

    const randomRoute = routes[Math.floor(Math.random() * routes.length)];
    const newBus: InsertBus = {
      ...randomRoute,
      etaMinutes: Math.floor(Math.random() * 30) + 5, // 5-35 minutes
      status: "arriving",
      platform: `Platform ${Math.floor(Math.random() * 4) + 1}`
    };

    this.createBus(newBus);
  }

  async getAllBuses(): Promise<Bus[]> {
    return Array.from(this.buses.values()).sort((a, b) => a.etaMinutes - b.etaMinutes);
  }

  async getBus(id: string): Promise<Bus | undefined> {
    return this.buses.get(id);
  }

  async createBus(insertBus: InsertBus): Promise<Bus> {
    const id = randomUUID();
    const bus: Bus = {
      ...insertBus,
      id,
      lastUpdated: new Date()
    };
    this.buses.set(id, bus);
    return bus;
  }

  async updateBus(id: string, updates: Partial<InsertBus>): Promise<Bus | undefined> {
    const existingBus = this.buses.get(id);
    if (!existingBus) return undefined;

    const updatedBus: Bus = {
      ...existingBus,
      ...updates,
      lastUpdated: new Date()
    };
    this.buses.set(id, updatedBus);
    return updatedBus;
  }

  async deleteBus(id: string): Promise<boolean> {
    return this.buses.delete(id);
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values())
      .filter(announcement => announcement.isActive === 1)
      .sort((a, b) => (a.priority || 1) - (b.priority || 1));
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = randomUUID();
    const announcement: Announcement = {
      ...insertAnnouncement,
      id,
      createdAt: new Date()
    };
    this.announcements.set(id, announcement);
    return announcement;
  }
}

export const storage = new MemStorage();
