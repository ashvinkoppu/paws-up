import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Species, Personality, PetColor, GrowthStage } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Check, PawPrint, Palette, Sparkles, Heart } from 'lucide-react';

import petDog from '@/assets/pet-dog.png';
import petCat from '@/assets/pet-cat.png';
import petRabbit from '@/assets/pet-rabbit.png';
import petHamster from '@/assets/pet-hamster.png';

const SPECIES_DATA: Record<Species, { name: string; image: string; description: string }> = {
  dog: { name: 'Dog', image: petDog, description: 'Loyal and playful companion' },
  cat: { name: 'Cat', image: petCat, description: 'Independent and graceful friend' },
  rabbit: { name: 'Rabbit', image: petRabbit, description: 'Gentle and adorable buddy' },
  hamster: { name: 'Hamster', image: petHamster, description: 'Tiny and energetic pal' },
};

const PERSONALITIES: { type: Personality; name: string; description: string; icon: string }[] = [
  { type: 'playful', name: 'Playful', description: 'Loses energy faster, gains happiness easier', icon: '🎾' },
  { type: 'calm', name: 'Calm', description: 'Gets hungry slower, loses energy slower', icon: '😌' },
  { type: 'curious', name: 'Curious', description: 'Needs more stimulation, gets dirty faster', icon: '🔍' },
  { type: 'lazy', name: 'Lazy', description: 'Regains energy faster, gets hungry slower', icon: '😴' },
];

const COLORS: { color: PetColor; name: string; hex: string }[] = [
  { color: 'golden', name: 'Golden', hex: '#D4A574' },
  { color: 'cream', name: 'Cream', hex: '#F5E6D3' },
  { color: 'gray', name: 'Gray', hex: '#8B9A8E' },
  { color: 'brown', name: 'Brown', hex: '#8B6F5C' },
  { color: 'white', name: 'White', hex: '#FAF8F5' },
  { color: 'black', name: 'Black', hex: '#3D3D3D' },
  { color: 'orange', name: 'Orange', hex: '#D4845C' },
];

const STEP_CONFIG = [
  { title: 'Choose Your Pet', description: 'Who will be your new companion?', icon: PawPrint },
  { title: 'Name Your Friend', description: 'Give your pet a special name', icon: Heart },
  { title: 'Pick a Color', description: 'What color suits them best?', icon: Palette },
  { title: 'Select Personality', description: 'Each personality affects behavior', icon: Sparkles },
];

interface PetCreationWizardProps {
  onComplete: () => void;
}

