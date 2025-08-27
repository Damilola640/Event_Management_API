# This file defines the Django models for all event-related entities.
# These models represent the core data structure of your API.
#
import uuid
from django.db import models
from django.contrib.auth import get_user_model

# Get the custom user model defined in the 'users' app
User = get_user_model()

# Create choices for event status
EVENT_STATUS_CHOICES = (
    ('upcoming', 'Upcoming'),
    ('active', 'Active'),
    ('cancelled', 'Cancelled'),
    ('completed', 'Completed'),
)

# Create choices for sponsorship level
SPONSORSHIP_LEVELS = (
    ('gold', 'Gold'),
    ('silver', 'Silver'),
    ('bronze', 'Bronze'),
)

# --- Core Models ---

class Venue(models.Model):
    """
    Model representing a physical venue where events are held.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    capacity = models.IntegerField()
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Speaker(models.Model):
    """
    Model representing a speaker at an event.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True, null=True)
    organization = models.CharField(max_length=255, blank=True, null=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    photo_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Sponsor(models.Model):
    """
    Model representing a sponsor of an event.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Event(models.Model):
    """
    Model representing an event.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, related_name='events', blank=True, null=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    location_details = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=10, choices=EVENT_STATUS_CHOICES, default='upcoming')
    max_attendees = models.IntegerField(blank=True, null=True)
    ticket_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Many-to-many relationships are defined on this model.
    speakers = models.ManyToManyField(Speaker, related_name='speaking_at', through='Event_Speaker')
    sponsors = models.ManyToManyField(Sponsor, related_name='sponsoring', through='Event_Sponsor')
    
    def __str__(self):
        return self.name

# --- Junction Models for Many-to-Many Relationships ---

class Event_Speaker(models.Model):
    """
    Junction table for the many-to-many relationship between Event and Speaker.
    """
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='event_speakers')
    speaker = models.ForeignKey(Speaker, on_delete=models.CASCADE)
    presentation_topic = models.CharField(max_length=255, blank=True, null=True)
    presentation_start_time = models.DateTimeField(blank=True, null=True)
    presentation_end_time = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.event.name} - {self.speaker.first_name}"

class Event_Sponsor(models.Model):
    """
    Junction table for the many-to-many relationship between Event and Sponsor.
    """
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='event_sponsors')
    sponsor = models.ForeignKey(Sponsor, on_delete=models.CASCADE)
    sponsorship_level = models.CharField(max_length=10, choices=SPONSORSHIP_LEVELS)
    sponsorship_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    
    def __str__(self):
        return f"{self.event.name} - {self.sponsor.name}"