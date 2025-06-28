from rest_framework import generics, status, serializers, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login,authenticate, update_session_auth_hash
from .models import Enseignant,PendingEnseignant,Etudiant, HelpRequest,Salle, Presence, QRNotification, Session, Filiere, Niveau, Matiere
from .serializers import EnseignantSignupSerializer, LoginSerializer,PendingEnseignantSerializer, SessionSerializer,PasswordSerializer, EmailSerializer, HelpRequestSerializer, PresenceSerializer, FiliereSerializer , MatiereSerializer, NiveauSerializer, EnseignantSerializer, EnseignantCreateUpdateSerializer, EnseignantListSerializer,SalleSerializer
import qrcode
from django.core.files import File
from io import BytesIO
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, action
from datetime import datetime
from rest_framework import permissions
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework.generics import get_object_or_404
import pytz
from .permissions import IsAdminRole
from django.http import HttpResponse
import pandas as pd
###############################Cote Eseignant################################################

class EnseignantSignupView(generics.CreateAPIView):
    queryset = Enseignant.objects.all()
    serializer_class = EnseignantSignupSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            
            return Response(
                {
                    "message": "Compte créé avec succès - En attente de validation admin",
                    "token": token.key,
                    "statut": user.statut
                },
                status=status.HTTP_201_CREATED
            )
        except serializers.ValidationError as e:
            print("Serializer errors:", serializer.errors)
            return Response(
                {"error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data

            token, _ = Token.objects.get_or_create(user=user)

            redirect_to = '/admin/dashboard' if user.role == 'admin' else '/enseignant/dashboard'

            return Response({
                'token': token.key,
                'role': user.role,
                'redirect_to': redirect_to,
                'message': f"Connexion {user.role} réussie"
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    
class GenerateQRCodeAPI(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        # Verify user is an Enseignant
        if getattr(request.user, 'statut', '').lower() not in ['professeur', 'vacataire']:
            return Response({"error": "Seuls les enseignants peuvent générer des QR codes."}, status=403)
        serializer = SessionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Create session with teacher
                session = serializer.save(enseignant=request.user)
                
                # Generate QR code
                qr_data = f"session:{session.id}"
                qr_img = qrcode.make(qr_data)
                
                # Save QR image
                buffer = BytesIO()
                qr_img.save(buffer, format="PNG")
                session.qr_code.save(f"qr_{session.id}.png", File(buffer))
                session.save()
                
                # Créer la notification pour l'admin
                QRNotification.objects.create(
                    enseignant=request.user,
                    session=session,
                    viewed=False
                )
                
                return Response({
                    "success": True,
                    "qr_code_url": request.build_absolute_uri(session.qr_code.url),
                    "session_id": session.id
                })
                
            except Exception as e:
                return Response({"error": str(e)}, status=500)
                
        return Response({"errors": serializer.errors}, status=400)
    
class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Ne retourner que les séances de l’enseignant connecté
        return Session.objects.filter(enseignant=self.request.user)

    def perform_create(self, serializer):
        serializer.save(enseignant=self.request.user)

class DashboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user
        now = datetime.now(pytz.timezone('Africa/Casablanca'))
        today_date = now.date()
        current_time = now.time()
        current_day = now.strftime('%A')

        jour_mapping = {
            'Monday': 'Lundi',
            'Tuesday': 'Mardi',
            'Wednesday': 'Mercredi',
            'Thursday': 'Jeudi',
            'Friday': 'Vendredi',
            'Saturday': 'Samedi',
            'Sunday': 'Dimanche',
        }
        jour = jour_mapping.get(current_day, current_day)

        # Nb total étudiants
        nb_etudiants = Etudiant.objects.count()

        # Nb séances enseignant total
        nb_seances = Session.objects.filter(enseignant=user).count()

        # Récupérer séances valides pour aujourd'hui
        sessions = Session.objects.filter(
            enseignant=user,
            jour=jour,
            date_debut__lte=today_date,
            date_fin__gte=today_date
        ).order_by('heure_debut')

        selected_session = None
        for session in sessions:
            if session.heure_debut <= current_time <= session.heure_fin:
                selected_session = session
                break
            elif current_time < session.heure_debut:
                selected_session = session
                break

        # Sérialiser séance prochaine
        session_data = None
        if selected_session:
            session_data = {
                'id': selected_session.id,
                'module': selected_session.module.nom,  # adapte selon ton modèle
                'heure_debut': selected_session.heure_debut.strftime('%H:%M'),
                'heure_fin': selected_session.heure_fin.strftime('%H:%M'),
                'jour': selected_session.jour,
                'salle': selected_session.salle.nom,  # adapte
            }

        data = {
            'nb_etudiants': nb_etudiants,
            'nb_seances': nb_seances,
            'seance_prochaine': session_data,
        }

        return Response(data)

            
class ProfileAPI(APIView):
    permission_classes = [AllowAny]

    # Get current email
    def get(self, request):
        return Response({'email': request.user.email})

    # Update email
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            request.user.email = serializer.validated_data['email']
            request.user.save()
            return Response({'status': 'Email updated'})
        return Response(serializer.errors, status=400)

class PasswordAPI(APIView):
    permission_classes = [AllowAny]

    # Update password
    def post(self, request):
        serializer = PasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not request.user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Wrong current password'}, status=400)
            
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            update_session_auth_hash(request, request.user)  # Prevent logout
            return Response({'status': 'Password updated'})
        return Response(serializer.errors, status=400)
    
    
class HelpRequestAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = {
            'enseignant': request.user.id,
            'message': request.data.get('message')
        }
        serializer = HelpRequestSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "Message sent successfully!"})
        return Response(serializer.errors, status=400)  
    
@api_view(['GET'])
def get_absences(request):
    session_id = request.GET.get('session')
    niveau = request.GET.get('niveau')
    filiere = request.GET.get('filiere')  
    date_str = request.GET.get('date')

    presences = Presence.objects.select_related('etudiant', 'session').all()

    if session_id:
        presences = presences.filter(session__id=session_id)
    if niveau:
        presences = presences.filter(etudiant__niveau=niveau)
    if filiere:
        presences = presences.filter(etudiant__filiere=filiere)  # 👈 filtrage par filière
    if date_str:
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
            presences = presences.filter(date=date_obj)
        except ValueError:
            return Response({"error": "Date format should be YYYY-MM-DD"}, status=400)

    serialized = PresenceSerializer(presences, many=True)
    total = presences.count()
    absents = presences.filter(justifiee=False).count()
    presents = total - absents
    taux = round((presents / total) * 100, 2) if total > 0 else 0

    response_data = {
        "etudiants": serialized.data,
        "statistiques": {
            "niveau": niveau,
            "filiere": filiere,  
            "presences": presents,
            "absences": absents,
            "taux": taux
        }
    }
    return Response(response_data)

################cote admin########################################

class AdminEnseignantViewSet(viewsets.ModelViewSet):
    queryset = Enseignant.objects.select_related('user').all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EnseignantCreateUpdateSerializer
        return EnseignantListSerializer

    def destroy(self, request, *args, **kwargs):
        enseignant = self.get_object()
        user = enseignant.user
        user.delete()  # Supprime user et enseignant grâce à OneToOne
        return Response({"message": "Enseignant supprimé avec succès"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        enseignant = self.get_object()
        enseignant.user.is_active = True
        enseignant.user.save()
        return Response({'status': 'Compte enseignant activé'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        enseignant = self.get_object()
        enseignant.user.is_active = False
        enseignant.user.save()
        return Response({'status': 'Compte enseignant désactivé'})


class AdminHelpResponseView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        help_request = get_object_or_404(HelpRequest, pk=pk)
        response_text = request.data.get('response')

        if not response_text:
            return Response({'error': 'Réponse vide non autorisée.'}, status=400)

        help_request.response = response_text
        help_request.resolved = True
        help_request.responded_at = timezone.now()
        help_request.save()

        return Response({'status': 'Réponse enregistrée avec succès.'})
    
class AdminHelpListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        help_requests = HelpRequest.objects.all().order_by('-created_at')
        serializer = HelpRequestSerializer(help_requests, many=True)
        return Response(serializer.data)

class QRNotificationView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        unread = QRNotification.objects.filter(viewed=False).select_related('enseignant', 'session')
        return Response({
            'notifications': [
                {
                    'id': n.id,
                    'enseignant': n.enseignant.email,
                    'session': SessionSerializer(n.session).data,
                    'date': n.created_at
                } for n in unread
            ]
        })

    @action(detail=True, methods=['post'])
    def mark_viewed(self, request, pk=None):
        notification = QRNotification.objects.get(pk=pk)
        notification.viewed = True
        notification.save()
        return Response({'status': 'marked as viewed'})
    
class EnseignantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Enseignant.objects.all()
    serializer_class = EnseignantSerializer
    
class PendingEnseignantViewSet(viewsets.ModelViewSet):
    queryset = PendingEnseignant.objects.all()
    serializer_class = PendingEnseignantSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        pending = self.get_object()
        
        enseignant = Enseignant.objects.create(
            user=pending.user,
            nom=pending.nom,
            prenom=pending.prenom,
            statut=pending.statut
        )

        pending.delete()
        return Response({'status': 'Enseignant validé et ajouté avec succès.'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        pending = self.get_object()
        pending.user.delete()  # Supprimer le compte utilisateur
        pending.delete()
        return Response({'status': 'Demande rejetée.'})

class AdminDashboardStatsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        total_enseignants = Enseignant.objects.count()  
        total_matieres = Matiere.objects.count()
        total_etudiants = Etudiant.objects.count()  

        data = {
            "total_enseignants": total_enseignants,
            "total_matieres": total_matieres,
            "total_etudiants": total_etudiants
        }
        return Response(data)
    
class ExportEnseignantsExcel(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        enseignants = Enseignant.objects.all().values(
            'id', 'nom', 'prenom', 'user__email', 'user__is_active'
        )
        df = pd.DataFrame(enseignants)
        df.rename(columns={'user__email': 'email', 'user__is_active': 'is_active'}, inplace=True)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=enseignants_report.xlsx'
        df.to_excel(response, index=False)
        return response
    
class ExportEtudiantsExcel(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        etudiants = Etudiant.objects.all().values(
            'id', 'nom', 'prenom', 'user__email', 'filiere', 'niveau'
        )
        df = pd.DataFrame(etudiants)
        df.rename(columns={'filiere__nom': 'filiere'}, inplace=True)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=etudiants_report.xlsx'
        df.to_excel(response, index=False)
        return response
    
class ExportMatieresExcel(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        matieres = Matiere.objects.all().values('id', 'nom', 'enseignant__nom')
        df = pd.DataFrame(matieres)
        df.rename(columns={'enseignant__nom': 'enseignant'}, inplace=True)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=matieres_report.xlsx'
        df.to_excel(response, index=False)
        return response
    
class ExportAbsencesExcel(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        absences = Presence.objects.select_related('etudiant', 'session').values(
            'etudiant__nom',
            'etudiant__prenom',
            'session__module',
            'session__type_seance',
            'session__filiere',
            'session__niveau',
            'session__salle',
            'date',  # date réelle de l’absence (depuis Presence)
            'session__heure_debut',
            'session__heure_fin',
            'justifiee'
        )

        df = pd.DataFrame(absences)
        df.rename(columns={
            'etudiant__nom': 'Nom étudiant',
            'etudiant__prenom': 'Prénom étudiant',
            'session__module': 'Module',
            'session__type_seance': 'Type',
            'session__filiere': 'Filière',
            'session__niveau': 'Niveau',
            'session__salle': 'Salle',
            'date': 'Date',
            'session__heure_debut': 'Heure début',
            'session__heure_fin': 'Heure fin',
            'justifiee': 'Justifiée'
        }, inplace=True)

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=absences_report.xlsx'
        df.to_excel(response, index=False)
        return response


#==============================================Autre views============================================================
    
class FiliereViewSet(viewsets.ModelViewSet):
    queryset = Filiere.objects.all()
    serializer_class = FiliereSerializer
    permission_classes = [AllowAny] 

class NiveauViewSet(viewsets.ModelViewSet):
    queryset = Niveau.objects.all()
    serializer_class = NiveauSerializer
    permission_classes = [AllowAny]
    

class MatiereViewSet(viewsets.ModelViewSet):
    
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer
    def get_queryset(self):
        filiere_id = self.request.query_params.get('filiere')
        niveau_id = self.request.query_params.get('niveau')
        queryset = Matiere.objects.all()
        if filiere_id:
            queryset = queryset.filter(filiere__id=filiere_id)
        if niveau_id:
            queryset = queryset.filter(niveau__id=niveau_id)
        return queryset 



class SalleViewSet(viewsets.ModelViewSet):
    queryset = Salle.objects.all()
    serializer_class = SalleSerializer

    
