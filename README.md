# ClimberzDay

🧗 _Explore Climbing Gyms!_

https://climberz.day

![Landing page](https://github.com/pmjuu/climbers/raw/main/readme-images/landing-page.jpg)

## Table of Contents

- [Features](#features)
  - [Explore Climbing gyms](#explore-climbing-gyms)
  - [Compare Routes with Google Maps](#compare-routes-with-google-maps)
  - [Find Climbing Partners](#find-climbing-partners)
- [Challenges](#challenges)
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

## Challenges

### Ensuring Data Integrity in SvelteKit + Supabase

#### Synchronizing Soft Deletes of users and profiles

I use Supabase for authentication and data storage.

- The `auth.users` table manages user authentication, with a deleted_at column for soft deletion.
- The `public.profile` table stores user profiles, with a profile_id column referencing `auth.users.id` as a foreign key and its own deleted_at column.

When a user is soft-deleted (i.e., `auth.users.deleted_at` is set), I must update `public.profile.deleted_at` to maintain consistency.

Since Supabase’s client-side API doesn’t support multi-table transactions, I face a choice:

- **PostgreSQL Trigger:** Automatically sync `public.profile.deleted_at` when `auth.users.deleted_at` changes.
- **Client-Side Queries:** Issue separate queries from SvelteKit and implement rollback logic if one fails.

_"Should I handle data integrity in the database or the application layer?"_

I opted for **PostgreSQL triggers** for several reasons:

- Guaranteed Consistency: Triggers ensure `public.profile.deleted_at` is updated atomically with `auth.users.deleted_at`, critical for the foreign key relationship. Partial updates could orphan profiles, breaking the app.
- Simplified SvelteKit Code: Triggers reduce server and client code to a single query, keeping our codebase lean and focused on user interaction.
- Security: Triggers reduce the attack surface by moving sensitive data operations from application code to database rules, which are typically more hardened against security vulnerabilities.
- Supabase Best Practices: Supabase encourages PostgreSQL features like triggers for data integrity, especially for auth schema operations. ([Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data))
- Performance: Triggers require one client query, reducing latency.

While client-side queries offer easier debugging, database agnosticism, and ease of testing, the risk of data inconsistency and added complexity in the application layer outweigh these benefits for my use case.

Here’s the SQL to set up the function and trigger, run in Supabase’s SQL Editor:

```sql
-- Function to sync profile.deleted_at with auth.users.deleted_at
CREATE OR REPLACE FUNCTION public.sync_profile_deleted_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profile
  SET deleted_at = NEW.deleted_at
  WHERE profile_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to fire after auth.users.deleted_at updates
CREATE TRIGGER sync_profile_deleted_at_trigger
AFTER UPDATE OF deleted_at ON auth.users
FOR EACH ROW
WHEN (OLD.deleted_at IS DISTINCT FROM NEW.deleted_at)
EXECUTE FUNCTION public.sync_profile_deleted_at();
```

### Balancing ease of access for anonymous users with spam protection

Users can join one-day events without needing to log in, prioritizing a frictionless experience. However, this open access posed a challenge: preventing spam and duplicate registrations while keeping the process simple. I needed a lightweight solution to deter repeat submissions from anonymous users, all while complying with privacy regulations.

Among IP address tracking, email-based deduplication, client-side UUID, and CAPTCHA, I chose the **client-side UUID** approach. Here’s why:

- **Ease of Access**: UUIDs require no additional input, keeping registration seamless for anonymous users.
- **Simplicity**: The solution is lightweight, using `crypto.randomUUID()` and Supabase queries without complex dependencies.
- **PIPEDA Compliance**: I disclose UUID collection in privacy policy as a "temporary ID" stored for 7 days post-event, aligning with data minimization principles.
- **Trade-offs Accepted**: For a small-scale project, strict enforcement isn’t critical. I accept that users could bypass the system by clearing browser data, relying partly on user goodwill.

> 💡 **Is UUID the best method?**  
> While UUID is a lightweight deduplication method, it cannot be considered a highly reliable identifier. There are inherent limitations in preventing malicious repeat submissions while maintaining full anonymity.
> Alternatives like combining cookies with server-side sessions or using fingerprinting (e.g., canvas or audio fingerprinting) may offer better enforcement, but the latter raises significant privacy and compliance concerns under regulations like PIPEDA.
>
> Therefore, in the context of a small-scale, low-risk service, UUID remains a practical choice.

#### Implementation Highlights

- **UUID Generation and Storage**: In my SvelteKit app, I generate a UUID when a guest requests to join an event using `crypto.randomUUID()`. When a user submits request to join, I store it in `localStorage` as `climberzday_guest_uuid` and send it to database, where it’s stored in the `join_request` table’s `user_uuid` column, along with a `uuid_expiry` set to 7 days after the event date.
- **Duplicate Check**: I query the `join_request` table to check if the `user_uuid` already exists for the event’s `post_id`, disabling the “Request to Join” button if a match is found, displaying “Request sent”.

## Tech Stack

- [SvelteKit](https://svelte.dev)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Flowbite Svelte](https://flowbite-svelte.com/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
  - [Send Emails from Edge Functions using the Resend API](https://supabase.com/docs/guides/functions/examples/send-emails)
  - [PostgreSQL](https://www.postgresql.org/)
