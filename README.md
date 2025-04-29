# ClimberzDay

🧗 _Explore Climbing Gyms!_

https://climberz.day

![Landing page](https://github.com/pmjuu/climbers/raw/main/readme-images/landing-page.jpg)

## Table of Contents

- [Features](#features)
  - [Explore Climbing gyms](#explore-climbing-gyms)
  - [Compare Routes with Google Maps](#compare-routes-with-google-maps)
  - [Find Climbing Partners](#find-climbing-partners)
- [Tech Stack](#tech-stack)

## Features

### Explore Climbing gyms

- **View Options:** Image Card / Map view

- **Filter Options:** City

- **Sort Options:**

  - name
  - distance: compare coordination using the [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula)
  - climbing surface area
  - price

- **Show Details**
  - Mobile: Tap to view details
  - Desktop: Hover to view details

### Compare Routes with Google Maps

![Google Map routes page](https://github.com/pmjuu/climbers/raw/main/readme-images/gmap-route-page.png)

- Select climbing gyms for destinations
- Check optimal routes to climbing gyms from your current location with various transportation options
- Edit the destinations or add other destinations

### Find Climbing Partners

#### Write a post

- Only a signed-in user can write a post to find climbing partners
- The post has a poster's username, climbing gym, time, and message
- Other users can request to join the climbing session by clicking the "Request to Join" button

#### Request to Join

- When a user requests to join, a post author will receive a notification email
- The post author can accept or decline the request

## Tech Stack

- [SvelteKit](https://svelte.dev)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Flowbite Svelte](https://flowbite-svelte.com/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
  - [Send Emails from Edge Functions using the Resend API](https://supabase.com/docs/guides/functions/examples/send-emails)
  - [PostgreSQL](https://www.postgresql.org/)
