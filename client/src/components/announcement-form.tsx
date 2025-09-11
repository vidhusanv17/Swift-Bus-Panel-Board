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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertAnnouncementSchema, type Announcement, type InsertAnnouncement } from "@shared/schema";

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  onClose: () => void;
}

export default function AnnouncementForm({ announcement, onClose }: AnnouncementFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InsertAnnouncement>({
    resolver: zodResolver(insertAnnouncementSchema),
    defaultValues: announcement ? {
      messageEnglish: announcement.messageEnglish,
      messagePunjabi: announcement.messagePunjabi,
      isActive: announcement.isActive,
      priority: announcement.priority || 1,
    } : {
      messageEnglish: "",
      messagePunjabi: "",
      isActive: 1,
      priority: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAnnouncement) => {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create announcement");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      onClose();
    },
  });

  const onSubmit = async (data: InsertAnnouncement) => {
    setIsLoading(true);
    try {
      await createMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-led-blue text-led-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-led-blue">
            {announcement ? "Edit Announcement" : "Add New Announcement"}
          </DialogTitle>
          <DialogDescription className="text-led-white/70">
            Create bilingual announcements for the bus display
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="messageEnglish"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-led-white">English Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter announcement in English"
                      {...field}
                      className="bg-gray-800 border-gray-600 text-led-white"
                      data-testid="textarea-english-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="messagePunjabi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-led-white">Punjabi Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ਪੰਜਾਬੀ ਵਿੱਚ ਘੋਸ਼ਣਾ ਲਿਖੋ"
                      {...field}
                      className="bg-gray-800 border-gray-600 text-led-white"
                      data-testid="textarea-punjabi-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-led-white">Priority</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        {...field}
                        value={field.value || 1}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        className="bg-gray-800 border-gray-600 text-led-white"
                        data-testid="input-priority"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0 pt-8">
                    <FormControl>
                      <Switch
                        checked={field.value === 1}
                        onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                        className="data-[state=checked]:bg-led-blue"
                        data-testid="switch-active"
                      />
                    </FormControl>
                    <FormLabel className="text-led-white">
                      Active
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

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
                {isLoading ? "Saving..." : announcement ? "Update" : "Add Announcement"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}