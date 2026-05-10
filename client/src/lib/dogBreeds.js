export const DOG_BREEDS = [
  { id: 'shiba',   name: 'Shiba',   description: 'Much Wow' },
  { id: 'bulldog', name: 'Bulldog', description: 'Tough Guy' },
  { id: 'husky',   name: 'Husky',   description: 'Fierce & Fluffy' },
  { id: 'corgi',   name: 'Corgi',   description: 'Tiny But Mighty' },
  { id: 'poodle',  name: 'Poodle',  description: 'Fabulous' },
];

// Returns the image path for a breed on a given side
export function getDogImage(dogType, side) {
  return `/images/${dogType}_${side}.png`;
}

// Returns the thumbnail (left-facing) for the lobby selector
export function getDogThumb(dogType) {
  return `/images/${dogType}_left.png`;
}

export function getDogById(id) {
  return DOG_BREEDS.find(d => d.id === id) || DOG_BREEDS[0];
}
