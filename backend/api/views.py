from rest_framework import generics, status, serializers, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import  update_session_auth_hash
from .models import Enseignant,PendingEnseignant,Etudiant, HelpRequest,Salle, Presence, QRNotification, Session, Filiere, Niveau, Matiere
from .serializers import EnseignantSignupSerializer, CustomTokenObtainPairSerializer,EtudiantRegisterSerializer, PendingEnseignantSerializer, SessionSerializer,PasswordSerializer, EmailSerializer, HelpRequestSerializer, PresenceSerializer, FiliereSerializer , MatiereSerializer, NiveauSerializer, EnseignantSerializer, EnseignantCreateUpdateSerializer, EnseignantListSerializer,SalleSerializer
import qrcode
import re
from django.core.files import File
from io import BytesIO
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, action
from datetime import datetime, timedelta
from rest_framework import permissions
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework.generics import get_object_or_404
import pytz
from django.http import HttpResponse
import pandas as pd
from openpyxl import Workbook
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from dateutil.relativedelta import relativedelta
from django.db.models import Q
###############################L'authentification################################################

#########Rani mst3mla simplejwt fiha access token w refresh token###################################

#####################Signup  d lenseignant#######################################

class EnseignantSignupView(generics.CreateAPIView):
    queryset = Enseignant.objects.all()
    serializer_class = EnseignantSignupSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            user = serializer.save()
            enseignant = user.enseignant
           
            
            return Response(
                {
                    "message": "Compte créé avec succès - En attente de validation admin",
                    "statut": enseignant.statut
                },
                status=status.HTTP_201_CREATED
            )
        except serializers.ValidationError as e:
            print("Serializer errors:", serializer.errors)
            return Response(
                {"error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
##################Signup d letudiant nfs l vue dyalk mabdlt fiha walo############################

class RegisterEtudiantView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = EtudiantRegisterSerializer(data=request.data)
        if serializer.is_valid():
            etudiant = serializer.save()
            return Response(
                {"message": "Inscription réussie"}, 
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"error": "Données invalides", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

##########Hna fin bdlt: f simplejwt katkn ath b TokenObtainPair deja kunt dayra fiha ens w admin ozdt ta letudiant bach matknch repitition 

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({'detail': 'Email ou mot de passe incorrect'}, status=status.HTTP_401_UNAUTHORIZED)
    

        return Response(serializer.validated_data, status=status.HTTP_200_OK)

######################GENERATION DL CODE W SCAN#########################################################

###########Hadi lapi d generation ka detecter la seance actuel mn les seances li 3mr lprof okatgenerer l qr code 

class GenerateQRCodeAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'enseignant'):
            return Response({"error": "Utilisateur non lié à un enseignant."}, status=403)

        user = request.user
        enseignant = user.enseignant
        if enseignant.statut.lower() not in ['professeur', 'vacataire']:
            return Response({"error": "Seuls les enseignants peuvent générer des QR codes."}, status=403)

        session_id = request.data.get('session_id')
        if session_id:
            try:
                session = Session.objects.get(id=session_id, enseignant=user)
            except Session.DoesNotExist:
                return Response({"error": "Séance introuvable."}, status=404)
        else:
            now = timezone.now()
            today = now.date()
            current_time = now.replace(second=0, microsecond=0).time()
            jour = now.strftime('%A')
            jour_mapping = {
                'Monday': 'Lundi', 'Tuesday': 'Mardi', 'Wednesday': 'Mercredi',
                'Thursday': 'Jeudi', 'Friday': 'Vendredi', 'Saturday': 'Samedi', 'Sunday': 'Dimanche'
            }
            jour = jour_mapping.get(jour, jour)

            session = Session.objects.filter(
                enseignant=user,
                jour=jour,
                date_debut__lte=today,
                date_fin__gte=today,
                heure_debut__lte=current_time,
                heure_fin__gte=current_time
            ).first()

            if not session:
                return Response({"error": "Aucune séance en cours trouvée."}, status=404)

        # Vérifier si un QR code existe déjà et est encore valide
        if session.qr_code and session.qr_generated_at:
            if timezone.now() - session.qr_generated_at < timedelta(minutes=10):
                return Response({
                    "success": True,
                    "qr_code_url": request.build_absolute_uri(session.qr_code.url),
                    "session_id": session.id,
                    "message": "QR code déjà généré récemment."
                })

        # Générer un nouveau QR code
        qr_data = str(session.id)
        qr_img = qrcode.make(qr_data)
        buffer = BytesIO()
        qr_img.save(buffer, format="PNG")
        session.qr_code.save(f"qr_{session.id}.png", File(buffer))
        session.qr_generated_at = timezone.now()
        session.save()

        # Créer une notification li katmchi l admin bach y3ref seance o taux de presence
        QRNotification.objects.create(
            enseignant=enseignant,
            session=session,
            viewed=False
        )

        return Response({
            "success": True,
            "qr_code_url": request.build_absolute_uri(session.qr_code.url),
            "session_id": session.id
        })
        
##Hadi la vue d lenseignant li kayrecuperer biha la liste dles etudiants automatiquement 3la 7sab seance li 3ndo ofiha absent par deafaut 
        
@api_view(['GET'])
def get_absences(request):
    user = request.user
    if not hasattr(user, 'enseignant'):
        return Response({"error": "Accès réservé aux enseignants"}, status=403)

    session_id = request.query_params.get('session_id')
    if session_id:
        try:
            session = Session.objects.get(id=session_id, enseignant=user)
        except Session.DoesNotExist:
            return Response({"error": "Séance introuvable."}, status=404)
    else:
        now = timezone.now()
        today = now.date()
        current_time = now.replace(second=0, microsecond=0).time()
        jour = now.strftime('%A')
        jour_mapping = {
            'Monday': 'Lundi', 'Tuesday': 'Mardi', 'Wednesday': 'Mercredi',
            'Thursday': 'Jeudi', 'Friday': 'Vendredi', 'Saturday': 'Samedi', 'Sunday': 'Dimanche'
        }
        jour = jour_mapping.get(jour, jour)

        session = Session.objects.filter(
            enseignant=user,
            jour=jour,
            date_debut__lte=today,
            date_fin__gte=today,
            heure_debut__lte=current_time,
            heure_fin__gte=current_time
        ).first()

        if not session:
            return Response({"error": "Aucune séance en cours trouvée."}, status=404)

    filiere = session.matiere.filiere
    niveau = session.matiere.niveau

    etudiants = Etudiant.objects.filter(filiere=filiere, niveau=niveau).order_by('nom', 'prenom')
    presences = Presence.objects.filter(session=session)
    presence_dict = {p.etudiant_id: p for p in presences}

    result = []
    for etudiant in etudiants:
        presence = presence_dict.get(etudiant.id)
        result.append({
            "nom": etudiant.nom,
            "prenom": etudiant.prenom,
            "status": "présent(e)" if presence else "absent(e)",
            "justifiee": presence.justifiee if presence else False,
            "scanned_at": presence.scanned_at if presence else None
        })

    total = len(result)
    presents = sum(1 for r in result if r["status"] == "présent(e)")
    absents = total - presents
    taux = round((presents / total) * 100, 2) if total > 0 else 0

    return Response({
        "session_id": session.id,
        "filiere": filiere.nom,
        "niveau": niveau.nom,
        "etudiants": result,
        "statistiques": {
            "presences": presents,
            "absences": absents,
            "taux": taux
        }
    })

#######################Hadi la vue dyalk d enregistrer la presence li mt3l9a bscan modifit ghi chi dfchat 3la 7sab simple jwt

@api_view(['POST'])
def enregistrer_presence_scan(request):
    user = request.user

    if user.role != 'etudiant':
        return Response({"error": "Accès non autorisé"}, status=403)

    session_id = request.data.get('session_id')
    if not session_id:
        return Response({"error": "ID de session manquant"}, status=400)

    try:
        session = Session.objects.get(id=session_id)
    except Session.DoesNotExist:
        return Response({"error": "Session introuvable"}, status=404)

    now = timezone.now()
    if now.date() != session.date_debut or not (session.heure_debut <= now.time() <= session.heure_fin):
        return Response({"error": "La séance n'est pas en cours actuellement"}, status=400)

    etudiant = user.etudiant

    presence, created = Presence.objects.get_or_create(
        etudiant=etudiant,
        session=session,
        defaults={'status': 'présent(e)'}
    )

    if created:
        return Response({
            "message": "Présence enregistrée",
            "etudiant": f"{etudiant.prenom} {etudiant.nom}",
            "session": session.id,
            "scanned_at": presence.scanned_at
        }, status=201)
    else:
        return Response({
            "message": "Présence déjà enregistrée",
            "presence_id": presence.id
        }, status=200)

#########################Hadi la vue lokhra dyal li katrecupere biha lpresence ta hiya nfs l7aja 

@api_view(['GET'])
def get_student_presences(request):
    user = request.user

    if user.role != 'etudiant':
        return Response({"error": "Accès non autorisé"}, status=403)

    etudiant = user.etudiant
    presences = Presence.objects.filter(etudiant=etudiant).select_related(
        'session__matiere', 'session__salle', 'session__enseignant'
    ).order_by('-session__date_debut')

    result = []
    for presence in presences:
        session = presence.session
        result.append({
            'id': presence.id,
            'matiere': session.matiere.nom,
            'date': session.date_debut,
            'status': presence.status,
            'justifiee': presence.justifiee,
            'scanned_at': presence.scanned_at,
            'enseignant': f"{session.enseignant.prenom} {session.enseignant.nom}",
            'salle': session.salle.nom,
            'date_fin': session.date_fin
        })

    return Response(result, status=200)

#############Had l modele li nayd 3lih lfilm lenseignant y9dr y3mr les seances dyalo mra we7da pdt wa7ed lperiode
############System mn b3d kayb9a ydetecter automatiquement seance: niv fil matiere..............

class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Session.objects.filter(enseignant=self.request.user)

    def perform_create(self, serializer):
        data = self.request.data
        date_debut = serializer.validated_data['date_debut']
        date_fin = serializer.validated_data['date_fin']
        jour_cible = serializer.validated_data['jour']

        jours_map = {
            'Lundi': 0, 'Mardi': 1, 'Mercredi': 2,
            'Jeudi': 3, 'Vendredi': 4, 'Samedi': 5
        }
        weekday_target = jours_map.get(jour_cible)

        current = date_debut
        while current <= date_fin:
            if current.weekday() == weekday_target:
                serializer.save(
                    enseignant=self.request.user,
                    date_debut=current,
                    date_fin=current
                )
            current += timedelta(days=1)

############Les vues d lenseignant##############################################
### Katregrouper nb detudiants f seances , nbr de seances dlprof o la seance prochaine #####################

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

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

        # Récupérer les séances du jour
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

        # Initialiser les compteurs
        nb_etudiants = 0
        nb_seances = 0
        session_data = None

        if selected_session:
            filiere = selected_session.matiere.filiere
            niveau = selected_session.matiere.niveau

            # Étudiants de la même filière et niveau
            nb_etudiants = Etudiant.objects.filter(filiere=filiere, niveau=niveau).count()

            # Séances de l’enseignant pour cette filière/niveau
            nb_seances = Session.objects.filter(
                enseignant=user,
                matiere__filiere=filiere,
                matiere__niveau=niveau
            ).count()

            session_data = {
                'id': selected_session.id,
                'module': selected_session.matiere.nom,
                'heure_debut': selected_session.heure_debut.strftime('%H:%M'),
                'heure_fin': selected_session.heure_fin.strftime('%H:%M'),
                'jour': selected_session.jour,
                'salle': selected_session.salle.nom,
                'filiere': filiere.nom,
                'niveau': niveau.nom,
            }

        return Response({
            'nb_etudiants': nb_etudiants,
            'nb_seances': nb_seances,
            'seance_prochaine': session_data,
        })

#############Hada ghi 3la 7sab l modification dl profile: email w password
###########ladmin li kaykn dayr password mowe7ed mais mn b3d lenseignant kaybdlo
            
class ProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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

# rapport cote enseignant mais mzl majrbto ki tayba 7alty wyami

@api_view(['GET'])
def generer_rapport_presence(request):
    user = request.user
    if not hasattr(user, 'enseignant'):
        return Response({"error": "Accès réservé aux enseignants"}, status=403)

    filiere_id = request.GET.get('filiere')
    niveau_id = request.GET.get('niveau')
    mois = request.GET.get('mois')  # format "2025-07"

    if not filiere_id or not niveau_id or not mois:
        return Response({"error": "filiere, niveau et mois sont requis"}, status=400)

    try:
        annee, mois_num = map(int, mois.split('-'))
        date_debut = datetime(annee, mois_num, 1)
        date_fin = datetime(annee, mois_num + 1, 1) if mois_num < 12 else datetime(annee + 1, 1, 1)
    except:
        return Response({"error": "Format de mois invalide. Utilisez YYYY-MM"}, status=400)

    sessions = Session.objects.filter(
        enseignant=user,
        matiere__filiere_id=filiere_id,
        matiere__niveau_id=niveau_id,
        date_debut__gte=date_debut,
        date_debut__lt=date_fin
    ).order_by('date_debut')

    etudiants = Etudiant.objects.filter(filiere_id=filiere_id, niveau_id=niveau_id).order_by('nom', 'prenom')

    rapport = []
    for etudiant in etudiants:
        ligne = {
            "nom": etudiant.nom,
            "prenom": etudiant.prenom,
            "presences": []
        }
        for session in sessions:
            present = Presence.objects.filter(etudiant=etudiant, session=session).exists()
            ligne["presences"].append({
                "date": session.date_debut.strftime('%Y-%m-%d'),
                "module": session.matiere.nom,
                "status": "Présent" if present else "Absent"
            })
        rapport.append(ligne)

    return Response({
        "enseignant": f"{user.prenom} {user.nom}",
        "filiere": sessions.first().matiere.filiere.nom if sessions else "",
        "niveau": sessions.first().matiere.niveau.nom if sessions else "",
        "mois": mois,
        "rapport": rapport
    })
@api_view(['GET'])
def telecharger_rapport_excel(request):
    user = request.user
    if not hasattr(user, 'enseignant'):
        return Response({"error": "Accès réservé aux enseignants"}, status=403)

    filiere_id = request.GET.get('filiere')
    niveau_id = request.GET.get('niveau')
    mois = request.GET.get('mois')  # format "2025-07"

    if not filiere_id or not niveau_id or not mois:
        return Response({"error": "filiere, niveau et mois sont requis"}, status=400)

    try:
        annee, mois_num = map(int, mois.split('-'))
        date_debut = datetime(annee, mois_num, 1)
        date_fin = datetime(annee, mois_num + 1, 1) if mois_num < 12 else datetime(annee + 1, 1, 1)
    except:
        return Response({"error": "Format de mois invalide. Utilisez YYYY-MM"}, status=400)

    sessions = Session.objects.filter(
        enseignant=user,
        matiere__filiere_id=filiere_id,
        matiere__niveau_id=niveau_id,
        date_debut__gte=date_debut,
        date_debut__lt=date_fin
    ).order_by('date_debut')

    etudiants = Etudiant.objects.filter(filiere_id=filiere_id, niveau_id=niveau_id).order_by('nom', 'prenom')

    # Création du fichier Excel
    wb = Workbook()
    ws = wb.active
    ws.title = "Présences"

    # En-têtes
    headers = ["Nom", "Prénom"] + [s.date_debut.strftime('%d/%m') for s in sessions]
    ws.append(headers)

    # Lignes par étudiant
    for etudiant in etudiants:
        ligne = [etudiant.nom, etudiant.prenom]
        for session in sessions:
            present = Presence.objects.filter(etudiant=etudiant, session=session).exists()
            ligne.append("Présent" if present else "Absent")
        ws.append(ligne)

    # Préparer la réponse HTTP
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    response = HttpResponse(
        buffer,
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    filename = f"rapport_presence_{mois}.xlsx"
    response['Content-Disposition'] = f'attachment; filename={filename}'
    return response
    
##########Had l api katjme3 etudiant w enseignant kaysifto biha demande l admin 

class HelpRequestAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'enseignant'):
            help_requests = HelpRequest.objects.filter(enseignant=request.user)
        elif hasattr(request.user, 'etudiant'):
            help_requests = HelpRequest.objects.filter(etudiant=request.user)
        else:
            return Response({'error': 'Utilisateur non reconnu.'}, status=400)

        help_requests = help_requests.order_by('-created_at')
        serializer = HelpRequestSerializer(help_requests, many=True)
        return Response(serializer.data)

    def post(self, request):
        subject = request.data.get('subject')
        message = request.data.get('message')

        if not subject or not message:
            return Response({'error': 'Sujet et message requis.'}, status=400)

        help_request = HelpRequest.objects.create(
            subject=subject,
            message=message,
            enseignant=request.user if hasattr(request.user, 'enseignant') else None,
            etudiant=request.user if hasattr(request.user, 'etudiant') else None,
        )
        return Response({'status': 'Message envoyé avec succès !'}, status=201)
#################3Hadi la vue dyalk dl profile wrah tahiya modifit chi 7wayj bach tkhdm 3la 7sab simplejwt oraha khdama 

@api_view(['GET', 'PUT'])

def student_profile_view(request):
    user = request.user

    if user.role != 'etudiant':
        return Response({"error": "Accès non autorisé"}, status=403)

    etudiant = user.etudiant

    if request.method == 'GET':
        return Response({
            'id': etudiant.id,
            'nom': etudiant.nom,
            'prenom': etudiant.prenom,
            'email': user.email,
            'filiere': etudiant.filiere,
            'niveau': etudiant.niveau,
            'photo': etudiant.photo.url if etudiant.photo else None
        })

    elif request.method == 'PUT':
        data = request.data

        # Mise à jour des champs Etudiant
        etudiant.nom = data.get('nom', etudiant.nom)
        etudiant.prenom = data.get('prenom', etudiant.prenom)
        etudiant.filiere = data.get('filiere', etudiant.filiere)
        etudiant.niveau = data.get('niveau', etudiant.niveau)

        # Mise à jour de l'email
        new_email = data.get('email')
        if new_email and new_email != user.email:
            if not re.match(r'^[a-zA-Z0-9_.+-]+@ump\.ac\.ma$', new_email):
                return Response({"error": "Email UMP requis (ex: nom@ump.ac.ma)"}, status=400)
            user.email = new_email

        # Mise à jour du mot de passe
        new_password = data.get('password')
        if new_password:
            user.set_password(new_password)

        # Mise à jour de la photo
        if 'photo' in request.FILES:
            etudiant.photo = request.FILES['photo']

        user.save()
        etudiant.save()

        return Response({
            "message": "Profil mis à jour",
            "etudiant": {
                'id': etudiant.id,
                'nom': etudiant.nom,
                'prenom': etudiant.prenom,
                'email': user.email,
                'filiere': etudiant.filiere,
                'niveau': etudiant.niveau,
                'photo': etudiant.photo.url if etudiant.photo else None
            }
        }, status=200)



#############################################cote admin########################################
####################Had la vue k ygerer biha l admin les enseignants : crud 

class AdminEnseignantViewSet(viewsets.ModelViewSet):
    queryset = Enseignant.objects.select_related('user').all()
    permission_classes = [IsAuthenticated, IsAdminUser]

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

################Hna la admin kaychuf les demandes daide okayred 3lihum

class AdminHelpResponseView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

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
    
######################Hadi gi ka ylister biha les demandes li kayjiweh oletat dyalhum
    
class AdminHelpListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        help_requests = HelpRequest.objects.all().order_by('-created_at')
        serializer = HelpRequestSerializer(help_requests, many=True)
        return Response(serializer.data)
    
##########Hadi 3la 7sab min ygenerer lens qr code twsl notif l admin

class QRNotificationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
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

##########################La vue 3la 7sab y activer les enseignants 
    
class EnseignantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Enseignant.objects.all()
    serializer_class = EnseignantSerializer
    
#had la vue 3la 7sab min chi prof ydir inscription mayknch active 7ta y autoriser l admin mais ymkn ngl3ha 
#7it ladmin asln ydir lcrud donc la tzad ens machi ta ltma ydir ghi supp

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

###############Les cartes d dashbord li fihum nbr ens nbr etudiant..............

class AdminDashboardStatsView(APIView):
    
    permission_classes = [IsAuthenticated, IsAdminUser]

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
    
###############l'export dles enseignants mais fih les erreurs mn b3d onfixihum 3sbni    

class ExportEnseignantsExcel(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # 📅 Récupération des paramètres de période
        mois = request.query_params.get('mois')  # ex: "2025-07"
        semestre = request.query_params.get('semestre')  # ex: "1" ou "2"
        now = timezone.now()

        # Définir la période de filtrage
        date_debut = None
        date_fin = None

        if mois:
            try:
                annee, mois_num = map(int, mois.split('-'))
                date_debut = datetime(annee, mois_num, 1)
                date_fin = date_debut + relativedelta(months=1)
            except:
                return Response({"error": "Format de mois invalide. Utilisez AAAA-MM."}, status=400)

        elif semestre:
            annee = now.year
            if semestre == "1":
                date_debut = datetime(annee, 1, 1)
                date_fin = datetime(annee, 6, 30)
            elif semestre == "2":
                date_debut = datetime(annee, 7, 1)
                date_fin = datetime(annee, 12, 31)

        enseignants = Enseignant.objects.select_related('user').all()
        data = []

        for enseignant in enseignants:
            sessions = Session.objects.filter(enseignant=enseignant.user).select_related('matiere')

            # Appliquer le filtre de période si défini
            if date_debut and date_fin:
                sessions = sessions.filter(date_debut__lte=date_fin, date_fin__gte=date_debut)

            matieres = set(s.matiere.nom for s in sessions)
            filieres = set(s.matiere.filiere.nom for s in sessions)
            niveaux = set(s.matiere.niveau.nom for s in sessions)

            total_presences = 0
            total_attendus = 0

            for session in sessions:
                filiere = session.matiere.filiere
                niveau = session.matiere.niveau
                nb_etudiants = Etudiant.objects.filter(filiere=filiere, niveau=niveau).count()
                nb_presents = Presence.objects.filter(session=session).count()

                total_attendus += nb_etudiants
                total_presences += nb_presents

            taux_presence = round((total_presences / total_attendus) * 100, 2) if total_attendus > 0 else 0

            data.append({
                'Nom': enseignant.nom,
                'Prénom': enseignant.prenom,
                'Email': enseignant.user.email,
                'Actif': 'Oui' if enseignant.user.is_active else 'Non',
                'Statut': enseignant.statut,
                'Modules enseignés': ', '.join(matieres) if matieres else '—',
                'Filières': ', '.join(filieres) if filieres else '—',
                'Niveaux': ', '.join(niveaux) if niveaux else '—',
                'Nombre de séances': sessions.count(),
                'Taux moyen de présence (%)': taux_presence,
            })

        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=rapport_enseignants.xlsx'
        df.to_excel(response, index=False)
        return response
    
###############Hadi ghu zwa9 ta t9adiha partie dyalk -_-

class ExportEtudiantsExcel(APIView):
    
    permission_classes = [IsAuthenticated, IsAdminUser]

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
    
#########    Hada ma3rftch sara7a dayra fih ghi matiere w lenseignant ma3rftch chnu nzid

class ExportMatieresExcel(APIView):
    
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        matieres = Matiere.objects.all().values('id', 'nom', 'enseignant__nom')
        df = pd.DataFrame(matieres)
        df.rename(columns={'enseignant__nom': 'enseignant'}, inplace=True)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=matieres_report.xlsx'
        df.to_excel(response, index=False)
        return response
    
########Hada ghi gl3ih 7it ymkn labsence ghatzidiha f export etudiant 

class ExportAbsencesExcel(APIView):
    
    permission_classes = [IsAuthenticated, IsAdminUser]

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
    
###############Hadi 3la 7sab fil w niveau okadiri ta ens 
class MatiereViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
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

 #############logout li nsit nzido fpartie dyali    
@api_view(['POST'])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Token de rafraîchissement requis"}, status=400)

        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response({"message": "Déconnexion réussie"}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
