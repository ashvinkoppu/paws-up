import React, { useState, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { Species, Personality, PetColor, PetGender, GrowthStage, GENDER_COLORS } from '@/types/game';
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

const GENDERS: { type: PetGender; label: string; icon: string; description: string }[] = [
  { type: 'male', label: 'Male', icon: '♂', description: 'Blue, green, brown & gray' },
  { type: 'female', label: 'Female', icon: '♀', description: 'Pink, purple, peach & white' },
  { type: 'neutral', label: 'Neutral', icon: '⚧', description: 'Yellow, teal, golden & cream' },
];

const STEP_CONFIG = [
  { title: 'Choose Your Pet', description: 'Who will be your new companion?', icon: PawPrint },
  { title: 'Name Your Friend', description: 'Give your pet a special name', icon: Heart },
  { title: 'Style Your Pet', description: 'Choose gender and color theme', icon: Palette },
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
  const [selectedGender, setSelectedGender] = useState<PetGender>('male');
  const [selectedColor, setSelectedColor] = useState<PetColor>('blue');
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null);
  const [nameError, setNameError] = useState('');
  const [jumpingSpecies, setJumpingSpecies] = useState<Species | null>(null);

  const handleSpeciesClick = useCallback((species: Species) => {
    setSelectedSpecies(species);
    setJumpingSpecies(null);
    requestAnimationFrame(() => {
      setJumpingSpecies(species);
    });
  }, []);

  const handleGenderChange = (gender: PetGender) => {
    setSelectedGender(gender);
    const palette = GENDER_COLORS[gender];
    setSelectedColor(palette[0].color);
  };

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
    if (step === 1) {
      onComplete();
    } else {
      setStep(step - 1);
    }
  };

  const handleCreate = () => {
    if (!selectedSpecies || !selectedPersonality) return;

    createPet({
      name: petName.trim(),
      species: selectedSpecies,
      gender: selectedGender,
      color: selectedColor,
      personality: selectedPersonality,
      stage: 'baby' as GrowthStage,
    });
    onComplete();
  };

  const currentStepConfig = STEP_CONFIG[step - 1];
  const StepIcon = currentStepConfig.icon;
  const currentPalette = GENDER_COLORS[selectedGender];
  const currentColorHex = currentPalette.find(color => color.color === selectedColor)?.hex ?? currentPalette[0].hex;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 paper-texture relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-primary/7 to-transparent blur-3xl animate-breathe" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-secondary/7 to-transparent blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[10%] right-[20%] w-2 h-2 rounded-full bg-chart-3/30 animate-sparkle" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-[30%] left-[15%] w-2.5 h-2.5 rounded-full bg-primary/25 animate-sparkle" style={{ animationDelay: '1.5s' }} />
      </div>

      <Card className="w-full max-w-2xl shadow-2xl border border-border/40 rounded-3xl glass-card animate-fade-in-up relative">
        <CardHeader className="text-center pb-4">
          {/* Progress indicators - connected dots */}
          <div className="flex justify-center items-center gap-1.5 mb-6">
            {[1, 2, 3, 4].map((stepNumber, index) => (
              <React.Fragment key={stepNumber}>
                <div
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-400",
                    stepNumber === step
                      ? "bg-primary scale-125 shadow-md shadow-primary/30 ring-4 ring-primary/15"
                      : stepNumber < step
                      ? "bg-secondary shadow-sm"
                      : "bg-border/60"
                  )}
                />
                {index < 3 && (
                  <div className={cn(
                    "w-8 h-0.5 rounded-full transition-all duration-400",
                    stepNumber < step ? "bg-secondary/40" : "bg-border/30"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step header */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/40 backdrop-blur-sm rounded-full mb-4 border border-accent-foreground/5">
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
                  onClick={() => handleSpeciesClick(species)}
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
                        jumpingSpecies === species && "animate-happy-jump"
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
                    "focus-visible:ring-0 focus-visible:ring-offset-0",
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

          {/* Step 3: Gender + Color Selection (merged) */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Gender selection */}
              <div className="flex justify-center gap-3">
                {GENDERS.map((gender, index) => (
                  <button
                    key={gender.type}
                    onClick={() => handleGenderChange(gender.type)}
                    className={cn(
                      "px-5 py-3 rounded-2xl border-2 transition-all duration-300 text-center min-w-[120px]",
                      "animate-fade-in-up opacity-0",
                      selectedGender === gender.type
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border/50 hover:border-primary/40 bg-card"
                    )}
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                  >
                    <div className="text-2xl mb-1">{gender.icon}</div>
                    <div className="font-serif font-semibold text-sm text-foreground">{gender.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{gender.description}</div>
                  </button>
                ))}
              </div>

              {/* Pet preview with color */}
              <div className="flex justify-center">
                {selectedSpecies && (
                  <div
                    className="w-36 h-36 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 border-4 border-border/30 relative overflow-hidden"
                    style={{ backgroundColor: '#F5F0EB' }}
                  >
                    <div className="relative w-28 h-28">
                      <img
                        src={SPECIES_DATA[selectedSpecies].image}
                        alt="Your pet"
                        className="w-28 h-28 object-contain relative"
                      />
                      <div
                        className="absolute inset-0 transition-all duration-300 pointer-events-none"
                        style={{
                          backgroundColor: currentColorHex,
                          mixBlendMode: 'color',
                          opacity: 0.75,
                          WebkitMaskImage: `url(${SPECIES_DATA[selectedSpecies].image})`,
                          WebkitMaskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                          maskImage: `url(${SPECIES_DATA[selectedSpecies].image})`,
                          maskSize: 'contain',
                          maskRepeat: 'no-repeat',
                          maskPosition: 'center',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Color palette (dynamic based on gender) */}
              <div className="flex flex-wrap justify-center gap-4">
                {currentPalette.map((colorOption, index) => (
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
                Selected: <span className="font-semibold text-foreground">{currentPalette.find(color => color.color === selectedColor)?.name}</span>
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
              className="rounded-xl border-2 border-border/50 px-6 btn-press hover:border-border"
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
                className="rounded-xl px-6 bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg btn-press transition-all duration-200"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={!selectedPersonality}
                className="rounded-xl px-8 bg-gradient-to-r from-secondary to-secondary/85 hover:from-secondary/90 hover:to-secondary/80 text-secondary-foreground shadow-md hover:shadow-lg btn-press transition-all duration-200"
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
