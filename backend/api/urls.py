from django.urls import path
from .views import EtudiantSignupView, EnseignantSignupView, EtudiantLoginView,EnseignantLoginView

urlpatterns = [
    path('signup/etudiant/', EtudiantSignupView.as_view()),
    path('signup/enseignant/', EnseignantSignupView.as_view()),
    path('login/etudiant/', EtudiantLoginView.as_view()),
    path('login/enseignant/', EnseignantLoginView.as_view()),
]