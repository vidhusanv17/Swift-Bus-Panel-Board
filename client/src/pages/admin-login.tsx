import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, User } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simple authentication - in production, this would be server-side
    if (credentials.username === "admin" && credentials.password === "punjab@123") {
      localStorage.setItem("admin_token", "authenticated");
      setLocation("/admin/dashboard");
    } else {
      setError("Invalid credentials. Use admin / punjab@123");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-led-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-led-blue bg-gray-900">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-led-blue/20 border border-led-blue">
              <Lock className="h-8 w-8 text-led-blue" />
            </div>
          </div>
          <CardTitle className="text-2xl text-led-white font-led">
            Punjab Roadways Admin
          </CardTitle>
          <CardDescription className="text-led-white/70">
            Sign in to manage bus schedules and announcements
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-led-white">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-led-blue" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="pl-10 bg-gray-800 border-gray-600 text-led-white"
                  required
                  data-testid="input-username"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-led-white">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-led-blue" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10 bg-gray-800 border-gray-600 text-led-white"
                  required
                  data-testid="input-password"
                />
              </div>
            </div>

            {error && (
              <Alert className="border-led-red bg-red-900/20">
                <AlertDescription className="text-led-red">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-led-blue hover:bg-led-blue/80 text-black font-semibold"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="text-center text-sm text-led-white/60">
              Demo credentials: admin / punjab@123
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}