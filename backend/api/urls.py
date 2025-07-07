from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    EnseignantSignupView,CustomTokenObtainPairView, GenerateQRCodeAPI,
    ProfileAPI, PasswordAPI, AdminHelpResponseView,EtudiantViewSet,
    get_absences, AdminEnseignantViewSet, QRNotificationView, FiliereViewSet, MatiereViewSet, 
    NiveauViewSet,DashboardView,  AdminHelpListView, AdminDashboardStatsView,SalleViewSet,
    SessionViewSet, HelpRequestAPI,ExportRapportAbsencesEnseignant,ExportAbsencesReport,EnseignantReport,
    RegisterEtudiantView, logout_view, enregistrer_presence_scan, get_student_presences,
    student_profile_view
    )
from django.views.decorators.csrf import csrf_exempt
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import(
    
    TokenRefreshView,
)

router = DefaultRouter()

# Admin routes (uniquement une seule fois le ViewSet pour les enseignants)
router.register(r'admin/enseignants', AdminEnseignantViewSet, basename='admin-enseignants')
router.register(r'filieres', FiliereViewSet)
router.register(r'niveaux', NiveauViewSet)
router.register(r'matieres', MatiereViewSet)
router.register(r'seances', SessionViewSet, basename='seance')
router.register(r'salles', SalleViewSet)

# Gestion des etudieant
router.register(r'admin/etudiants', EtudiantViewSet, basename='admin-etudiants')


urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Auth
    path('signup/enseignant/', EnseignantSignupView.as_view()),
    #path('login/', LoginView.as_view(), name='login'),
    path('admin/dashboard-stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),

    # Profile et mot de passe
    path('profile/', ProfileAPI.as_view()),
    path('profile/password/', PasswordAPI.as_view()),

    # QR Code
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('generate-qr/', csrf_exempt(GenerateQRCodeAPI.as_view())),

    # Aide
    path('my-help-requests/', HelpRequestAPI.as_view()),
    path('help-requests/', AdminHelpListView.as_view()),
    path('help-requests/respond/<int:pk>', AdminHelpResponseView.as_view()),

    # Absences
    path('absences/', get_absences, name='get_absences'),
    path('rapport-absences/',ExportRapportAbsencesEnseignant.as_view()),

  


    # génération rapport
    path('admin/qr-report/', EnseignantReport.as_view(), name='qr-report'),
    path('admin/export-absences/', ExportAbsencesReport.as_view(), name='export-absences'),
    
    # Etudiant 
    path('signup/etudiant/', RegisterEtudiantView.as_view(), name='etudiant_signup'),
    
    path('logout/', logout_view, name='logout'),

    path('presences/scan/', enregistrer_presence_scan, name='presence_scan'),
    path('presences/', get_student_presences, name='student_presences'),

    path('etudiant/profil/', student_profile_view, name='student_profile'),
    
   
    
    # Routes des ViewSets via le router
    
    path('', include(router.urls)),
    

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
