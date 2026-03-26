import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import { useParams } from "@tanstack/react-router";
import { Loader2, Settings, UserMinus, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { PostCard } from "../components/PostCard";
import { PostDetailModal } from "../components/PostDetailModal";
import { UserAvatar } from "../components/UserAvatar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllProfiles,
  useCallerProfile,
  useCreateOrUpdateProfile,
  useFollowUser,
  useFollowers,
  useFollowing,
  useIsFollowing,
  useLikedPostIds,
  usePostsByUser,
  useUnfollowUser,
} from "../hooks/useSocialQueries";
import type { Profile } from "../types/social";

export function ProfilePage() {
  const params = useParams({ strict: false }) as { principalText?: string };
  const { identity } = useInternetIdentity();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");

  const { data: callerProfile } = useCallerProfile();
  const { data: allProfiles = [] } = useAllProfiles();

  const profilesMap = allProfiles.reduce<Record<string, Profile>>((acc, p) => {
    acc[p.principal.toString()] = p;
    return acc;
  }, {});

  let targetPrincipal: Principal | null = null;
  if (params.principalText) {
    try {
      targetPrincipal = Principal.fromText(params.principalText);
    } catch {
      targetPrincipal = null;
    }
  } else {
    targetPrincipal = identity?.getPrincipal() ?? null;
  }

  const isOwnProfile =
    targetPrincipal?.toString() === identity?.getPrincipal().toString();
  const displayProfile = targetPrincipal
    ? profilesMap[targetPrincipal.toString()]
    : null;

  const { data: posts = [], isLoading: postsLoading } =
    usePostsByUser(targetPrincipal);
  const { data: likedIds = [] } = useLikedPostIds();
  const { data: followers = [] } = useFollowers(targetPrincipal);
  const { data: following } = useFollowing(targetPrincipal);
  const { data: isFollowing } = useIsFollowing(
    isOwnProfile ? null : targetPrincipal,
  );
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const updateProfile = useCreateOrUpdateProfile();

  const followingList = following ?? [];

  const openEdit = () => {
    setEditUsername(displayProfile?.username || "");
    setEditBio(displayProfile?.bio || "");
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!editUsername.trim()) {
      toast.error("Username is required");
      return;
    }
    updateProfile.mutate(
      {
        username: editUsername.trim(),
        bio: editBio.trim(),
        avatarKey: displayProfile?.avatarKey || "",
      },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("Profile updated!");
        },
        onError: () => toast.error("Failed to update profile"),
      },
    );
  };

  const username = displayProfile?.username || "Unknown";
  const handle = `@${username.toLowerCase().replace(/\s+/g, "_")}`;

  return (
    <div className="space-y-6" data-ocid="profile.page">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <UserAvatar username={username} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {username}
                </h1>
                <p className="text-muted-foreground text-sm">{handle}</p>
              </div>
              {isOwnProfile ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={openEdit}
                  className="flex-shrink-0"
                  data-ocid="profile.edit_button"
                >
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={isFollowing ? "secondary" : "default"}
                  onClick={() => {
                    if (!targetPrincipal) return;
                    if (isFollowing) unfollowUser.mutate(targetPrincipal);
                    else followUser.mutate(targetPrincipal);
                  }}
                  className={
                    isFollowing
                      ? ""
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }
                  data-ocid="profile.follow.toggle"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-3.5 w-3.5 mr-1.5" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>

            {displayProfile?.bio && (
              <p className="text-foreground text-sm mt-2 leading-relaxed">
                {displayProfile.bio}
              </p>
            )}

            <div className="flex gap-4 mt-3">
              <div className="text-sm">
                <span className="font-bold text-foreground">
                  {posts.length}
                </span>
                <span className="text-muted-foreground ml-1">Posts</span>
              </div>
              <div className="text-sm">
                <span className="font-bold text-foreground">
                  {followers.length}
                </span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </div>
              <div className="text-sm">
                <span className="font-bold text-foreground">
                  {followingList.length}
                </span>
                <span className="text-muted-foreground ml-1">Following</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Posts */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Posts
        </h2>
        {postsLoading ? (
          <div className="space-y-3" data-ocid="profile.loading_state">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-4"
              >
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="profile.posts.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              {isOwnProfile
                ? "You haven't posted anything yet."
                : "No posts yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post, idx) => (
              <div key={post.id} data-ocid={`profile.post.item.${idx + 1}`}>
                <PostCard
                  post={post}
                  profile={displayProfile ?? null}
                  isLiked={likedIds.includes(post.id)}
                  onOpenDetail={setSelectedPostId}
                  isOwnPost={isOwnProfile}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <PostDetailModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
        profilesMap={profilesMap}
        callerProfile={callerProfile ?? null}
      />

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="bg-card border-border text-foreground"
          data-ocid="profile.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="bg-muted/40 border-border"
                maxLength={30}
                data-ocid="profile.edit.username.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="bg-muted/40 border-border resize-none"
                maxLength={160}
                rows={3}
                data-ocid="profile.edit.bio.textarea"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setEditOpen(false)}
                data-ocid="profile.edit.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!editUsername.trim() || updateProfile.isPending}
                className="bg-primary text-primary-foreground"
                data-ocid="profile.edit.save_button"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
