from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings
from django.core.validators import RegexValidator

#==================================Users=====================================================


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, role=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        if not role:
            raise ValueError('User role is required')
        email = self.normalize_email(email)
        user = self.model(email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')  # ajoute ici sans doublon

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('etudiant', 'Étudiant'),
        ('enseignant', 'Enseignant'),
        ('admin', 'Administrateur'),
    ]
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role']

    objects = UserManager()

    def __str__(self):
        return self.email


class Enseignant(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    STATUT_CHOICES = [
        ('Professeur', 'Professeur'),
        ('Vacataire', 'Vacataire'),
    ]
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES)

    def __str__(self):
        return f"{self.prenom} {self.nom}"
    
class Etudiant(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    niveau = models.CharField(max_length=50)
    filiere = models.CharField(max_length=50)
    photo = models.ImageField(upload_to='etudiants/', null=True, blank=True)

    def __str__(self):
        return f"{self.prenom} {self.nom}"
    
    
    
#==================================================Cote Enseignant=========================================
class HelpRequest(models.Model):
    enseignant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="help_requests_enseignant",
        null=True,
        blank=True
    )
    etudiant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="help_requests_etudiant",
        null=True,
        blank=True
    )
    subject = models.CharField(max_length=255)
    message = models.TextField()
    response = models.TextField(blank=True)
    resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        auteur = self.enseignant or self.etudiant
        return f"Aide de {auteur.email} le {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    

#====================================Autres modeles=================================================
class Filiere(models.Model):
    nom = models.CharField(max_length=100)

    def __str__(self):
        return self.nom

class Niveau(models.Model):
    nom = models.CharField(max_length=100)

    def __str__(self):
        return self.nom
    
class Matiere(models.Model):
    nom = models.CharField(max_length=100)
    enseignant = models.ForeignKey(Enseignant, on_delete=models.CASCADE)
    filiere = models.ForeignKey(Filiere, on_delete=models.CASCADE)
    niveau = models.ForeignKey(Niveau, on_delete=models.CASCADE)

    def __str__(self):
        return self.nom
class Salle(models.Model):
        nom = models.CharField(max_length=100)

        def __str__(self):
            return self.nom


class Session(models.Model):
    TYPE_CHOICES = [
        ('Cours', 'Cours'),
        ('TD', 'TD'),
        ('TP', 'TP'),
    ]

    JOUR_CHOICES = [
        ('Lundi', 'Lundi'),
        ('Mardi', 'Mardi'),
        ('Mercredi', 'Mercredi'),
        ('Jeudi', 'Jeudi'),
        ('Vendredi', 'Vendredi'),
        ('Samedi', 'Samedi'),
    ]

    enseignant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type_seance = models.CharField(max_length=10, choices=TYPE_CHOICES)
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE)
    salle = models.ForeignKey(Salle, on_delete=models.CASCADE)
    jour = models.CharField(max_length=10, choices=JOUR_CHOICES)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    date_debut = models.DateField()
    date_fin = models.DateField(null=True, blank=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.matiere.nom} ({self.type_seance}) - {self.matiere.niveau.nom} - {self.jour} {self.heure_debut}"



class Presence(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    justifiee = models.BooleanField(default=False)
    scanned_at = models.DateTimeField(auto_now_add=True)  # ✅ pour le scan
    status = models.CharField(max_length=20, default='présent(e)')  # ✅ optionnel

    def __str__(self):
        return f"{self.etudiant} - {self.session}"

    
#=================================================Cote Admin=========================================

class QRNotification(models.Model):
    enseignant = models.ForeignKey(Enseignant, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    viewed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    

class PendingEnseignant(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    statut = models.CharField(max_length=20, choices=[
        ('Professeur', 'Professeur'),
        ('Vacataire', 'Vacataire')
    ])
    date_demande = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.prenom} {self.nom} (En attente)"
    
