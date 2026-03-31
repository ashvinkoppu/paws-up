/**
 * PetCreationWizard — a full-screen onboarding flow for creating a new pet.
 *
 * Redesigned to match the landing page and auth pages design system:
 * semantic color tokens, consistent navbar, warm parchment palette,
 * and a clean two-column layout with a prominent step stepper.
 */
import React, { useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import { initialState } from "@/context/game/types";
import { ACHIEVEMENT_REWARD } from "@/context/game/helpers";
import {
  Species,
  Personality,
  PetColor,
  PetGender,
  GENDER_COLORS,
} from "@/types/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Heart,
  Leaf,
  Moon,
  Palette,
  PawPrint,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

import petDog from "@/assets/pet-dog.png";
import petCat from "@/assets/pet-cat.png";
import petRabbit from "@/assets/pet-rabbit.png";
import petHamster from "@/assets/pet-hamster.png";

// ── Data ──────────────────────────────────────────────────────────────────────

const SPECIES_DATA: Record<
  Species,
  {
    name: string;
    image: string;
    description: string;
    badge: string;
    traits: string[];
  }
> = {
  dog: {
    name: "Dog",
    image: petDog,
    description: "A loyal, upbeat companion that feels energetic from day one.",
    badge: "Active",
    traits: ["Play-focused", "Warm energy"],
  },
  cat: {
    name: "Cat",
    image: petCat,
    description: "Independent, elegant, and easy to read at a glance.",
    badge: "Balanced",
    traits: ["Graceful", "Confident personality"],
  },
  rabbit: {
    name: "Rabbit",
    image: petRabbit,
    description: "A gentle pet with a soft, calm presence and cozy appeal.",
    badge: "Gentle",
    traits: ["Calming vibe", "Soft routine"],
  },
  hamster: {
    name: "Hamster",
    image: petHamster,
    description: "Small, bright, and energetic with a playful starter feel.",
    badge: "Compact",
    traits: ["High charm", "Quick bursts of fun"],
  },
};

const PERSONALITIES: Array<{
  type: Personality;
  name: string;
  description: string;
  icon: typeof PawPrint;
  bestFor: string;
}> = [
  {
    type: "playful",
    name: "Playful",
    description: "Loses energy faster, gains happiness easier.",
    icon: Zap,
    bestFor: "Players who want frequent, upbeat interactions.",
  },
  {
    type: "calm",
    name: "Calm",
    description: "Gets hungry slower and loses energy slower.",
    icon: Leaf,
    bestFor: "A steadier rhythm with less pressure.",
  },
  {
    type: "curious",
    name: "Curious",
    description: "Needs more stimulation and gets dirty faster.",
    icon: Search,
    bestFor: "A more active, higher-attention care style.",
  },
  {
    type: "lazy",
    name: "Lazy",
    description: "Regains energy faster and gets hungry slower.",
    icon: Moon,
    bestFor: "A lower-maintenance daily routine.",
  },
];

const GENDERS: Array<{
  type: PetGender;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    type: "male",
    label: "Male",
    icon: "♂",
    description: "Blues, greens & grays.",
  },
  {
    type: "female",
    label: "Female",
    icon: "♀",
    description: "Pinks, purples & peach.",
  },
  {
    type: "neutral",
    label: "Neutral",
    icon: "⚧",
    description: "Yellows, teals & cream.",
  },
];

const STEP_CONFIG: Array<{
  title: string;
  description: string;
  icon: typeof PawPrint;
}> = [
  {
    title: "Choose a pet",
    description: "Start with the companion that fits the tone you want.",
    icon: PawPrint,
  },
  {
    title: "Name your companion",
    description: "Pick a name you will see across your dashboard and care log.",
    icon: Heart,
  },
  {
    title: "Style the look",
    description: "Set the palette and presentation before adoption.",
    icon: Palette,
  },
  {
    title: "Set the personality",
    description: "Your final choice shapes the day-to-day feel of care.",
    icon: Sparkles,
  },
];

const NAME_SUGGESTIONS: Record<Species, string[]> = {
  dog: ["Milo", "Scout", "Cooper", "Archie"],
  cat: ["Luna", "Mochi", "Olive", "Cleo"],
  rabbit: ["Poppy", "Clover", "Hazel", "Maple"],
  hamster: ["Pip", "Biscuit", "Nibbles", "Bean"],
};

