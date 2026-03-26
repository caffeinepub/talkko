import { Button } from "@/components/ui/button";
import { Heart, Loader2, MessageCircle, Users } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center max-w-md"
      >
        {/* Logo */}
        <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-glow">
          <span className="text-primary-foreground font-bold text-3xl">t</span>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-3">Talkko</h1>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          Connect, share, and discover with a community that actually talks.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {[
            { icon: MessageCircle, label: "Post & Comment" },
            { icon: Heart, label: "Like & React" },
            { icon: Users, label: "Follow Friends" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 text-sm text-muted-foreground"
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
              {label}
            </div>
          ))}
        </div>

        <Button
          onClick={login}
          disabled={isLoggingIn}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 h-12 text-base"
          data-ocid="landing.primary_button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing in...
            </>
          ) : (
            "Sign In to Talkko"
          )}
        </Button>

        <p className="text-muted-foreground text-xs mt-4">
          Secured by Internet Identity
        </p>
      </motion.div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-primary">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
