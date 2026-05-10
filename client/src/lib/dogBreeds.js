export const DOG_BREEDS = [
  { id: 'husky', name: 'Husky', svg: '/assets/dog-husky.svg', description: 'Fierce & Fluffy' },
  { id: 'shiba', name: 'Shiba', svg: '/assets/dog-shiba.svg', description: 'Much Wow' },
  { id: 'bulldog', name: 'Bulldog', svg: '/assets/dog-bulldog.svg', description: 'Tough Guy' },
  { id: 'corgi', name: 'Corgi', svg: '/assets/dog-corgi.svg', description: 'Tiny But Mighty' },
  { id: 'poodle', name: 'Poodle', svg: '/assets/dog-poodle.svg', description: 'Fabulous' },
];

export function getDogById(id) {
  return DOG_BREEDS.find(d => d.id === id) || DOG_BREEDS[0];
}
