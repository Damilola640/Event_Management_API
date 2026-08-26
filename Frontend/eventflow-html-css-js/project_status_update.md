# Project Status Update

## Overview

The frontend has been refactored from a monolithic structure toward the modular architecture described in `INTEGRATION_GUIDE.md`.

We have separated responsibilities across:

- `api/` for raw backend communication
- `services/` for shaping backend data into frontend-friendly models
- `utils/` for shared helpers
- `ui/` for reusable UI behavior and rendering
- `pages/` for page-specific controllers
- `main.js` for shared application bootstrap

This gives the project a much cleaner structure and makes future work easier to maintain.

## API Layer

The API layer remains focused on backend communication only:

- `js/api/client.js`
- `js/api/auth.api.js`
- `js/api/users.api.js`
- `js/api/events.api.js`

These files are responsible for sending requests, handling tokens, and exposing endpoint-specific calls.

## Services Added

### `js/services/auth.service.js`

This file now centralizes auth and current-user logic, including:

- login state checks
- session access
- current user loading
- profile updates
- organizer checks
- logout behavior

This avoids scattering auth/session logic across different pages.

### `js/services/event.service.js`

This file now provides the mapping layer recommended in the integration guide.

It translates backend event fields such as:

- `name`
- `max_attendees`
- `ticket_price`
- `categories`

into frontend-friendly fields such as:

- `title`
- `capacity`
- `ticketPrice`
- `category`
- `venueName`
- `registeredCount`

This protects the UI from backend serializer differences and keeps page code simpler.

## Utilities Added

### `js/utils/guards.js`

This file handles shared route and permission protection, including:

- `requireAuth()`
- `requireOrganizer()`
- redirect-to-login flow
- current user requirement flow

### `js/utils/formatters.js`

This file centralizes repeated presentation formatting, including:

- dates
- times
- prices
- venue names
- category names
- attendance summaries
- progress/fullness labels

This reduces repeated formatting logic across pages and UI components.

## UI Layer Added

### `js/ui/event-card.js`

Reusable event card rendering now lives here.

### `js/ui/navbar.js`

Navbar-specific behavior now lives here, including:

- signed-in navbar state
- profile link behavior
- logout CTA behavior
- mobile menu toggle
- scroll-state navbar styling

### `js/ui/site-ui.js`

Shared visual interactions now live here, including:

- custom cursor
- reveal animations
- counters
- smooth scrolling

Navbar logic was intentionally extracted out of this file to keep responsibilities clearer.

## Page Controllers Added

We now have page-specific controllers for major frontend views:

- `js/pages/home.js`
- `js/pages/auth.js`
- `js/pages/booking.js`
- `js/pages/create-event.js`
- `js/pages/profile.js`

Responsibilities:

- `home.js` loads and renders homepage events
- `auth.js` controls login/register behavior
- `booking.js` loads event details and handles event registration
- `create-event.js` protects organizer access and submits new events through the modular API/service flow
- `profile.js` protects the profile page, loads current user data, and handles profile updates

## Shared Bootstrap Added

### `js/main.js`

This file is now the shared frontend bootstrap.

It detects the current page and runs the appropriate controller:

- home
- auth
- booking
- create-event
- profile

We also removed duplicated page-level `DOMContentLoaded` bindings so initialization now flows through one central entry point.

## HTML Pages Updated

### Updated

- `index.html`
- `pages/auth.html`
- `pages/booking.html`
- `pages/profile.html`

### Added

- `pages/profile.html`
- `pages/create-event.html`

These pages now load the modular JS stack instead of depending on the older monolithic `js/eventflow.js` flow for current feature work.

## Navbar / Profile Flow Improvements

Signed-in navigation has been improved:

- homepage `Sign in` now becomes `My profile` when the user is logged in
- mobile auth link also becomes `My profile`
- primary CTA becomes `Log out`

This makes the new profile page easier to reach in the UI.

We also scoped navbar auth-state selectors carefully so they do not interfere with inner-page back links.

## Auth UI Redesign

The authentication page has been redesigned and merged into the real project flow.

Updated files:

- `pages/auth.html`
- `css/auth.css`
- `js/pages/auth.js`

Changes include:

- split-panel login/register layout
- animated switching between sign-in and sign-up
- improved visual polish
- mobile auth switching
- preserved integration with the real EventFlow auth API logic

The social login icons are currently placeholders only and are not connected to OAuth.

## Auth Flow Completion

The sign-in, sign-up, and password reset flow has been extended beyond the visual auth page.

Updated files:

- `pages/auth.html`
- `css/auth.css`
- `js/api/auth.api.js`
- `js/pages/auth.js`
- `index.html`
- `event_planner/users/serializers.py`
- `event_planner/users/views.py`
- `event_planner/users/urls.py`
- `event_planner/EventFlow/settings.py`

