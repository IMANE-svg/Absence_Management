from rest_framework import serializers
from .models import User,Etudiant, Enseignant, Session, HelpRequest, Presence, Filiere, Matiere, Niveau, Salle
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import re

#====================================Users========================================================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'is_active']

class EnseignantSignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    prenom = serializers.CharField()
    nom = serializers.CharField()
    statut = serializers.ChoiceField(choices=Enseignant.STATUT_CHOICES)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email déjà utilisé")
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        
        # Créer utilisateur de base
        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            role='enseignant',  
            is_active=True
        )

        # Créer profil enseignant
        Enseignant.objects.create(
            user=user,
            nom=validated_data['nom'],
            prenom=validated_data['prenom'],
            statut=validated_data['statut']
        )

        return user

########################Fhad serializer zdt ta etudiant 7it hada li khdam f simplejwt    

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # Ajoute des infos personnalisées à la réponse
        data['role'] = user.role
        data['email'] = user.email

        # Redirection selon le rôle
        if user.role == 'admin':
            data['redirect_to'] = '/admin/dashboard'
        elif user.role == 'enseignant':
            data['redirect_to'] = '/enseignant/dashboard'
        elif user.role == 'etudiant':
            data['redirect_to'] = '/(main)/scan-qr'  # utilisé côté mobile
        else:
            data['redirect_to'] = '/'

        return data

##################Hada ghi serializer dyalk

class EtudiantRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    nom = serializers.CharField()
    prenom = serializers.CharField()
    niveau = serializers.CharField()
    filiere = serializers.CharField()
    photo = serializers.ImageField(required=False)

    def validate_email(self, value):
        if not re.match(r'^[a-zA-Z0-9_.+-]+@ump\.ac\.ma$', value):
            raise serializers.ValidationError("L'email doit être un email académique UMP (ex: nom.prenom@ump.ac.ma)")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un compte avec cet email existe déjà.")
        return value

    

    def create(self, validated_data):
        password = validated_data.pop('password')
        

        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            role='etudiant'
        )

        etudiant = Etudiant.objects.create(
            user=user,
            nom=validated_data['nom'],
            prenom=validated_data['prenom'],
            niveau=validated_data['niveau'],
            filiere=validated_data['filiere'],
            photo=validated_data.get('photo')
        )

        return etudiant


    
#================================================Cote Enseignant====================================================


class EnseignantProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')

    class Meta:
        model = Enseignant
        fields = ['email', 'prenom', 'nom', 'statut']
        
#################Serializer dseance ############################################

class SessionSerializer(serializers.ModelSerializer):
    filiere = serializers.CharField(source='matiere.filiere.nom', read_only=True)
    niveau = serializers.CharField(source='matiere.niveau.nom', read_only=True)
    module = serializers.CharField(source='matiere.nom', read_only=True)

    class Meta:
        model = Session
        fields = [
            'id',
            'type_seance',
            'matiere',     
            'module',      
            'salle',       
            'filiere',     
            'niveau',      
            'jour',
            'heure_debut',
            'heure_fin',
            'date_debut',
            'date_fin',
        ]
        extra_kwargs = {
            'matiere': {'required': True},
            'salle': {'required': True},
            'heure_debut': {'required': True},
            'heure_fin': {'required': True},
            'date_debut': {'required': True},
        }

#######################Hado 3la 7sab profile d ens###############################

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
  
#################Hada mwe7ed bin admin w etudiant  
  
class HelpRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpRequest
        fields = '__all__'
        read_only_fields = ['enseignant', 'etudiant', 'created_at', 'responded_at', 'resolved']


################Hada dl absence orah khdam f 3vues w7da dyali w 2 dyalk
class PresenceSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source="etudiant.nom")
    prenom = serializers.CharField(source="etudiant.prenom")
    filiere = serializers.CharField(source="etudiant.filiere") 
    niveau = serializers.CharField(source="etudiant.niveau")
    type_seance = serializers.CharField(source="session.type_seance")
    date = serializers.DateField(format="%d/%m/%Y")

    class Meta:
        model = Presence
        fields = ['nom', 'prenom','filiere', 'niveau', 'date', 'type_seance', 'justifiee']
        
        
