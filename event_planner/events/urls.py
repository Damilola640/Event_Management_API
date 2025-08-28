# This file defines the URL routes for the 'events' app.
from django.urls import path
from .views import (
    EventListCreateView,
    EventRetrieveUpdateDestroyView,
    VenueListCreateView,
    VenueRetrieveUpdateDestroyView,
    SpeakerListCreateView,
    SpeakerRetrieveUpdateDestroyView,
    CategoryListCreateView,
    TagListCreateView,
    EventRegistrationView,
)

urlpatterns = [
    # Event endpoints
    path('events/', EventListCreateView.as_view(), name='event-list-create'),
    path('events/<slug:slug>/', EventRetrieveUpdateDestroyView.as_view(), name='event-detail'),
    path('events/<slug:slug>/rsvp/', EventRegistrationView.as_view(), name='event-rsvp'),
    
    # Category and Tag endpoints
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('tags/', TagListCreateView.as_view(), name='tag-list-create'),

    # Venue endpoints
    path('venues/', VenueListCreateView.as_view(), name='venue-list-create'),
    path('venues/<uuid:pk>/', VenueRetrieveUpdateDestroyView.as_view(), name='venue-detail'),

    # Speaker endpoints
    path('speakers/', SpeakerListCreateView.as_view(), name='speaker-list-create'),
    path('speakers/<uuid:pk>/', SpeakerRetrieveUpdateDestroyView.as_view(), name='speaker-detail'),
]