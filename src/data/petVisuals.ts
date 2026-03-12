import petDog from '@/assets/pet-dog.png';
import petCat from '@/assets/pet-cat.png';
import petRabbit from '@/assets/pet-rabbit.png';
import petHamster from '@/assets/pet-hamster.png';
import { Species, PetColor } from '@/types/game';

export const PET_IMAGES: Record<Species, string> = {
  dog: petDog,
  cat: petCat,
  rabbit: petRabbit,
  hamster: petHamster,
};

export const PET_COLOR_FILTERS: Record<PetColor, string> = {
  blue: 'sepia(0.4) saturate(1.8) brightness(0.85) hue-rotate(170deg)',
  green: 'sepia(0.4) saturate(1.5) brightness(0.82) hue-rotate(80deg)',
  brown: 'sepia(0.7) saturate(1.5) brightness(0.6)',
  gray: 'saturate(0.05) brightness(0.78)',
  pink: 'sepia(0.3) saturate(2) brightness(0.95) hue-rotate(310deg)',
  purple: 'sepia(0.4) saturate(1.8) brightness(0.8) hue-rotate(250deg)',
  peach: 'sepia(0.3) saturate(1.2) brightness(1.0) hue-rotate(340deg)',
  white: '',
  yellow: 'sepia(0.5) saturate(2.5) brightness(1.0) hue-rotate(15deg)',
  teal: 'sepia(0.3) saturate(1.8) brightness(0.85) hue-rotate(130deg)',
  golden: 'sepia(0.5) saturate(1.4) brightness(0.92)',
  cream: 'sepia(0.15) saturate(0.9) brightness(1.02)',
};