Changes include:

- added a visible desktop "Create an account" action inside the login form
- updated homepage "Get started" and trial CTAs to open `auth.html?tab=register`
- kept direct sign-in links pointed at the login panel
- added password reset request UI on the auth page
- added password reset confirmation UI for reset links containing `uid` and `token`
- added frontend API helpers for password reset request and confirmation
- added backend password reset request and confirmation endpoints
- used Django's built-in password reset token generator for secure reset links
- added `FRONTEND_PASSWORD_RESET_URL` setting with a local frontend default
- preserved generic reset-request responses so the API does not reveal whether an email exists

Password reset endpoints added:

- `POST /api/users/password-reset/`
- `POST /api/users/password-reset/confirm/`

## Filters and Search Integration

The integration guide's Step 5 has now been started on the homepage events list.

Updated files:

- `index.html`
- `css/components.css`
- `js/pages/home.js`
- `event_planner/events/urls.py`

Changes include:

- added a filter/search form above the homepage event cards
- added search, category, tag, city, state, start date, and end date controls
- wired the form into `event.service.js` through `listEvents(params)`
- preserved active filters in the browser URL query string
- hydrated the filter form from URL query params on page load
- added loading, empty, matching-count, and error messaging for filtered results
- loaded category and tag options from the backend taxonomy endpoints
- loaded venue cities/states into datalist suggestions for location filtering
- rendered the full returned API page of events instead of hard-limiting the homepage to three cards

This follows the guide's recommendation to collect filter form values, build query params, and pass those params through the existing API/service layers.

## Homepage Pagination / Load More

The homepage event listing now supports paginated loading through a "load more" flow.

Updated files:

- `index.html`
- `css/components.css`
- `js/pages/home.js`

Changes include:

- added a dedicated "Load more events" control below the homepage event grid
- kept pagination state in the homepage controller instead of scattering it across the page
- parsed the backend pagination `next` URL to request the correct next page
- appended additional events to the existing grid instead of replacing the visible results
- updated the results status text to reflect visible results versus total available results
- reset pagination cleanly whenever filters are applied or cleared
- automatically hid the load-more control once no more pages were available

This extends the guide's homepage events step with a frontend-friendly pagination experience while still relying on the existing paginated API response.

## Organizer Event Creation Scaffold

The next guide direction around organizer-only actions and event creation has now been started on the frontend.

Updated files:

- `pages/create-event.html`
- `css/auth.css`
- `js/pages/create-event.js`
- `js/api/events.api.js`
- `js/services/event.service.js`
- `js/main.js`
- `js/pages/profile.js`
- `pages/profile.html`
- `js/utils/guards.js`

Changes include:

- added a dedicated organizer-only event creation page on the modular frontend stack
- added a `createEvent()` API helper for `POST /api/events/`
- added a service-layer payload normalizer so event creation uses real backend serializer field names
- added taxonomy loading for venues, categories, and tags from existing backend endpoints
- added organizer route protection using `requireOrganizer()`
- exposed a `Create event` entry point from the profile page for organizer accounts
- wired the new page into `main.js` page detection and bootstrapping
- extended shared form styling to support the larger event builder form
- fixed guard dependency resolution so protected pages use `EventFlowAuthService` reliably at runtime

This gives the project its first organizer-only creation flow while staying within the integration guide's modular architecture.

## Backend Route Fix for Taxonomy Endpoints

The event URL patterns were adjusted so static collection endpoints are declared before the event slug catch-all route.

Why this mattered:

- `/api/events/categories/`
- `/api/events/tags/`
- `/api/events/venues/`

were at risk of being interpreted as event slugs because `<slug:slug>/` appeared too early in `events/urls.py`.

The static taxonomy/resource routes now resolve before:

- `/api/events/<slug>/`
- `/api/events/<slug>/register/`
- `/api/events/<slug>/invitations/`

Venue, speaker, and sponsor detail routes were also updated from integer path converters to UUID converters to match their model primary keys.

## Why This Refactor Matters

This work adds important value to the project:

- reduces duplication across the frontend
- makes backend/frontend integration safer through service mappers
- improves onboarding for new developers
- makes the codebase easier to extend
- supports future work on booking, profile editing, filters, organizer features, and dashboards
- reduces reliance on the older all-in-one frontend file

## Current State

The frontend is now much closer to the architecture described in `INTEGRATION_GUIDE.md`.

Completed direction:

- modular APIs
- services layer
- guards and formatters
- reusable UI modules
- modular page controllers
- shared bootstrap
- profile page
- organizer event creation scaffold
- improved auth UX
- completed auth page sign-in/sign-up switching
- forgot-password request and reset confirmation flow
- profile navigation from the navbar
- homepage filters and search
- homepage pagination / load more
- taxonomy-driven category/tag select options
- corrected backend URL ordering for event taxonomy endpoints

