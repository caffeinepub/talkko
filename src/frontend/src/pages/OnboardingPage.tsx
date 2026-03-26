import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateOrUpdateProfile } from "../hooks/useSocialQueries";

export function OnboardingPage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const createProfile = useCreateOrUpdateProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    createProfile.mutate(
      { username: username.trim(), bio: bio.trim(), avatarKey: "" },
      {
        onError: () =>
          toast.error("Failed to create profile. Please try again."),
      },
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">t</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Welcome to Talkko
              </h1>
              <p className="text-muted-foreground text-sm">
                Set up your profile to get started
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-foreground">
                Username
              </Label>
              <Input
                id="username"
                placeholder="e.g. alex_johnson"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-muted/40 border-border"
                maxLength={30}
                required
                data-ocid="onboarding.username.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-foreground">
                Bio <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell people a little about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-muted/40 border-border resize-none"
                maxLength={160}
                rows={3}
                data-ocid="onboarding.bio.textarea"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11"
              disabled={!username.trim() || createProfile.isPending}
              data-ocid="onboarding.submit_button"
            >
              {createProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  profile...
                </>
              ) : (
                "Continue to Talkko"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
