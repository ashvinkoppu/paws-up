/**
 * PublicFooter — consistent footer used across all public-facing pages.
 *
 * Centralising this avoids the same footer being hand-written (and
 * diverging) in every page file. The link set is the canonical list:
 * FAQ · Privacy · Terms · Attributions.
 */
import React from "react";
import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";

const PublicFooter: React.FC = () => (
  <footer className="border-t border-border py-7">
    <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
          <PawPrint className="w-5 h-5 text-primary" />
        </div>
        <span className="font-medium">Paws Up</span>
      </div>
      <nav className="flex items-center gap-6">
        <Link
          to="/faq"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          FAQ
        </Link>
        <Link
          to="/privacy"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Privacy
        </Link>
        <Link
          to="/terms"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Terms
        </Link>
        <Link
          to="/attributions"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Attributions
        </Link>
      </nav>
    </div>
  </footer>
);

export default PublicFooter;
