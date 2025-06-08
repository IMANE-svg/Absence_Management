from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import EnseignantSignupView,EnseignantLoginView, GenerateQRCodeAPI, ProfileAPI, PasswordAPI, HelpRequestAPI , get_absences
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse


urlpatterns = [
    
    path('signup/enseignant/', EnseignantSignupView.as_view()),
    
    path('login/enseignant/', EnseignantLoginView.as_view()),
    
    path('generate-qr/', csrf_exempt(GenerateQRCodeAPI.as_view())),
    
    path('profile/', ProfileAPI.as_view()),
    
    path('profile/password/', PasswordAPI.as_view()),
    
    path('help-request/', HelpRequestAPI.as_view()),
    
    path('absences/', get_absences, name='get_absences'),
    
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)