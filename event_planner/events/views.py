import datetime
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.db.models import Q
from django.utils import timezone

# For full-text search (PostgreSQL specific, but 'icontains' is for SQLite/general)
from django.contrib.postgres.search import SearchVector # If using PostgreSQL

from .models import Event, Venue, Speaker, Sponsor, Category, Tag, Registration, Invitation, Notification
from .serializers import (
    EventSerializer, VenueSerializer, SpeakerSerializer,
    CategorySerializer, TagSerializer, RegistrationSerializer,
    InvitationSerializer, NotificationSerializer
)
from .tasks import send_invitation_email_task, send_event_reminder_task # Import tasks

# --- Pagination ---
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# --- Event Views ---
class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Event.objects.all()
        
        # --- Full-Text Search ---
        search_query = self.request.query_params.get('search', None)
        if search_query:
            # For PostgreSQL FTS:
            # queryset = queryset.annotate(
            #    search=SearchVector('name', 'description', 'location_details', 'venue__name')
            # ).filter(search=search_query)
            
            # For general database (SQLite, MySQL etc.) using Q objects
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(location_details__icontains=search_query) |
                Q(venue__name__icontains=search_query)
            ).distinct() # Use distinct to avoid duplicate results for multiple matches

        # Filtering by date
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
            
        # Filtering by location (venue city/state)
        city = self.request.query_params.get('city')
        state = self.request.query_params.get('state')
        if city:
            queryset = queryset.filter(venue__city__icontains=city)
        if state:
            queryset = queryset.filter(venue__state__icontains=state)

        # Filtering by organizer
        organizer_username = self.request.query_params.get('organizer')
        if organizer_username:
            queryset = queryset.filter(organizer__username__icontains=organizer_username)
            
        # Filtering by category
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(categories__slug=category_slug)
            
        # Filtering by tag
        tag_slug = self.request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)

        # Filtering by public/private events
        # Authenticated users can see private events they are invited to or organized
        # Unauthenticated users only see public events
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(is_private=False)
        else:
            # Include events where the user is the organizer or has an accepted invitation
            queryset = queryset.filter(
                Q(is_private=False) |
                Q(organizer=self.request.user) |
                Q(invitations__email=self.request.user.email, invitations__accepted=True)
            ).distinct()


        return queryset

    def perform_create(self, serializer):
        if self.request.user.role == 'organizer':
            serializer.save(organizer=self.request.user)
        else:
            raise PermissionDenied("Only organizers can create events.")

class EventRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    lookup_field = 'slug'
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self):
        try:
            event = Event.objects.get(slug=self.kwargs['slug'])
        except Event.DoesNotExist:
            raise NotFound("An event with that slug does not exist.")
        
        # Check permission for private events
        if event.is_private and not self.request.user.is_authenticated:
            raise PermissionDenied("You do not have permission to view this private event.")
        
        if event.is_private and self.request.user.is_authenticated:
            # Organizer always has access
            if self.request.user == event.organizer:
                return event
            # Check if user has an accepted invitation
            if Invitation.objects.filter(event=event, email=self.request.user.email, accepted=True).exists():
                return event
            raise PermissionDenied("You do not have permission to view this private event.")
            
        return event


    def perform_update(self, serializer):
        if self.request.user == self.get_object().organizer:
            serializer.save()
        else:
            raise PermissionDenied("You do not have permission to edit this event.")

    def perform_destroy(self, instance):
        if self.request.user == instance.organizer:
            instance.delete()
        else:
            raise PermissionDenied("You do not have permission to delete this event.")

# --- Registration Views ---
class EventRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug, format=None):
        try:
            event = Event.objects.get(slug=slug)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check for private events: user must be organizer or have accepted invite
        if event.is_private:
            if request.user != event.organizer and \
               not Invitation.objects.filter(event=event, email=request.user.email, accepted=True).exists():
                raise PermissionDenied("You do not have permission to register for this private event.")

        if Registration.objects.filter(event=event, user=request.user).exists():
            return Response({"detail": "You are already registered for this event."}, status=status.HTTP_409_CONFLICT)
        
        registration = Registration.objects.create(event=event, user=request.user)
        serializer = RegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# --- Category & Tag Views ---
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
class TagListCreateView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# --- Invitation Views ---
class InvitationSendView(APIView):
    permission_classes = [IsAuthenticated] # Only authenticated users can send invitations

    def post(self, request, slug):
        try:
            event = Event.objects.get(slug=slug)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Only the organizer of the event can send invitations
        if request.user != event.organizer:
            raise PermissionDenied("You do not have permission to send invitations for this event.")
        
        # Ensure the event is private
        if not event.is_private:
            return Response({"detail": "Invitations can only be sent for private events."}, status=status.HTTP_400_BAD_REQUEST)

        email = request.data.get('email')
        if not email:
            raise ValidationError({"email": "Email is required."})

        # Prevent sending multiple invitations to the same email for the same event
        if Invitation.objects.filter(event=event, email=email).exists():
            return Response({"detail": "An invitation has already been sent to this email for this event."}, status=status.HTTP_409_CONFLICT)

        invitation = Invitation.objects.create(event=event, email=email, invited_by=request.user)
        
        # Send the invitation email asynchronously using Celery
        send_invitation_email_task.delay(str(invitation.id)) # Use .delay() for async execution
        
        serializer = InvitationSerializer(invitation)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED) # 202 Accepted because email is sent in background

class InvitationAcceptView(APIView):
    permission_classes = [AllowAny] # Allow unauthenticated users to accept

    def get(self, request, token):
        try:
            invitation = Invitation.objects.get(token=token, accepted=False)
        except Invitation.DoesNotExist:
            return Response({"detail": "Invalid or expired invitation token, or invitation already accepted."}, status=status.HTTP_404_NOT_FOUND)

        invitation.accepted = True
        invitation.accepted_at = timezone.now()
        invitation.save()

        # Optionally, automatically register the user if they are logged in
        # or if an account with that email exists. For simplicity, we just
        # mark the invitation as accepted here. A frontend would then
        # prompt the user to login/register and then proceed to register for the event.
        
        # If an account with this email exists and is logged in, you could
        # automatically create a registration here.
        # Example:
        # if request.user.is_authenticated and request.user.email == invitation.email:
        #     Registration.objects.get_or_create(event=invitation.event, user=request.user)
        #     return Response({"detail": "Invitation accepted and you are registered for the event!"}, status=status.HTTP_200_OK)

        return Response({"detail": f"Invitation for {invitation.event.name} accepted! Please log in or register with {invitation.email} to proceed."}, status=status.HTTP_200_OK)


# --- Notification Views ---
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # Only retrieve notifications for the authenticated user
        return Notification.objects.filter(user=self.request.user)

class NotificationMarkAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.read = True
            notification.save()
            return Response({"detail": "Notification marked as read."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"detail": "Notification not found or you don't have permission."}, status=status.HTTP_404_NOT_FOUND)