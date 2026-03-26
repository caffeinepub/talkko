import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useDeletePost, useLikePost } from "../hooks/useSocialQueries";
import type { Post, Profile } from "../types/social";
import { relativeTime } from "../utils/helpers";
import { UserAvatar } from "./UserAvatar";

interface PostCardProps {
  post: Post;
  profile: Profile | null;
  isLiked: boolean;
  onOpenDetail?: (postId: string) => void;
  isOwnPost?: boolean;
}

export function PostCard({
  post,
  profile,
  isLiked: initialLiked,
  onOpenDetail,
  isOwnPost,
}: PostCardProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(Number(post.likeCount));
  const [heartAnim, setHeartAnim] = useState(false);
  const likePost = useLikePost();
  const deletePost = useDeletePost();

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    if (newLiked) {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 400);
    }
    likePost.mutate(post.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this post?")) {
      deletePost.mutate(post.id);
    }
  };

  const displayName = profile?.username || "Unknown";
  const handle = profile?.username
    ? `@${profile.username.toLowerCase().replace(/\s+/g, "_")}`
    : "";

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 shadow-card hover:border-border/80 transition-colors cursor-pointer"
      onClick={() => onOpenDetail?.(post.id)}
      onKeyDown={(e) => e.key === "Enter" && onOpenDetail?.(post.id)}
      tabIndex={0}
      data-ocid="post.card"
    >
      <div className="flex items-start gap-3">
        <UserAvatar username={displayName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground text-sm">
                {displayName}
              </span>
              <span className="text-muted-foreground text-xs">{handle}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-muted-foreground text-xs">
                {relativeTime(post.createdAt)}
              </span>
            </div>
            {isOwnPost && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                data-ocid="post.delete_button"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="mt-2 text-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
          <div
            className="flex items-center gap-5 mt-3"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <button
              type="button"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group"
              onClick={handleLike}
              data-ocid="post.toggle"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-all",
                  liked
                    ? "fill-primary text-primary"
                    : "group-hover:text-primary",
                  heartAnim && "animate-heart-pop",
                )}
              />
              <span
                className={cn("text-xs font-medium", liked && "text-primary")}
              >
                {likeCount}
              </span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail?.(post.id);
              }}
              data-ocid="post.button"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Reply</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