const PetCreationWizard: React.FC<PetCreationWizardProps> = ({ onComplete }) => {
  const { createPet } = useGame();
  const [step, setStep] = useState(1);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [petName, setPetName] = useState('');
  const [selectedColor, setSelectedColor] = useState<PetColor>('golden');
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null);
  const [nameError, setNameError] = useState('');

  const validateName = (name: string): boolean => {
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    if (name.trim().length > 20) {
      setNameError('Name must be less than 20 characters');
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      setNameError('Name can only contain letters and spaces');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleNext = () => {
    if (step === 2 && !validateName(petName)) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCreate = () => {
    if (!selectedSpecies || !selectedPersonality) return;

    createPet({
      name: petName.trim(),
      species: selectedSpecies,
      color: selectedColor,
      personality: selectedPersonality,
      stage: 'baby' as GrowthStage,
    });
    onComplete();
  };

  const currentStepConfig = STEP_CONFIG[step - 1];
  const StepIcon = currentStepConfig.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 paper-texture relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-primary/5 blob-shape animate-breathe" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[45vw] h-[45vw] bg-secondary/5 blob-shape animate-breathe" style={{ animationDelay: '2s' }} />

      <Card className="w-full max-w-2xl shadow-2xl border-2 border-border/50 rounded-3xl bg-card/95 backdrop-blur-sm animate-fade-in-up relative">
        <CardHeader className="text-center pb-4">
          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  stepNumber === step
                    ? "bg-primary scale-125 shadow-md"
                    : stepNumber < step
                    ? "bg-secondary"
                    : "bg-border"
                )}
              />
            ))}
          </div>

          {/* Step header */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-full mb-4">
            <StepIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-accent-foreground">Step {step} of 4</span>
          </div>

          <CardTitle className="text-3xl font-serif tracking-tight">
            {currentStepConfig.title}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {currentStepConfig.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {/* Step 1: Species Selection */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              {(Object.entries(SPECIES_DATA) as [Species, typeof SPECIES_DATA.dog][]).map(([species, data], index) => (
                <button
                  key={species}
                  onClick={() => setSelectedSpecies(species)}
                  className={cn(
                    "p-5 rounded-2xl border-2 transition-all duration-300",
                    "hover:scale-[1.02] animate-fade-in-up opacity-0",
                    selectedSpecies === species
                      ? "border-primary bg-primary/10 shadow-lg warm-glow"
                      : "border-border/50 hover:border-primary/40 bg-card"
                  )}
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  <div className="relative">
                    <img
                      src={data.image}
                      alt={data.name}
                      className={cn(
                        "w-24 h-24 mx-auto object-contain transition-transform duration-300",
                        selectedSpecies === species && "animate-float"
                      )}
                    />
                  </div>
                  <h3 className="font-serif font-semibold text-lg mt-3 text-foreground">{data.name}</h3>
                  <p className="text-sm text-muted-foreground">{data.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Name Input */}
          {step === 2 && (
            <div className="space-y-6">
              {selectedSpecies && (
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-breathe" />
                    <img
                      src={SPECIES_DATA[selectedSpecies].image}
                      alt="Your pet"
                      className="w-36 h-36 object-contain relative animate-float"
                    />
                  </div>
                </div>
              )}
              <div className="max-w-sm mx-auto space-y-3">
                <Input
                  value={petName}
                  onChange={(event) => {
                    setPetName(event.target.value);
                    if (nameError) validateName(event.target.value);
                  }}
                  placeholder="Enter pet name..."
                  className={cn(
                    "text-center text-xl h-14 rounded-xl border-2 bg-accent/30",
                    "focus:border-primary focus:bg-card transition-all duration-200",
                    nameError && "border-destructive"
                  )}
                  maxLength={20}
                />
                {nameError && (
                  <p className="text-destructive text-sm text-center">{nameError}</p>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  2-20 characters, letters and spaces only
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Color Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex justify-center">
                {selectedSpecies && (
                  <div
                    className="w-36 h-36 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 border-4 border-border/30"
                    style={{ backgroundColor: COLORS.find(color => color.color === selectedColor)?.hex }}
                  >
                    <img
                      src={SPECIES_DATA[selectedSpecies].image}
                      alt="Your pet"
                      className="w-28 h-28 object-contain"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {COLORS.map((colorOption, index) => (
                  <button
                    key={colorOption.color}
                    onClick={() => setSelectedColor(colorOption.color)}
                    className={cn(
                      "w-14 h-14 rounded-full border-4 transition-all duration-300",
                      "hover:scale-110 animate-fade-in-up opacity-0",
                      selectedColor === colorOption.color
                        ? "border-primary ring-4 ring-primary/30 scale-110"
                        : "border-border/30 hover:border-primary/50"
                    )}
                    style={{
                      backgroundColor: colorOption.hex,
                      animationDelay: `${index * 0.05}s`,
                      animationFillMode: 'forwards'
                    }}
                    title={colorOption.name}
                  />
                ))}
              </div>
              <p className="text-center text-muted-foreground">
                Selected: <span className="font-semibold text-foreground">{COLORS.find(color => color.color === selectedColor)?.name}</span>
              </p>
            </div>
          )}

          {/* Step 4: Personality Selection */}
          {step === 4 && (
            <div className="grid grid-cols-2 gap-4">
              {PERSONALITIES.map((personality, index) => (
                <button
                  key={personality.type}
                  onClick={() => setSelectedPersonality(personality.type)}
                  className={cn(
                    "p-5 rounded-2xl border-2 transition-all duration-300 text-left",
                    "hover:scale-[1.02] animate-fade-in-up opacity-0",
                    selectedPersonality === personality.type
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border/50 hover:border-primary/40 bg-card"
                  )}
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  <div className={cn(
                    "text-4xl mb-3 transition-transform duration-300",
                    selectedPersonality === personality.type && "animate-wiggle"
                  )}>
                    {personality.icon}
                  </div>
                  <h3 className="font-serif font-semibold text-lg text-foreground">{personality.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{personality.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className={cn(
                "rounded-xl border-2 px-6",
                step === 1 && "opacity-0"
              )}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !selectedSpecies) ||
                  (step === 2 && petName.trim().length < 2)
                }
                className="rounded-xl px-6 bg-primary hover:bg-primary/90"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={!selectedPersonality}
                className="rounded-xl px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <Check className="w-4 h-4 mr-2" />
                Adopt {petName || 'Pet'}!
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PetCreationWizard;
