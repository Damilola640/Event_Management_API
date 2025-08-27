# This file defines the serializers for all event-related entities.
# Serializers are responsible for converting complex data types,
# like Django model instances, into native Python types that can
# be easily rendered into JSON.
#
from rest_framework import serializers
from .models import Event, Venue, Speaker, Event_Speaker, Event_Sponsor

# --- Junction Table Serializers ---
# These serializers handle the data for the many-to-many relationships.
# They are included here to provide a clear structure for how you would
# handle the intermediate tables in your API.

class EventSpeakerSerializer(serializers.ModelSerializer):
    # This serializer is for the many-to-many relationship between Event and Speaker.
    # It includes the presentation topic and times.
    speaker = serializers.StringRelatedField() # Displays the speaker's name

    class Meta:
        model = Event_Speaker
        fields = ['speaker', 'presentation_topic', 'presentation_start_time', 'presentation_end_time']

class EventSponsorSerializer(serializers.ModelSerializer):
    # This serializer handles the many-to-many relationship for sponsors.
    sponsor = serializers.StringRelatedField() # Displays the sponsor's name

    class Meta:
        model = Event_Sponsor
        fields = ['sponsor', 'sponsorship_level', 'sponsorship_amount']


# --- Core Model Serializers ---

class VenueSerializer(serializers.ModelSerializer):
    """
    Serializer for the Venue model.
    """
    class Meta:
        model = Venue
        fields = '__all__' # Includes all fields from the Venue model

class SpeakerSerializer(serializers.ModelSerializer):
    """
    Serializer for the Speaker model.
    """
    class Meta:
        model = Speaker
        fields = '__all__' # Includes all fields from the Speaker model

class EventSerializer(serializers.ModelSerializer):
    """
    Serializer for the Event model.
    """
    # Use nested serializers to display speaker and sponsor details in the event response
    speakers = EventSpeakerSerializer(source='event_speakers', many=True, read_only=True)
    sponsors = EventSponsorSerializer(source='event_sponsors', many=True, read_only=True)
    
    # Use StringRelatedField to display the organizer's username
    organizer = serializers.StringRelatedField(read_only=True)
    
    # Use SlugRelatedField to show the venue's name when creating or updating an event
    venue = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Venue.objects.all(),
        required=False, # Make venue optional
        allow_null=True # Allow a null value if no venue is selected
    )

    class Meta:
        model = Event
        fields = [
            'id', 'organizer', 'name', 'description', 'start_date', 'end_date',
            'start_time', 'end_time', 'venue', 'location_details', 'status',
            'max_attendees', 'ticket_price', 'speakers', 'sponsors'
        ]
        read_only_fields = ['id', 'organizer', 'status']