## Important Note

The older `js/eventflow.js` file still exists in the repository, but the current homepage/auth/booking/profile flow has largely been migrated onto the modular structure.

Going forward, new work should continue using:

- `api/`
- `services/`
- `utils/`
- `ui/`
- `pages/`
- `main.js`

rather than adding more feature logic back into the older monolithic file.

## Suggested Next Steps

- continue moving any remaining useful logic out of `js/eventflow.js`
- add browser testing across all updated pages
- test the new filters against a running Django API with real category/tag/venue data
- test organizer-only event creation with real organizer and attendee accounts
- improve post-create routing so successful event creation leads to a dedicated organizer event detail/dashboard page
- add organizer event editing and management flows on top of the new creation scaffold
- test password reset with the configured email backend and frontend reset URL
- connect real OAuth if social sign-in is required
- continue building organizer-only and dashboard features on the modular structure

## Full Application Build — Complete API Coverage

The frontend was expanded from a marketing site + partial flows into a complete
application whose UI now exercises **every** backend endpoint. The public landing
page (`index.html`) is unchanged; a new authenticated **dashboard shell**
(role-aware sidebar + topbar, live API-health indicator, notifications badge)
wraps all signed-in pages.

### Backend (minimal, additive — no migrations)

- Wired the pre-existing notification views into `events/urls.py`
  (`GET /api/events/notifications/`, `POST /api/events/notifications/<uuid>/read/`).
- Added `RegistrationListView` + `GET /api/events/registrations/` so attendees can
  list their own bookings; added `event_slug` to `RegistrationSerializer` for linking.
- Added read-only `is_staff` to `UserSerializer` so the frontend can gate the admin area.
- Made `InvitationSendView` resilient: if the Celery broker is unavailable it falls
  back to sending synchronously, so invitations work in dev without Redis.

### New API modules (`js/api/`)

- `catalog.api.js` (venues/speakers/sponsors CRUD, category/tag create),
  `core.api.js` (health), `notifications.api.js`.
- Extended `events.api.js` (update, delete, sendInvitation, acceptInvitation,
  getMyRegistrations) and `users.api.js` (admin listUsers/getUserById).
- Added a `delete` method to `client.js`.

### New services (`js/services/`)

- `catalog.service.js`, `admin.service.js`, `notification.service.js`.
- Extended `event.service.js`: update/delete/sendInvitation/acceptInvitation/
  getMyRegistrations, and now surfaces `speakers`/`sponsors` from the event serializer.
  Event links repoint to the new `event-detail.html`.

### New UI modules (`js/ui/`)

- `dashboard-shell.js` — the role-aware app shell (attendee / organizer / admin).
- `resource-manager.js` — one generic list + create/edit/delete component powering
  the venue, speaker, sponsor (full CRUD) and category/tag (create-only) pages.
- `toast.js` — shared toast + HTML-escape helper.
- `event-card.js` gained `renderManageEventCard` and page-aware links; `guards.js`
  gained `requireAdmin`; `formatters.js` gained date-range / clock / title-case helpers.

### New pages

- Public: `event-detail` (rich view + inline register + organizer edit/delete),
  `invitation` (accept by token).
- Dashboard: `dashboard` (stats + health + recent notifications), `my-events`
  (organizer), `my-bookings`, `edit-event` (update + delete + invite panel),
  `notifications`. `profile` and `create-event` were moved into the app shell.
- Catalog/admin: `venues`, `speakers`, `sponsors`, `taxonomy`, `admin-users`.
- All new pages register in `js/main.js` via `<body data-page>` detection.

### Known API limitations (surfaced in the UI, not worked around)

- Event ↔ speaker/sponsor **association** has no API (through-models are admin-only);
  the app manages the directories and displays them on events.
- Event `status` is read-only in the serializer, so the edit form omits it.
- There is no "list invitations" endpoint, so the invite panel sends + confirms
  but cannot list previously-sent invites.

### Verification performed

- `node --check` on all 41 JS files; zero referenced-but-undefined `EventFlow*` globals.
- Backend end-to-end via curl: health, register (organizer/attendee), profile
  `is_staff`, catalog create, event create/update/delete, register (+409 duplicate),
  my-registrations, notifications list, admin gating (403 for non-staff), and the full
  invitation send (202) → accept (200) → duplicate (409) flow.
- Static server smoke test: all 15 pages + the script/CSS chain return 200.
- Node harness: 18 assertions over the service-layer transformers against realistic
  API payloads (nested speakers/sponsors, name-string venue/categories, pagination,
  null-coercion) — all pass.

