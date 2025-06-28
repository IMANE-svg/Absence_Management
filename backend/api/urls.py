from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    EnseignantSignupView,LoginView, GenerateQRCodeAPI,
    ProfileAPI, PasswordAPI, AdminHelpResponseView,
    get_absences, AdminEnseignantViewSet, QRNotificationView, FiliereViewSet, MatiereViewSet, 
    NiveauViewSet,DashboardView, PendingEnseignantViewSet, AdminHelpListView, AdminDashboardStatsView,SalleViewSet,
    SessionViewSet, HelpRequestAPI, ExportAbsencesExcel, ExportEnseignantsExcel,ExportEtudiantsExcel,ExportMatieresExcel
)
from django.views.decorators.csrf import csrf_exempt
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

# Admin routes (uniquement une seule fois le ViewSet pour les enseignants)
router.register(r'admin/enseignants', AdminEnseignantViewSet, basename='admin-enseignants')
router.register(r'filieres', FiliereViewSet)
router.register(r'niveaux', NiveauViewSet)
router.register(r'matieres', MatiereViewSet)
router.register(r'pending-enseignants', PendingEnseignantViewSet, basename='pending-enseignants')
router.register(r'seances', SessionViewSet, basename='seance')
router.register(r'salles', SalleViewSet)


urlpatterns = [
    # Auth
    path('signup/enseignant/', EnseignantSignupView.as_view()),
    path('login/', LoginView.as_view(), name='login'),
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
    path('help-requests/respond/', AdminHelpResponseView.as_view()),

    # Absences
    path('absences/', get_absences, name='get_absences'),

    # Pending enseignants
    path('pending-enseignants/<int:pk>/validate/', PendingEnseignantViewSet.as_view({'post': 'validate'})),
    path('pending-enseignants/<int:pk>/delete/', PendingEnseignantViewSet.as_view({'delete': 'destroy'})),

    path('admin/export/enseignants/', ExportEnseignantsExcel.as_view() ,name ='export-enseignants'),
    path("admin/export/matieres/", ExportMatieresExcel.as_view(), name='export-matieres'),
    path('admin/export/etudiants', ExportEtudiantsExcel.as_view(), name = 'export-etudiants'),
    path("admin/export/absences", ExportAbsencesExcel.as_view(), name ='export-absences'),
    # Routes des ViewSets via le router
    path('', include(router.urls)),
    

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
