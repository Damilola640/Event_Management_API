from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

class HealthCheckView(APIView):
    """
    API view for a health check endpoint.
    
    This endpoint can be used to monitor the status of the API and
    ensure that it is up and running.
    """
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        """
        Handles the GET request for the health check.
        """
        response_data = {
            "status": "ok",
            "message": "Event Management API is operational!",
            "version": "1.0.0",
            "timestamp": request.user.last_login if request.user.is_authenticated else None
        }
        return Response(response_data, status=status.HTTP_200_OK)
