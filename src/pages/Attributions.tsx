import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PawPrint, ChevronRight, Star } from "lucide-react";
import { useScrolled } from "@/hooks/use-scroll-state";
import PublicFooter from "@/components/layout/PublicFooter";

const Attributions: React.FC = () => {
  const scrolled = useScrolled();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "UI Framework & Rendering",
      content: `React - Copyright © Meta Platforms, Inc. and affiliates
License: MIT
https://github.com/facebook/react

The core library powering Paws Up's component-based UI. All interactive elements, state management, and rendering are built on top of React 19.

React Router DOM - Copyright © Remix Software Inc.
License: MIT
https://github.com/remix-run/react-router

Handles all client-side navigation and route definitions within the app.`,
    },
    {
      title: "Component Library & Styling",
      content: `shadcn/ui - Copyright © shadcn
License: MIT
https://github.com/shadcn-ui/ui

Paws Up uses shadcn/ui as its component foundation. Components are copied directly into the codebase and customized to fit the app's design language.

Radix UI - Copyright © WorkOS
License: MIT
https://github.com/radix-ui/primitives

Accessible, unstyled primitives used under the hood by shadcn/ui components including dialogs, dropdowns, tooltips, accordions, and more.

Tailwind CSS - Copyright © Tailwind Labs Inc.
License: MIT
https://github.com/tailwindlabs/tailwindcss

Utility-first CSS framework used for all layout, spacing, typography, and color styling throughout the app.

tailwind-merge - Copyright © Dany Castillo
License: MIT
https://github.com/nicolo-ribaudo/tailwind-merge

Utility for merging Tailwind class names without style conflicts.

class-variance-authority - Copyright © Joe Bell
License: Apache-2.0
https://github.com/joe-bell/cva

Used internally by shadcn/ui to define component variants in a type-safe way.

clsx - Copyright © Luke Edwards
License: MIT
https://github.com/lukeed/clsx

Lightweight utility for conditionally joining class names.

tailwindcss-animate - Copyright © Jamie Kyle
License: MIT
https://github.com/jamiebuilds/tailwindcss-animate

Tailwind plugin providing pre-built CSS animation utilities used for transitions and motion throughout the UI.

next-themes - Copyright © Pacocoursey
License: MIT
https://github.com/pacocoursey/next-themes

Provides seamless theme switching support (light/dark mode) for the application.`,
    },
    {
      title: "Icons",
      content: `Lucide React - Copyright © Lucide Contributors
License: ISC
https://github.com/lucide-icons/lucide

All icons used throughout Paws Up - paw prints, shields, arrows, and more - come from the Lucide icon library.`,
    },
    {
      title: "Backend & Authentication",
      content: `Supabase - Copyright © Supabase Inc.
License: Apache-2.0
https://github.com/supabase/supabase

Paws Up uses Supabase for user authentication, database storage, and real-time data. This includes @supabase/supabase-js and @supabase/auth-ui-react.`,
    },
    {
      title: "Data Fetching",
      content: `TanStack React Query - Copyright © TanStack
License: MIT
https://github.com/TanStack/query

Used for server-state management, caching, and data synchronization between the client and Supabase backend.`,
    },
    {
      title: "Notifications",
      content: `Sonner - Copyright © emilkowalski_
License: MIT
https://github.com/emilkowalski/sonner

Toast notification library used for feedback messages across the app (success, error, and informational alerts).`,
    },
    {
      title: "Build Tooling",
      content: `Vite - Copyright © Evan You and Vite Contributors
License: MIT
https://github.com/vitejs/vite

The build tool and development server powering Paws Up's fast hot-module replacement and optimized production builds.

@vitejs/plugin-react-swc - Copyright © Vite Contributors
License: MIT
https://github.com/vitejs/vite-plugin-react-swc

Vite plugin enabling fast React transforms using the SWC compiler.`,
    },
    {
      title: "Deployment",
      content: `Vercel - Copyright © Vercel Inc.
https://vercel.com

Paws Up is hosted and deployed on Vercel's platform. Serverless API functions are powered by @vercel/node.`,
    },
    {
      title: "License Summary",
      content: `All third-party libraries and tools listed above retain their respective copyrights and licenses. Paws Up makes no claim of ownership over these works. We are grateful to the open-source community for making projects like this possible.

If you believe any attribution is missing or incorrect, please open an issue on our GitHub repository or contact us directly through the app.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Accent top line */}
      <div className="h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 w-full" />

      {/* Navbar */}
      <nav
        className={`border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50 transition-all duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground tracking-tight">
              Paws Up
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Features
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full rounded-full" />
            </a>
            <a
              href="/#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              How it works
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full rounded-full" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-9 px-4 font-medium"
              >
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                size="sm"
                className="h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-sm"
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6 border border-primary/20">
            <Star className="w-4 h-4" />
            Legal
          </div>
          <h1 className="font-serif text-5xl font-bold text-foreground leading-[1.1] tracking-tight mb-4">
            Attributions
          </h1>
          <p className="text-muted-foreground">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-12">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Paws Up is built on the shoulders of a fantastic open-source
            ecosystem. This page credits the libraries, tools, and platforms
            that make the app possible. We're grateful to every maintainer and
            contributor behind these projects.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 rounded-xl border border-border bg-card p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Contents
          </p>
          <div className="grid sm:grid-cols-2 gap-1">
            {sections.map((section, index) => (
              <a
                key={index}
                href={`#section-${index}`}
                className="flex items-center gap-2 text-sm text-foreground/80 hover:text-primary transition-colors py-1.5"
              >
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                {section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <section
              key={index}
              id={`section-${index}`}
              className="scroll-mt-24"
            >
              <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                {section.title}
              </h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Bottom navigation */}
        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
          <Link
            to="/privacy"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            to="/terms"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Attributions;
