# Cluckwork 

Build a mobile-first PWA called "Hatch & Flock" for backyard poultry

keepers who incubate their own eggs.



MVP SCREENS:

1. Home dashboard: today's tasks (candle, turn check, lockdown, hatch

   due), active batches, quick-add buttons.

2. New batch: choose incubator (user can add several, with capacity),

   set date eggs were set, add eggs with breed, source/breeder, and a

   label code. Allow "breed uncertain" status.

3. Auto-calendar: from set date, calculate candling days (7 and 14),

   lockdown (day 18) and hatch (day 21), with push reminders.

4. Egg grid per batch: tap each egg to mark developing / clear /

   quit / hatched, and edit breed once chicks hatch.

5. Hatch results: hatch rate per batch, breed and source.

6. Flock register: bird profiles with photo, breed, hatch date,

   parents, notes.

7. Daily egg log: tap to record counts per hen or group.



DESIGN: warm, rural, simple. Cream and sage palette, large tap

targets, readable outdoors. Works offline with local storage and syncs

later.



TECH: React + Tailwind, local-first data (IndexedDB), PWA install,

notifications. Keep data models for Batch, Egg, Incubator, Bird.

Start with screens 1-4 only.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cluckwork.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4a9e63cc-e53d-424f-88c7-cf83cc4bb0a9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
