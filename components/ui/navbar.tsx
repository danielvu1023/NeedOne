"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { User, ArrowLeft, LogOut, Settings, Shield, MessageSquare, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/login/actions";

export default function Navbar() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Thank you for your feedback!");
      setIsDialogOpen(false);
      setRating(0);
      setFeedbackType("");
      setFeedbackText("");
      setIsSubmitting(false);
    }, 1000);
  };

  const resetForm = () => {
    setRating(0);
    setFeedbackType("");
    setFeedbackText("");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Parks
            </Button> */}

            <button 
              onClick={() => router.push("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <User className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">NeedOne</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Feedback Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm mx-auto">
                <DialogHeader className="flex flex-row items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Share Your Feedback
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Help us improve NeedOne by sharing your thoughts and suggestions.
                  </p>
                  
                  {/* Rating */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">How would you rate your experience?</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          onClick={() => setRating(star)}
                        >
                          <Star 
                            className={`h-6 w-6 ${
                              star <= rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">What's this about? (Optional)</Label>
                    <RadioGroup value={feedbackType} onValueChange={setFeedbackType}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bug" id="bug" />
                        <Label htmlFor="bug" className="text-sm">Bug Report</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="feature" id="feature" />
                        <Label htmlFor="feature" className="text-sm">Feature Request</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="general" id="general" />
                        <Label htmlFor="general" className="text-sm">General Feedback</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Feedback Text */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Your Feedback</Label>
                    <Textarea
                      placeholder="Tell us what you think..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmitFeedback}
                      disabled={isSubmitting}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Feedback"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={"/placeholder.svg"} alt="" />
                    <AvatarFallback>""</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">Sam</p>
                    <p className="text-xs text-muted-foreground">
                      sam@example.com
                    </p>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  App Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
