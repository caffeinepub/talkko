import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import { AppShell } from "./components/AppShell";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerProfile } from "./hooks/useSocialQueries";
import { ExplorePage } from "./pages/ExplorePage";
import { HomePage } from "./pages/HomePage";
import { LandingPage } from "./pages/LandingPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ProfilePage } from "./pages/ProfilePage";

const rootRoute = createRootRoute({
  component: Root,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <AppShell>
      <HomePage />
    </AppShell>
  ),
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: () => (
    <AppShell>
      <ExplorePage />
    </AppShell>
  ),
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: () => (
    <AppShell>
      <NotificationsPage />
    </AppShell>
  ),
});

const profileSelfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <AppShell>
      <ProfilePage />
    </AppShell>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$principalText",
  component: () => (
    <AppShell>
      <ProfilePage />
    </AppShell>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  exploreRoute,
  notificationsRoute,
  profileSelfRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function Root() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: callerProfile, isLoading: profileLoading } = useCallerProfile();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse" />
          <span className="text-muted-foreground text-sm">
            Loading Talkko...
          </span>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LandingPage />;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse" />
          <span className="text-muted-foreground text-sm">Setting up...</span>
        </div>
      </div>
    );
  }

  if (!callerProfile) {
    return <OnboardingPage />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <>
      <Root />
      <Toaster />
    </>
  );
}
