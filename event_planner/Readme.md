Event Management API

This repository contains the source code for a robust and scalable Event Management API. It provides a comprehensive solution for creating, managing, and interacting with events, including features for user registration, venue management, and details about speakers and sponsors.
Key Features

    User Management: Create and manage user profiles with different roles (e.g., organizer, attendee).

    Event Lifecycle: Full CRUD (Create, Read, Update, Delete) operations for events, including status tracking (upcoming, active, completed).

    Registration System: Allows users to register for events, with support for tracking registration status and payment details.

    Venue Management: Handle information for physical venues, including capacity and address details.

    Speaker & Sponsor Information: Associate speakers and sponsors with events to provide detailed event information.

Technologies

    Backend: [Backend Language/Framework, Python with Django/Flask]

    Database: [PostgreSQL, MySQL]

    API Documentation: [Swagger/OpenAPI]

    Authentication: [JWT, OAuth 2.0]

API Endpoints

The API is built around a RESTful architecture and provides the following key endpoints:

Endpoint
	

Description

POST /api/auth/register
	

Creates a new user account.

POST /api/auth/login
	

Authenticates a user and returns a token.

GET /api/events
	

Retrieves a list of all events.

POST /api/events
	

Creates a new event.

GET /api/events/{id}
	

Retrieves details for a specific event.

PUT /api/events/{id}
	

Updates an existing event.

DELETE /api/events/{id}
	

Deletes an event.

POST /api/events/{id}/register
	

Registers the authenticated user for an event.

GET /api/users/{id}/registrations
	

Retrieves all registrations for a user.

GET /api/venues
	

Retrieves a list of venues.

GET /api/speakers
	

Retrieves a list of speakers.

GET /api/sponsors
	

Retrieves a list of sponsors.
Getting Started

    Clone the repository:
    git clone [git@github.com:Damilola640/Event_Management-API.git]

    Install dependencies:
    cd [event_planner]
    [pip install -r requirements.txt]

    Set up the database:

        Create a database and configure your connection strings in the .env file.

        Run migrations: [python manage.py makemigrations, python manage.py migrate]

    Run the server:
    [python manage.py runserver]

Contributing

We welcome contributions! Please read our CONTRIBUTING.md file for more information on how to get involved.