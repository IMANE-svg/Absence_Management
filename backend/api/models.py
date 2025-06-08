from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.conf import settings

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email required')
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user



class Enseignant(AbstractBaseUser):
    STATUT_CHOICES = [
        ('Professeur', 'Professeur'),
        ('Vacataire', 'Vacataire'),
    ]
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES)
    email = models.EmailField(unique=True)
    prenom = models.CharField(max_length=30, verbose_name="Prénom")
    nom = models.CharField(max_length=30, verbose_name="Nom")
   
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['prenom', 'nom']
    
    objects = UserManager()
    



class Session(models.Model):
    TYPE_CHOICES = [
        ('Cours', 'Cours'),
        ('TD', 'TD'),
        ('TP', 'TP'),
    ]
    enseignant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type_seance = models.CharField(max_length=10, choices=TYPE_CHOICES)
    salle = models.CharField(max_length=50)
    niveau = models.CharField(max_length=50)
    heure_seance = models.DateTimeField()
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type_seance} - {self.niveau}"

class HelpRequest(models.Model):
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Help request from {self.email}"
    
class Etudiant(models.Model):
    nom = models.CharField(max_length=30)
    prenom = models.CharField(max_length=30)
    niveau = models.CharField(max_length=50)
    photo = models.ImageField(upload_to='photos/')

    def __str__(self):
        return f"{self.prenom} {self.nom}"
    
class Presence(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    justifiee = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.etudiant} - {self.session}"