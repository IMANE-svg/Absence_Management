from rest_framework.views import APIView
from rest_framework.response import Response
from api.models import User
from .serializers import UserSerializer
from core.permissions import IsAdminUser

class UserListView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)