const STARTER_DETAILS = [
  {
    icon: Wallet,
    label: "Opening funds",
    value: `$${(initialState.money + ACHIEVEMENT_REWARD).toFixed(0)}`,
  },
  {
    icon: ShieldCheck,
    label: "Weekly budget",
    value: `$${initialState.weeklyBudget}`,
  },
  {
    icon: Clock3,
    label: "Daily actions",
    value: `${initialState.dailyActionsMax}`,
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

interface PetPreviewFigureProps {
  species: Species | null;
  colorHex: string;
  petName: string;
  jumpingSpecies: Species | null;
  showColor?: boolean;
}

const PetPreviewFigure: React.FC<PetPreviewFigureProps> = ({
  species,
  colorHex,
  petName,
  jumpingSpecies,
  showColor = false,
}) => (
  <div className="relative mx-auto w-full max-w-[260px]">
    <div className="absolute inset-6 rounded-full bg-primary/10 blur-3xl" />
    <div className="relative aspect-square rounded-[2rem] border border-border bg-card p-5 shadow-lg">
      <div className="relative flex h-full flex-col items-center justify-center gap-4 rounded-[1.5rem] bg-background/40 backdrop-blur-sm">
        {species ? (
          <>
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-border/60 bg-accent/40 shadow-inner">
              <img
                src={SPECIES_DATA[species].image}
                alt={SPECIES_DATA[species].name}
                className={cn(
                  "relative z-10 h-24 w-24 object-contain transition-transform duration-300",
                  jumpingSpecies === species && "animate-happy-jump",
                )}
              />
              {showColor && (
                <div
                  className="absolute inset-0 z-20 rounded-full transition-all duration-300 pointer-events-none"
                  style={{
                    backgroundColor: colorHex,
                    mixBlendMode: "color",
                    opacity: 0.78,
                    WebkitMaskImage: `url(${SPECIES_DATA[species].image})`,
                    WebkitMaskSize: "88px",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskImage: `url(${SPECIES_DATA[species].image})`,
                    maskSize: "88px",
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                  }}
                />
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Live preview
              </p>
              <h3 className="mt-2 font-serif text-3xl font-semibold text-foreground">
                {petName.trim() || "Your pet"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {SPECIES_DATA[species].name} · Baby stage
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-36 w-36 items-center justify-center rounded-full border border-dashed border-border bg-card/75">
              <PawPrint className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Live preview
              </p>
              <h3 className="mt-2 font-serif text-3xl font-semibold text-foreground">
                Choose a pet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Updates as you make selections.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

interface PetCreationWizardProps {
  onComplete?: () => void;
}

const PetCreationWizard: React.FC<PetCreationWizardProps> = ({
  onComplete,
}) => {
  const { createPet } = useGame();
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [petName, setPetName] = useState("");
  const [selectedGender, setSelectedGender] = useState<PetGender>("male");
  const [selectedColor, setSelectedColor] = useState<PetColor>("blue");
  const [selectedPersonality, setSelectedPersonality] =
    useState<Personality | null>(null);
  const [nameError, setNameError] = useState("");
  const [jumpingSpecies, setJumpingSpecies] = useState<Species | null>(null);

  useEffect(() => {
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    const timer = window.setTimeout(() => setMounted(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!jumpingSpecies) return undefined;
    const timer = window.setTimeout(() => setJumpingSpecies(null), 900);
    return () => window.clearTimeout(timer);
  }, [jumpingSpecies]);

  const selectedSpeciesData = selectedSpecies
    ? SPECIES_DATA[selectedSpecies]
    : null;
  const currentPalette = GENDER_COLORS[selectedGender];
  const currentColorHex =
    currentPalette.find((colorOption) => colorOption.color === selectedColor)
      ?.hex ?? currentPalette[0].hex;
  const stepConfig = STEP_CONFIG[step - 1];
  const StepIcon = stepConfig.icon;
  const showBackButton = step > 1 || Boolean(onComplete);

  const revealStyle = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0px)" : "translateY(20px)",
    transition: `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
  });

  const validateName = (value: string): boolean => {
    const trimmedValue = value.trim();

    if (trimmedValue.length < 2) {
      setNameError("Name must be at least 2 characters.");
      return false;
    }

    if (trimmedValue.length > 20) {
      setNameError("Name must be 20 characters or fewer.");
      return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(trimmedValue)) {
      setNameError("Name can only include letters and spaces.");
      return false;
    }

    setNameError("");
    return true;
  };

  const handleSpeciesClick = (species: Species) => {
    setSelectedSpecies(species);
    setJumpingSpecies(null);
    window.requestAnimationFrame(() => setJumpingSpecies(species));
  };

  const handleGenderChange = (gender: PetGender) => {
    setSelectedGender(gender);
    setSelectedColor(GENDER_COLORS[gender][0].color);
  };

  const handleBack = () => {
    if (step === 1) {
      onComplete?.();
      return;
    }
    setStep((currentStep) => currentStep - 1);
  };

  const handleNext = () => {
    if (step === 2 && !validateName(petName)) {
      return;
    }
    setStep((currentStep) => currentStep + 1);
  };

  const handleCreate = () => {
    if (!selectedSpecies || !selectedPersonality || !validateName(petName)) {
      return;
    }

    createPet({
      name: petName.trim(),
      species: selectedSpecies,
      gender: selectedGender,
      color: selectedColor,
      personality: selectedPersonality,
      stage: "baby",
    });
    onComplete?.();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Accent top line — matches landing page and auth pages */}
      <div className="h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 w-full" />

      {/* Navbar — matches Login and Signup pages exactly */}
      <nav
        className={`border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50 transition-all duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground tracking-tight">
              Paws Up
            </span>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur md:flex">
            <CheckCircle2 className="h-4 w-4 text-secondary" />
            Create your first companion
          </div>
        </div>
      </nav>

      {/* Background decoration — matches landing page and auth pages */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[700px] h-[600px] bg-primary/[0.06] rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-secondary/[0.05] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      {/* Page content */}
      <div
        className="relative z-10 mx-auto max-w-7xl px-6 py-8 lg:py-10"
        style={revealStyle(0.02)}
      >
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
          {/* ── Left sidebar: live preview ─────────────────────────────── */}
          <aside
            className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-[0_28px_120px_-48px_hsl(var(--primary)/0.18)] backdrop-blur lg:sticky lg:top-[5.5rem] lg:self-start"
            style={revealStyle(0.1)}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Pet onboarding
            </div>

            {/* Live preview figure */}
            <PetPreviewFigure
              species={selectedSpecies}
              colorHex={currentColorHex}
              petName={petName}
              jumpingSpecies={jumpingSpecies}
              showColor={step >= 3}
            />

            {/* Current profile summary */}
            <div className="mt-5 rounded-[1.5rem] border border-border bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground mb-3">
                Current profile
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Species",
                    value: selectedSpeciesData?.name ?? "Not selected",
                  },
                  { label: "Name", value: petName.trim() || "Unnamed" },
                  {
                    label: "Style",
                    value:
                      currentPalette.find(
                        (entry) => entry.color === selectedColor,
                      )?.name ?? "Blue",
                  },
                  {
                    label: "Personality",
                    value: selectedPersonality
                      ? (PERSONALITIES.find(
                          (entry) => entry.type === selectedPersonality,
                        )?.name ?? "Selected")
                      : "Not selected",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/60 bg-card px-3 py-2.5"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Starter details — compact */}
            <div className="mt-4 space-y-2">
              {STARTER_DETAILS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="flex-1 text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <span className="text-sm font-bold text-primary shrink-0">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* ── Right panel: step content ──────────────────────────────── */}
          <main
            className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-[0_28px_100px_-50px_hsl(var(--primary)/0.18)] backdrop-blur md:p-8"
            style={revealStyle(0.18)}
          >
            {/* Step progress stepper */}
            <div className="mb-8">
              <div className="flex items-center">
                {STEP_CONFIG.map((config, index) => {
                  const Icon = config.icon;
                  const isActive = step === index + 1;
                  const isComplete = step > index + 1;

                  return (
                    <React.Fragment key={config.title}>
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                          isActive
                            ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15"
                            : isComplete
                              ? "border-secondary bg-secondary text-secondary-foreground"
                              : "border-border bg-card text-muted-foreground",
                        )}
                      >
                        {isComplete ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      {index < STEP_CONFIG.length - 1 && (
                        <div
                          className={cn(
                            "h-0.5 flex-1 mx-2 rounded-full transition-all duration-500",
                            isComplete ? "bg-secondary" : "bg-border",
                          )}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Step header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/60 px-4 py-2 text-sm font-medium text-accent-foreground mb-4">
                <StepIcon className="h-4 w-4 text-primary" />
                Step {step} of {STEP_CONFIG.length}
              </div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground">
                {stepConfig.title}
              </h2>
              <p className="mt-2 text-base leading-7 text-muted-foreground">
                {stepConfig.description}
              </p>
            </div>

            {/* ── Step 1: Choose a pet ── */}
            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                {(
                  Object.entries(SPECIES_DATA) as Array<
                    [Species, (typeof SPECIES_DATA)[Species]]
                  >
                ).map(([species, data], index) => (
                  <button
                    key={species}
                    onClick={() => handleSpeciesClick(species)}
                    className={cn(
                      "group relative overflow-hidden rounded-[1.6rem] border p-5 text-left transition-all duration-300 animate-fade-in-up opacity-0",
                      selectedSpecies === species
                        ? "border-primary/40 bg-primary/10 shadow-[0_22px_60px_-34px_hsl(var(--primary)/0.5)]"
                        : "border-border bg-background hover:-translate-y-1 hover:border-primary/20 hover:bg-card",
                    )}
                    style={{
                      animationDelay: `${index * 0.08}s`,
                      animationFillMode: "forwards",
                    }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)/0.06),transparent_50%,hsl(var(--secondary)/0.06))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {data.badge}
                        </div>
                        {selectedSpecies === species && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      <div className="mt-5 grid items-center gap-4 sm:grid-cols-[96px_minmax(0,1fr)]">
                        <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-border bg-card">
                          <img
                            src={data.image}
                            alt={data.name}
                            className="h-16 w-16 object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-serif text-2xl font-semibold text-foreground">
                            {data.name}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {data.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {data.traits.map((trait) => (
                          <span
                            key={trait}
                            className="rounded-full border border-border/80 bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ── Step 2: Name your companion ── */}
            {step === 2 && (
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="rounded-[1.6rem] border border-border bg-background/70 p-6">
                  <label
                    htmlFor="pet-name"
                    className="text-sm font-semibold text-foreground"
                  >
                    Pet name
                  </label>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Keep it short, memorable, and easy to spot in care logs and
                    budget entries.
                  </p>

                  <div className="mt-5">
                    <Input
                      id="pet-name"
                      value={petName}
                      onChange={(event) => {
                        setPetName(event.target.value);
                        if (nameError) {
                          validateName(event.target.value);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && validateName(petName)) {
                          handleNext();
                        }
                      }}
                      placeholder="Enter your pet's name"
                      maxLength={20}
                      aria-invalid={!!nameError}
                      className={cn(
                        "mt-3 h-14 rounded-2xl border-2 bg-card px-5 text-lg shadow-sm transition-colors",
                        nameError
                          ? "border-destructive focus-visible:ring-destructive/20"
                          : "border-border focus-visible:border-primary",
                      )}
                    />
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span
                        className={cn(
                          nameError
                            ? "text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        {nameError ||
                          "2 character minimum · Letters and spaces only."}
                      </span>
                      <span className="text-muted-foreground">
                        {petName.trim().length}/20
                      </span>
                    </div>
                  </div>

                  {selectedSpecies && (
                    <div className="mt-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Suggested names
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {NAME_SUGGESTIONS[selectedSpecies].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              setPetName(suggestion);
                              setNameError("");
                            }}
                            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/25 hover:text-foreground"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-[1.6rem] border border-border bg-card p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Name preview
                  </p>
                  <div className="mt-5 rounded-[1.4rem] border border-border bg-background/70 p-5">
                    <p className="text-sm text-muted-foreground">
                      Your new companion will appear as
                    </p>
                    <h3 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground">
                      {petName.trim() || "Your pet"}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      The name is used across the dashboard, care updates, and
                      spending history.
                    </p>
                  </div>

                  {selectedSpeciesData && (
                    <div className="mt-4 rounded-[1.4rem] border border-border bg-background/50 p-4">
                      <p className="text-sm font-semibold text-foreground">
                        Pairing with your{" "}
                        {selectedSpeciesData.name.toLowerCase()}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {selectedSpeciesData.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 3: Style the look ── */}
            {step === 3 && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Select a palette family
                    </p>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {GENDERS.map((gender, index) => (
                        <button
                          key={gender.type}
                          onClick={() => handleGenderChange(gender.type)}
                          className={cn(
                            "rounded-[1.5rem] border p-4 text-left transition-all duration-300 animate-fade-in-up opacity-0",
                            selectedGender === gender.type
                              ? "border-primary/35 bg-primary/10 shadow-sm"
                              : "border-border bg-card shadow-sm hover:border-primary/20",
                          )}
                          style={{
                            animationDelay: `${index * 0.08}s`,
                            animationFillMode: "forwards",
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg text-foreground/80">
                              {gender.icon}
                            </span>
                            <div>
                              <p className="text-base font-semibold text-foreground">
                                {gender.label}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {gender.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Choose the final coat color
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {currentPalette.map((colorOption, index) => (
                        <button
                          key={colorOption.color}
                          onClick={() => setSelectedColor(colorOption.color)}
                          className={cn(
                            "flex items-center gap-4 rounded-[1.4rem] border p-4 text-left transition-all duration-300 animate-fade-in-up opacity-0",
                            selectedColor === colorOption.color
                              ? "border-primary/35 bg-primary/10 shadow-sm"
                              : "border-border bg-card hover:border-primary/20",
                          )}
                          style={{
                            animationDelay: `${index * 0.06}s`,
                            animationFillMode: "forwards",
                          }}
                        >
                          <div
                            className={cn(
                              "h-12 w-12 shrink-0 rounded-2xl border-4 transition-transform duration-300",
                              selectedColor === colorOption.color
                                ? "border-card shadow-[0_12px_30px_-12px_rgba(0,0,0,0.4)]"
                                : "border-border/40",
                            )}
                            style={{ backgroundColor: colorOption.hex }}
                          />
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-foreground">
                              {colorOption.name}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {selectedGender} palette
                            </p>
                          </div>
                          {selectedColor === colorOption.color && (
                            <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-border bg-background/70 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Style preview
                  </p>
                  <div className="mt-5">
                    <PetPreviewFigure
                      species={selectedSpecies}
                      colorHex={currentColorHex}
                      petName={petName}
                      jumpingSpecies={jumpingSpecies}
                      showColor
                    />
                  </div>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Gender
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {
                          GENDERS.find((entry) => entry.type === selectedGender)
                            ?.label
                        }
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Color
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {
                          currentPalette.find(
                            (entry) => entry.color === selectedColor,
                          )?.name
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Set the personality ── */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {PERSONALITIES.map((personality, index) => (
                    <button
                      key={personality.type}
                      onClick={() => setSelectedPersonality(personality.type)}
                      className={cn(
                        "rounded-[1.6rem] border p-5 text-left transition-all duration-300 animate-fade-in-up opacity-0",
                        selectedPersonality === personality.type
                          ? "border-primary/35 bg-primary/10 shadow-[0_22px_60px_-34px_hsl(var(--primary)/0.5)]"
                          : "border-border bg-background hover:-translate-y-1 hover:border-primary/20 hover:bg-card",
                      )}
                      style={{
                        animationDelay: `${index * 0.08}s`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <personality.icon className="h-8 w-8 text-foreground" />
                        {selectedPersonality === personality.type && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <h3 className="mt-4 font-serif text-2xl font-semibold text-foreground">
                        {personality.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {personality.description}
                      </p>
                      <div className="mt-4 rounded-2xl border border-border/60 bg-card px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          Best for
                        </p>
                        <p className="mt-2 text-sm leading-6 text-foreground/80">
                          {personality.bestFor}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="rounded-[1.6rem] border border-border bg-background/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Adoption summary
                  </p>
                  <p className="mt-3 text-lg leading-8 text-foreground/80">
                    {petName.trim() || "Your pet"} will join as a{" "}
                    <span className="font-semibold text-foreground">
                      {selectedPersonality
                        ? (PERSONALITIES.find(
                            (entry) => entry.type === selectedPersonality,
                          )?.name.toLowerCase() ?? "new")
                        : "new"}
                    </span>{" "}
                    {selectedSpeciesData
                      ? selectedSpeciesData.name.toLowerCase()
                      : "companion"}{" "}
                    with a{" "}
                    <span className="font-semibold text-foreground">
                      {currentPalette
                        .find((entry) => entry.color === selectedColor)
                        ?.name.toLowerCase() ?? "blue"}
                    </span>{" "}
                    finish.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation footer */}
            <div className="mt-8 border-t border-border pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {step >= STEP_CONFIG.length && (
                  <p className="text-sm leading-6 text-muted-foreground">
                    Review the profile on the left, then adopt when everything
                    feels right.
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  {showBackButton && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="rounded-xl border-border bg-card px-5"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  )}

                  {step < STEP_CONFIG.length ? (
                    <Button
                      onClick={handleNext}
                      disabled={
                        (step === 1 && !selectedSpecies) ||
                        (step === 2 && petName.trim().length < 2)
                      }
                      className="rounded-xl bg-primary px-6 text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreate}
                      disabled={!selectedPersonality}
                      className="rounded-xl bg-secondary px-6 text-secondary-foreground shadow-sm hover:bg-secondary/90"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Adopt {petName.trim() || "your pet"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PetCreationWizard;
