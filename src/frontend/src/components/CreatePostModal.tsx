import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useCallerProfile, useCreatePost } from "../hooks/useSocialQueries";
import { UserAvatar } from "./UserAvatar";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const { data: callerProfile } = useCallerProfile();
  const createPost = useCreatePost();

  const handleSubmit = () => {
    if (!content.trim()) return;
    createPost.mutate(content.trim(), {
      onSuccess: () => {
        setContent("");
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border text-foreground max-w-lg"
        data-ocid="create_post.dialog"
      >
        <DialogHeader>
          <DialogTitle>New Post</DialogTitle>
        </DialogHeader>
        <div className="flex gap-3 mt-2">
          <UserAvatar username={callerProfile?.username || "You"} size="md" />
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-muted/40 border-border resize-none min-h-[120px] text-sm placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                  handleSubmit();
              }}
              data-ocid="create_post.textarea"
              autoFocus
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {content.length}/500
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  data-ocid="create_post.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={
                    !content.trim() ||
                    createPost.isPending ||
                    content.length > 500
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-ocid="create_post.submit_button"
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
      </DialogContent>
    </Dialog>
  );
}
