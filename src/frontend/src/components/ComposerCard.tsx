import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useCreatePost } from "../hooks/useSocialQueries";
import type { Profile } from "../types/social";
import { UserAvatar } from "./UserAvatar";

interface ComposerCardProps {
  callerProfile: Profile | null;
}

export function ComposerCard({ callerProfile }: ComposerCardProps) {
  const [content, setContent] = useState("");
  const createPost = useCreatePost();

  const handleSubmit = () => {
    if (!content.trim()) return;
    createPost.mutate(content.trim(), {
      onSuccess: () => setContent(""),
    });
  };

  const username = callerProfile?.username || "You";

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 shadow-card"
      data-ocid="composer.card"
    >
      <div className="flex gap-3">
        <UserAvatar username={username} size="md" />
        <div className="flex-1">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-muted/40 border-border resize-none min-h-[80px] text-sm placeholder:text-muted-foreground focus-visible:ring-primary/50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
            data-ocid="composer.textarea"
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || createPost.isPending}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              data-ocid="composer.submit_button"
            >
              {createPost.isPending && (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              )}
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
