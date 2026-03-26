import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Search, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { PostCard } from "../components/PostCard";
import { PostDetailModal } from "../components/PostDetailModal";
import { UserAvatar } from "../components/UserAvatar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllPosts,
  useAllProfiles,
  useFollowUser,
  useFollowing,
  useLikedPostIds,
  useUnfollowUser,
} from "../hooks/useSocialQueries";
import type { Profile } from "../types/social";

export function ExplorePage() {
  const [search, setSearch] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { identity } = useInternetIdentity();
  const { data: profiles = [], isLoading: profilesLoading } = useAllProfiles();
  const { data: posts = [], isLoading: postsLoading } = useAllPosts();
  const { data: likedIds = [] } = useLikedPostIds();
  const callerPrincipal = identity?.getPrincipal();
  const { data: following = [] } = useFollowing(callerPrincipal ?? null);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const followingSet = new Set(following.map((p) => p.toString()));

  const profilesMap = profiles.reduce<Record<string, Profile>>((acc, p) => {
    acc[p.principal.toString()] = p;
    return acc;
  }, {});

  const filteredProfiles = profiles.filter(
    (p) =>
      p.principal.toString() !== callerPrincipal?.toString() &&
      (search === "" ||
        p.username.toLowerCase().includes(search.toLowerCase()) ||
        p.bio.toLowerCase().includes(search.toLowerCase())),
  );

  const recentPosts = posts.slice(0, 6);

  return (
    <div className="space-y-6" data-ocid="explore.page">
      <h1 className="text-xl font-bold text-foreground">Explore</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border"
          data-ocid="explore.search_input"
        />
      </div>

      {/* People section */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          People to Follow
        </h2>
        {profilesLoading ? (
          <div
            className="grid gap-3 sm:grid-cols-2"
            data-ocid="explore.loading_state"
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div
            className="bg-card border border-border rounded-xl p-6 text-center"
            data-ocid="explore.users.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              {search ? "No users found" : "No other users yet"}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredProfiles.map((profile, idx) => {
              const isFollowingUser = followingSet.has(
                profile.principal.toString(),
              );
              return (
                <div
                  key={profile.principal.toString()}
                  className="bg-card border border-border rounded-xl p-4 flex items-start gap-3"
                  data-ocid={`explore.user.item.${idx + 1}`}
                >
                  <Link
                    to="/profile/$principalText"
                    params={{ principalText: profile.principal.toString() }}
                  >
                    <UserAvatar username={profile.username} size="md" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/profile/$principalText"
                      params={{ principalText: profile.principal.toString() }}
                    >
                      <p className="font-semibold text-sm text-foreground hover:text-primary transition-colors">
                        {profile.username}
                      </p>
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      @{profile.username.toLowerCase().replace(/\s+/g, "_")}
                    </p>
                    {profile.bio && (
                      <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={isFollowingUser ? "secondary" : "default"}
                    onClick={() => {
                      if (isFollowingUser) {
                        unfollowUser.mutate(profile.principal);
                      } else {
                        followUser.mutate(profile.principal);
                      }
                    }}
                    className={
                      isFollowingUser
                        ? ""
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }
                    data-ocid={`explore.user.toggle.${idx + 1}`}
                  >
                    {isFollowingUser ? (
                      <UserMinus className="h-3.5 w-3.5" />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent posts */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent Posts
        </h2>
        {postsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-4"
              >
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : recentPosts.length === 0 ? (
          <div
            className="bg-card border border-border rounded-xl p-6 text-center"
            data-ocid="explore.posts.empty_state"
          >
            <p className="text-muted-foreground text-sm">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post, idx) => (
              <div key={post.id} data-ocid={`explore.post.item.${idx + 1}`}>
                <PostCard
                  post={post}
                  profile={profilesMap[post.authorPrincipal.toString()] ?? null}
                  isLiked={likedIds.includes(post.id)}
                  onOpenDetail={setSelectedPostId}
                  isOwnPost={
                    post.authorPrincipal.toString() ===
                    callerPrincipal?.toString()
                  }
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <PostDetailModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
        profilesMap={profilesMap}
        callerProfile={
          profiles.find(
            (p) => p.principal.toString() === callerPrincipal?.toString(),
          ) ?? null
        }
      />
    </div>
  );
}
