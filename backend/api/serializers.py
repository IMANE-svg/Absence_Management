from rest_framework import serializers
from .models import Etudiant, Enseignant

class EtudiantSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Etudiant
        fields = ['email', 'password', 'first_name', 'last_name', 
                 'photo', 'filiere', 'niveau']

class EnseignantSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Enseignant
        fields = ['email', 'password', 'first_name', 'last_name', 'photo']
        
from django.contrib.auth import authenticate

class EtudiantLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user or not isinstance(user, Etudiant):
            raise serializers.ValidationError("Invalid credentials")
        return user

class EnseignantLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user or not isinstance(user, Enseignant):
            raise serializers.ValidationError("Invalid credentials")
        return user