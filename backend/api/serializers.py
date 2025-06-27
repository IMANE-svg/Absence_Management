from rest_framework import serializers
from .models import User,PendingEnseignant, Enseignant, Session, HelpRequest, Presence, Filiere, Matiere, Niveau, Salle
from django.contrib.auth import authenticate


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
            is_active=False     # l’admin doit activer le compte
        )

        # Créer profil enseignant
        Enseignant.objects.create(
            user=user,
            nom=validated_data['nom'],
            prenom=validated_data['prenom'],
            statut=validated_data['statut']
        )

        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Identifiants invalides")
        
        # Si enseignant : vérifier l'activation
        if user.role == 'enseignant' and not user.is_active:
            raise serializers.ValidationError("Votre compte enseignant est en attente de validation.")
        
        return user

    
#================================================Cote Enseignant====================================================

class EnseignantProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')

    class Meta:
        model = Enseignant
        fields = ['email', 'prenom', 'nom', 'statut']

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = [
            'id',
            'type_seance',
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
            'module': {'required': True},
            'heure_debut': {'required': True},
            'heure_fin': {'required': True},
            'date_debut': {'required': True},
            'date_fin': {'required': True},
        }
        
class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    
    
class HelpRequestSerializer(serializers.ModelSerializer):
    enseignant_email = serializers.EmailField(source='enseignant.email', read_only=True)

    class Meta:
        model = HelpRequest
        fields = [
            'id',
            'enseignant',
            'enseignant_email',
            'message',
            'response',
            'resolved',
            'created_at',
            'responded_at',
        ]
        read_only_fields = ['enseignant', 'response', 'resolved', 'created_at', 'responded_at']

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

class EnseignantListSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    role = serializers.CharField(source='user.role', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)

    class Meta:
        model = Enseignant
        fields = ['id', 'nom', 'prenom', 'statut', 'email', 'role', 'is_active']

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
        fields = ['id', 'nom', 'enseignant', 'enseignant_id', 'filiere_id', 'niveau_id']
        

        
class PendingEnseignantSerializer(serializers.ModelSerializer):
    class Meta:
        model = PendingEnseignant
        fields = '__all__'

class SalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salle
        fields = ['id', 'nom']