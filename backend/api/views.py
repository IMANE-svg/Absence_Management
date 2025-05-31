from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login
from .models import Etudiant, Enseignant
from .serializers import EtudiantSerializer, EnseignantSerializer, EnseignantLoginSerializer, EtudiantLoginSerializer


class EtudiantSignupView(generics.CreateAPIView):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"message": "Etudiant created successfully"}, 
            status=status.HTTP_201_CREATED
        )

class EnseignantSignupView(generics.CreateAPIView):
    queryset = Enseignant.objects.all()
    serializer_class = EnseignantSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"message": "Enseignant created successfully"}, 
            status=status.HTTP_201_CREATED
        )
        


class EtudiantLoginView(APIView):
    def post(self, request):
        serializer = EtudiantLoginSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            login(request, serializer.validated_data['user'])
            return Response({
                "message": "Student login successful",
                "user_id": serializer.validated_data['user'].id
            })
        return Response(serializer.errors, status=400)

class EnseignantLoginView(APIView):
    def post(self, request):
        serializer = EnseignantLoginSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            login(request, serializer.validated_data['user'])
            return Response({
                "message": "Teacher login successful",
                "user_id": serializer.validated_data['user'].id
            })
        return Response(serializer.errors, status=400)