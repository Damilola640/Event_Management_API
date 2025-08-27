# This file contains the API views for all event-related entities,
# including events, venues, and speakers. It leverages DRF's generic
# views to provide a clean and robust RESTful implementation.
#
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied
from .models import Event, Venue, Speaker
from .serializers import EventSerializer, VenueSerializer, SpeakerSerializer

# --- Permission Class ---
# This custom permission ensures that only organizers can create events.
class IsOrganizer(IsAuthenticated):
    """
    Custom permission to only allow organizers to create objects.
    """
    def has_permission(self, request, view):
        # A user must be authenticated and have the 'organizer' role
        if request.user.is_authenticated and request.user.is_organizer():
            return True
        return False

# --- Event Views ---
class EventListCreateView(generics.ListCreateAPIView):
    """
    API view to list all events or create a new event.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOrganizer]

    def get_queryset(self):
        """
        Optionally filters events by the authenticated user's ID
        if they are an organizer.
        """
        # Get the base queryset
        queryset = super().get_queryset()

        # If the user is an organizer, they only see their own events.
        if self.request.user.is_organizer():
            queryset = queryset.filter(organizer=self.request.user)

        return queryset

    def perform_create(self, serializer):
        """
        Associates the new event with the authenticated user (organizer).
        """
        # Ensure the creating user is set as the organizer.
        if self.request.user.is_organizer():
            serializer.save(organizer=self.request.user)
        else:
            raise PermissionDenied("Only organizers can create events.")

class EventRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, or delete a single event.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        """
        Ensures only the event's organizer can update it.
        """
        # Check if the authenticated user is the organizer of the event.
        if self.request.user == self.get_object().organizer:
            serializer.save()
        else:
            raise PermissionDenied("You do not have permission to edit this event.")

    def perform_destroy(self, instance):
        """
        Ensures only the event's organizer can delete it.
        """
        # Check if the authenticated user is the organizer of the event.
        if self.request.user == instance.organizer:
            instance.delete()
        else:
            raise PermissionDenied("You do not have permission to delete this event.")

# --- Venue Views ---
# These views allow any authenticated user to manage venues, which is a reasonable
# assumption for a basic API. You can change permissions as needed.
class VenueListCreateView(generics.ListCreateAPIView):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class VenueRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

# --- Speaker Views ---
# Similar to Venues, these views are set to be managed by authenticated users.
class SpeakerListCreateView(generics.ListCreateAPIView):
    queryset = Speaker.objects.all()
    serializer_class = SpeakerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class SpeakerRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Speaker.objects.all()
    serializer_class = SpeakerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
