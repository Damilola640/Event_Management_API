from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied, NotFound
from django.db.models import Q
from .models import Event, Venue, Speaker, Sponsor, Category, Tag, Registration
from .serializers import (
    EventSerializer, VenueSerializer, SpeakerSerializer,
    CategorySerializer, TagSerializer, RegistrationSerializer
)

class IsOrganizer(IsAuthenticated):
    def has_permission(self, request, view):
        if request.user.is_authenticated and request.user.role == 'organizer':
            return True
        return False

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

        return queryset

    def perform_create(self, serializer):
        if self.request.user.role == 'organizer':
            serializer.save(organizer=self.request.user)
        else:
            raise PermissionDenied("Only organizers can create events.")

class EventRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    lookup_field = 'slug'  # Use slug for URL lookup
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self):
        try:
            return Event.objects.get(slug=self.kwargs['slug'])
        except Event.DoesNotExist:
            raise NotFound("An event with that slug does not exist.")

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

        # Check if the user is already registered for this event
        if Registration.objects.filter(event=event, user=request.user).exists():
            return Response({"detail": "You are already registered for this event."}, status=status.HTTP_409_CONFLICT)
        
        # Create a new registration
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