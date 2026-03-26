import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { ComposerCard } from "../components/ComposerCard";
import { PostCard } from "../components/PostCard";
import { PostDetailModal } from "../components/PostDetailModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllPosts,
  useAllProfiles,
  useCallerProfile,
  useLikedPostIds,
} from "../hooks/useSocialQueries";
import type { Profile } from "../types/social";

export function HomePage() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { identity } = useInternetIdentity();
  const { data: posts = [], isLoading: postsLoading } = useAllPosts();
  const { data: callerProfile } = useCallerProfile();
  const { data: allProfiles = [] } = useAllProfiles();
  const { data: likedIds = [] } = useLikedPostIds();

  const profilesMap = allProfiles.reduce<Record<string, Profile>>((acc, p) => {
    acc[p.principal.toString()] = p;
    return acc;
  }, {});

  const callerPrincipal = identity?.getPrincipal().toString();

  return (
    <div className="space-y-4" data-ocid="home.page">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-foreground">Home Feed</h1>
      </div>

      <ComposerCard callerProfile={callerProfile ?? null} />

      {postsLoading ? (
        <div className="space-y-4" data-ocid="home.loading_state">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl p-8 text-center"
          data-ocid="home.empty_state"
        >
          <p className="text-muted-foreground">
            No posts yet. Be the first to share something!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, idx) => (
            <div key={post.id} data-ocid={`home.post.item.${idx + 1}`}>
              <PostCard
                post={post}
                profile={profilesMap[post.authorPrincipal.toString()] ?? null}
                isLiked={likedIds.includes(post.id)}
                onOpenDetail={setSelectedPostId}
                isOwnPost={post.authorPrincipal.toString() === callerPrincipal}
              />
            </div>
          ))}
        </div>
      )}

      <PostDetailModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
        profilesMap={profilesMap}
        callerProfile={callerProfile ?? null}
      />
    </div>
  );
}
