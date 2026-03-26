import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import {
  useAddComment,
  useComments,
  useLikedPostIds,
  usePost,
} from "../hooks/useSocialQueries";
import type { Profile } from "../types/social";
import { relativeTime } from "../utils/helpers";
import { UserAvatar } from "./UserAvatar";

interface PostDetailModalProps {
  postId: string | null;
  onClose: () => void;
  profilesMap: Record<string, Profile>;
  callerProfile: Profile | null;
}

export function PostDetailModal({
  postId,
  onClose,
  profilesMap,
  callerProfile,
}: PostDetailModalProps) {
  const [commentText, setCommentText] = useState("");
  const { data: post, isLoading: postLoading } = usePost(postId);
  const { data: comments = [], isLoading: commentsLoading } =
    useComments(postId);
  const { data: likedIds = [] } = useLikedPostIds();
  const addComment = useAddComment();

  const authorProfile = post
    ? profilesMap[post.authorPrincipal.toString()]
    : null;
  const isLiked = post ? likedIds.includes(post.id) : false;

  const handleComment = () => {
    if (!postId || !commentText.trim()) return;
    addComment.mutate(
      { postId, content: commentText.trim() },
      {
        onSuccess: () => setCommentText(""),
      },
    );
  };

  return (
    <Dialog open={!!postId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-card border-border text-foreground max-w-lg max-h-[85vh] overflow-y-auto"
        data-ocid="post.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Post</DialogTitle>
        </DialogHeader>

        {postLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : post ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <UserAvatar username={authorProfile?.username || "?"} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {authorProfile?.username || "Unknown"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {relativeTime(post.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
                <div className="flex items-center gap-4 mt-3 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Heart
                      className={`h-4 w-4 ${isLiked ? "fill-primary text-primary" : ""}`}
                    />
                    <span className="text-xs">{Number(post.likeCount)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{comments.length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold mb-3 text-foreground">
                Comments
              </h4>
              {commentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No comments yet. Be the first!
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => {
                    const cp = profilesMap[comment.authorPrincipal.toString()];
                    return (
                      <div key={comment.id} className="flex gap-2">
                        <UserAvatar username={cp?.username || "?"} size="sm" />
                        <div className="bg-muted/30 rounded-lg px-3 py-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">
                              {cp?.username || "Unknown"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {relativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground mt-0.5">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {callerProfile && (
                <div className="flex gap-2 mt-4">
                  <UserAvatar username={callerProfile.username} size="sm" />
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleComment()}
                      className="bg-muted/40 border-border text-sm flex-1"
                      data-ocid="post.input"
                    />
                    <Button
                      size="sm"
                      onClick={handleComment}
                      disabled={!commentText.trim() || addComment.isPending}
                      className="bg-primary text-primary-foreground"
                      data-ocid="post.submit_button"
                    >
                      {addComment.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Post"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
