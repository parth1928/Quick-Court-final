"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthRequiredProps {
  message?: string;
  redirectPath?: string;
}

export function AuthRequired({ 
  message = "Please log in to access this page", 
  redirectPath = "/login" 
}: AuthRequiredProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push(redirectPath);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl">Authentication Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            {message}
          </p>
          <Button 
            onClick={handleLogin} 
            className="w-full"
            size="lg"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
