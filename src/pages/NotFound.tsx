import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PawPrint, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicFooter from "@/components/layout/PublicFooter";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 w-full" />

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-0 right-0 w-[700px] h-[600px] bg-primary/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <PawPrint className="w-8 h-8 text-primary" />
        </div>

        <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
          404
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-4">
          Page not found
        </h1>
        <p className="text-lg text-muted-foreground max-w-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <Link to="/">
          <Button className="gap-2 rounded-xl h-11 px-6 font-semibold">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Button>
        </Link>
      </div>

      <div className="relative z-10">
        <PublicFooter />
      </div>
    </div>
  );
};

export default NotFound;
