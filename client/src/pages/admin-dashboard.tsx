import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, Edit2, Trash2, Bus, MessageSquare, Clock } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Bus as BusType, Announcement } from "@shared/schema";
import BusForm from "@/components/bus-form";
import AnnouncementForm from "@/components/announcement-form";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showBusForm, setShowBusForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  // Fetch data
  const { data: buses = [] } = useQuery<BusType[]>({
    queryKey: ["/api/buses"],
    refetchInterval: 10000,
  });

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
    refetchInterval: 10000,
  });

  // Delete mutations
  const deleteBusMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/buses/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete bus");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buses"] });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setLocation("/admin/login");
  };

  const handleEditBus = (bus: BusType) => {
    setSelectedBus(bus);
    setShowBusForm(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowAnnouncementForm(true);
  };

  const handleDeleteBus = async (id: string) => {
    if (confirm("Are you sure you want to delete this bus?")) {
      await deleteBusMutation.mutateAsync(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      "on-time": "bg-green-600",
      "arriving": "bg-yellow-600",
      "delayed": "bg-red-600",
    };
    return (
      <Badge className={`${colors[status as keyof typeof colors]} text-white`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  };

  return (
    <div className="min-h-screen bg-black text-led-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-led text-led-blue">Punjab Roadways Admin</h1>
          <p className="text-led-white/70 mt-1">Manage bus schedules and announcements</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="border-led-red text-led-red hover:bg-led-red hover:text-white"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-led-blue bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-led-white">Active Buses</CardTitle>
            <Bus className="h-4 w-4 text-led-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-led-blue">{buses.length}</div>
            <p className="text-xs text-led-white/70">Currently tracked</p>
          </CardContent>
        </Card>

        <Card className="border-led-green bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-led-white">On-Time Buses</CardTitle>
            <Clock className="h-4 w-4 text-led-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-led-green">
              {buses.filter(b => b.status === "on-time").length}
            </div>
            <p className="text-xs text-led-white/70">Running on schedule</p>
          </CardContent>
        </Card>

        <Card className="border-led-yellow bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-led-white">Active Announcements</CardTitle>
            <MessageSquare className="h-4 w-4 text-led-yellow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-led-yellow">
              {announcements.filter(a => a.isActive === 1).length}
            </div>
            <p className="text-xs text-led-white/70">Currently broadcasting</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="buses" className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-700">
          <TabsTrigger value="buses" className="data-[state=active]:bg-led-blue data-[state=active]:text-black">
            Bus Management
          </TabsTrigger>
          <TabsTrigger value="announcements" className="data-[state=active]:bg-led-blue data-[state=active]:text-black">
            Announcements
          </TabsTrigger>
        </TabsList>

        {/* Bus Management Tab */}
        <TabsContent value="buses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-led-white">Bus Schedules</h2>
            <Button
              onClick={() => {
                setSelectedBus(null);
                setShowBusForm(true);
              }}
              className="bg-led-blue hover:bg-led-blue/80 text-black"
              data-testid="button-add-bus"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Bus
            </Button>
          </div>

          <div className="grid gap-4">
            {buses.map((bus) => (
              <Card key={bus.id} className="border-gray-700 bg-gray-900">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="font-semibold text-led-white text-lg">
                        {bus.busNumber}
                      </div>
                      <div className="text-sm text-led-white/70">{bus.route}</div>
                    </div>
                    <div>
                      <div className="text-led-white">{bus.destination}</div>
                      <div className="text-sm text-led-blue">{bus.platform}</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-led-yellow">
                        {bus.etaMinutes} MIN
                      </div>
                      <div className="text-sm text-led-white/70">ETA</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(bus.status)}
                      <div className="text-xs text-led-white/70">
                        Updated: {formatTime(bus.lastUpdated || new Date())}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBus(bus)}
                      className="border-led-blue text-led-blue hover:bg-led-blue hover:text-black"
                      data-testid={`button-edit-${bus.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBus(bus.id)}
                      className="border-led-red text-led-red hover:bg-led-red hover:text-white"
                      data-testid={`button-delete-${bus.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-led-white">Announcements</h2>
            <Button
              onClick={() => {
                setSelectedAnnouncement(null);
                setShowAnnouncementForm(true);
              }}
              className="bg-led-blue hover:bg-led-blue/80 text-black"
              data-testid="button-add-announcement"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Announcement
            </Button>
          </div>

          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="border-gray-700 bg-gray-900">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <Badge
                          className={`${
                            announcement.isActive === 1 ? "bg-green-600" : "bg-gray-600"
                          } text-white`}
                        >
                          {announcement.isActive === 1 ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                        <Badge variant="outline" className="border-led-blue text-led-blue">
                          Priority: {announcement.priority}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="text-led-white font-medium">
                          🇺🇸 {announcement.messageEnglish}
                        </div>
                        <div className="text-led-white font-medium">
                          🇮🇳 {announcement.messagePunjabi}
                        </div>
                      </div>
                      <div className="text-xs text-led-white/70">
                        Created: {formatTime(announcement.createdAt || new Date())}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="border-led-blue text-led-blue hover:bg-led-blue hover:text-black"
                        data-testid={`button-edit-announcement-${announcement.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-led-red text-led-red hover:bg-led-red hover:text-white"
                        data-testid={`button-delete-announcement-${announcement.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showBusForm && (
        <BusForm
          bus={selectedBus}
          onClose={() => {
            setShowBusForm(false);
            setSelectedBus(null);
          }}
        />
      )}

      {showAnnouncementForm && (
        <AnnouncementForm
          announcement={selectedAnnouncement}
          onClose={() => {
            setShowAnnouncementForm(false);
            setSelectedAnnouncement(null);
          }}
        />
      )}
    </div>
  );
}