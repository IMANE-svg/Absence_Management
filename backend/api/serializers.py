from rest_framework import serializers
from .models import Enseignant, Session, HelpRequest, Presence
from django.contrib.auth import authenticate



class EnseignantSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    

    class Meta:
        model = Enseignant
        fields = ['prenom', 'nom', 'email', 
                 'password', 'confirm_password', 'statut']
        extra_kwargs = {
            'prenom': {'required': True},
            'nom': {'required': True}
                        }

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        
        if Enseignant.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Ce compte existe déjà")
            
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return Enseignant.objects.create_user(**validated_data)

class EnseignantLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user :
            raise serializers.ValidationError("Identifiants invalides")
        return user
    

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['type_seance', 'salle', 'niveau', 'heure_seance']
        extra_kwargs = {
            'heure_seance': {'required': True}
        }
        
class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    
    
class HelpRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpRequest
        fields = ['email', 'message']
        

class PresenceSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source="etudiant.nom")
    prenom = serializers.CharField(source="etudiant.prenom")
    niveau = serializers.CharField(source="etudiant.niveau")
    type_seance = serializers.CharField(source="session.type_seance")
    date = serializers.DateField(format="%d/%m/%Y")

    class Meta:
        model = Presence
        fields = ['nom', 'prenom', 'niveau', 'date', 'type_seance', 'justifiee']