#===========================================Cote Admin==================================================================
        
class EnseignantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enseignant
        fields = '__all__'
############Liste dles enseignants #####################################
class EnseignantListSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    role = serializers.CharField(source='user.role', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)

    class Meta:
        model = Enseignant
        fields = ['id', 'nom', 'prenom', 'statut', 'email', 'role', 'is_active']
######################3la 7sab creation w modification #################
class EnseignantCreateUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(source='user.email', required=True)
    nom = serializers.CharField()
    prenom = serializers.CharField()
    statut = serializers.ChoiceField(choices=Enseignant.STATUT_CHOICES)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('user', {}).get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")

        if self.instance is None and User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email déjà utilisé")
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')

        # Récupérer l'email depuis la clé 'user'
        email = validated_data.get('user', {}).get('email')

        user = User.objects.create_user(
            email=email,
            password=password,
            role='enseignant',
            is_active=True  # ou False si tu veux qu’un admin active ensuite
        )

        enseignant = Enseignant.objects.create(
            user=user,
            nom=validated_data['nom'],
            prenom=validated_data['prenom'],
            statut=validated_data['statut']
        )

        return enseignant


    def update(self, instance, validated_data):
        user = instance.user

        # Email
        email = validated_data.get('user', {}).get('email')
        if email:
            user.email = email

        # Mot de passe
        password = validated_data.get('password')
        confirm_password = validated_data.get('confirm_password')
        if password and confirm_password:
            if password != confirm_password:
                raise serializers.ValidationError("Les mots de passe ne correspondent pas")
            user.set_password(password)

        user.save()

        # Infos enseignant
        instance.nom = validated_data.get('nom', instance.nom)
        instance.prenom = validated_data.get('prenom', instance.prenom)
        instance.statut = validated_data.get('statut', instance.statut)
        instance.save()

        return instance

# ################################## Gestion des etud /admin
class EtudiantSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)

    class Meta:
        model = Etudiant
        fields = ['id', 'nom', 'prenom', 'email', 'filiere', 'niveau', 'photo', 'is_active']
        read_only_fields = ['id']

    def validate_email(self, value):
        if not re.match(r'^[a-zA-Z0-9_.+-]+@ump\.ac\.ma$', value):
            raise serializers.ValidationError("L'email doit être un email académique UMP (ex: nom.prenom@ump.ac.ma)")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        # Mise à jour de l'email si fourni
        if 'email' in user_data:
            self.validate_email(user_data['email'])  # Validation de l'email
            user.email = user_data['email']
            user.save()
        
        # Mise à jour des autres champs de l'étudiant
        instance.nom = validated_data.get('nom', instance.nom)
        instance.prenom = validated_data.get('prenom', instance.prenom)
        instance.filiere = validated_data.get('filiere', instance.filiere)
        instance.niveau = validated_data.get('niveau', instance.niveau)
        
        # Gestion de la photo
        if 'photo' in validated_data:
            if validated_data['photo'] is None:
                # Supprimer la photo existante
                instance.photo.delete(save=False)
                instance.photo = None
            else:
                instance.photo = validated_data['photo']
        
        instance.save()
        return instance   
###########################Autres serializers######################################### 
class FiliereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filiere
        fields = '__all__'

class NiveauSerializer(serializers.ModelSerializer):
    class Meta:
        model = Niveau
        fields = '__all__'

class MatiereSerializer(serializers.ModelSerializer):
    enseignant = EnseignantSerializer(read_only=True)
    enseignant_id = serializers.PrimaryKeyRelatedField(
        queryset=Enseignant.objects.all(), write_only=True, source='enseignant'
    )
    filiere_id = serializers.PrimaryKeyRelatedField(
        queryset=Filiere.objects.all(), write_only=True, source='filiere'
    )
    niveau_id = serializers.PrimaryKeyRelatedField(
        queryset=Niveau.objects.all(), write_only=True, source='niveau'
    )

    class Meta:
        model = Matiere
        fields = ['id', 'nom', 'enseignant', 'enseignant_id','filiere_id', 'niveau_id']
        

        

class SalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salle
        fields = ['id', 'nom']