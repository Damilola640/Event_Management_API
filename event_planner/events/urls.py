# This file defines the URL routes for the 'events' app. It handles
# the core functionality of my API, including creating, retrieving,
# updating, and deleting events.
#
from django.urls import path
from .views import (
    EventListCreateView,
    EventRetrieveUpdateDestroyView,
    VenueListCreateView,
    VenueRetrieveUpdateDestroyView,
    SpeakerListCreateView,
    SpeakerRetrieveUpdateDestroyView,
)

urlpatterns = [
    # Event endpoints
    # Use EventListCreateView for GET (list all events) and POST (create a new event)
    path('events/', EventListCreateView.as_view(), name='event-list-create'),
    
    # Use EventRetrieveUpdateDestroyView for GET, PUT, and DELETE on a specific event
    path('events/<uuid:pk>/', EventRetrieveUpdateDestroyView.as_view(), name='event-detail'),

    # Venue endpoints
    # Use VenueListCreateView for GET (list all venues) and POST (create a new venue)
    path('venues/', VenueListCreateView.as_view(), name='venue-list-create'),
    
    # Use VenueRetrieveUpdateDestroyView for GET, PUT, and DELETE on a specific venue
    path('venues/<uuid:pk>/', VenueRetrieveUpdateDestroyView.as_view(), name='venue-detail'),

    # Speaker endpoints
    # Use SpeakerListCreateView for GET (list all speakers) and POST (create a new speaker)
    path('speakers/', SpeakerListCreateView.as_view(), name='speaker-list-create'),
    
    # Use SpeakerRetrieveUpdateDestroyView for GET, PUT, and DELETE on a specific speaker
    path('speakers/<uuid:pk>/', SpeakerRetrieveUpdateDestroyView.as_view(), name='speaker-detail'),
]