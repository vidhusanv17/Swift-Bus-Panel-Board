import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertBusSchema, type Bus, type InsertBus } from "@shared/schema";

interface BusFormProps {
  bus?: Bus | null;
  onClose: () => void;
}

export default function BusForm({ bus, onClose }: BusFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InsertBus>({
    resolver: zodResolver(insertBusSchema),
    defaultValues: bus ? {
      busNumber: bus.busNumber,
      route: bus.route,
      destination: bus.destination,
      etaMinutes: bus.etaMinutes,
      status: bus.status,
      platform: bus.platform || "",
    } : {
      busNumber: "",
      route: "",
      destination: "",
      etaMinutes: 10,
      status: "arriving",
      platform: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertBus) => {
      const response = await fetch("/api/buses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create bus");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buses"] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertBus) => {
      const response = await fetch(`/api/buses/${bus!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update bus");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buses"] });
      onClose();
    },
  });

  const onSubmit = async (data: InsertBus) => {
    setIsLoading(true);
    try {
      if (bus) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Error saving bus:", error);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-led-blue text-led-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-led-blue">
            {bus ? "Edit Bus" : "Add New Bus"}
          </DialogTitle>
          <DialogDescription className="text-led-white/70">
            {bus ? "Update bus information" : "Add a new bus to the schedule"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="busNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-led-white">Bus Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., PB05-1123, PRTC-45"
                      {...field}
                      className="bg-gray-800 border-gray-600 text-led-white"
                      data-testid="input-bus-number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="route"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-led-white">Route</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., LUDHIANA → AMRITSAR"
                      {...field}
                      className="bg-gray-800 border-gray-600 text-led-white"
                      data-testid="input-route"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-led-white">Destination</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Amritsar"
                      {...field}
                      className="bg-gray-800 border-gray-600 text-led-white"
                      data-testid="input-destination"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="etaMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-led-white">ETA (Minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-gray-800 border-gray-600 text-led-white"
                        data-testid="input-eta-minutes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-led-white">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="bg-gray-800 border-gray-600 text-led-white"
                          data-testid="select-status"
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="on-time" className="text-green-400">On Time</SelectItem>
                        <SelectItem value="arriving" className="text-yellow-400">Arriving</SelectItem>
                        <SelectItem value="delayed" className="text-red-400">Delayed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-led-white">Platform</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Platform 2"
                      {...field}
                      value={field.value || ""}
                      className="bg-gray-800 border-gray-600 text-led-white"
                      data-testid="input-platform"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-led-white hover:bg-gray-800"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-led-blue hover:bg-led-blue/80 text-black"
                data-testid="button-save"
              >
                {isLoading ? "Saving..." : bus ? "Update Bus" : "Add Bus"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}