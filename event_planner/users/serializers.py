from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_organizer']
        read_only_fields = ['username', 'email'] # Prevents a user from changing their username/email through this serializer

# --- UserRegistrationSerializer for POST requests ---
# This serializer handles the user registration process, including
# password validation and the creation of a new user.
class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    is_organizer = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        # Validate that the two password fields match
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if username or email already exists
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({'username': 'A user with that username already exists.'})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({'email': 'A user with that email already exists.'})
            
        return attrs

    def create(self, validated_data):
        # Create a new user instance, handling the 'is_organizer' field
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_organizer=validated_data.get('is_organizer', False)
        )
        return user