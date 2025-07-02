from django.core.management.base import BaseCommand
from django.core.mail import EmailMessage
from openpyxl import Workbook
from io import BytesIO
from datetime import datetime, timedelta
from api.models import Enseignant, Etudiant, Session, Presence

class Command(BaseCommand):
    help = "Génère et envoie les rapports de présence mensuels"

    def handle(self, *args, **kwargs):
        today = datetime.today()
        mois_precedent = today.replace(day=1) - timedelta(days=1)
        mois_str = mois_precedent.strftime('%Y-%m')

        for enseignant in Enseignant.objects.all():
            filieres = Session.objects.filter(enseignant=enseignant).values_list('matiere__filiere', flat=True).distinct()
            niveaux = Session.objects.filter(enseignant=enseignant).values_list('matiere__niveau', flat=True).distinct()

            for filiere_id in filieres:
                for niveau_id in niveaux:
                    sessions = Session.objects.filter(
                        enseignant=enseignant,
                        matiere__filiere_id=filiere_id,
                        matiere__niveau_id=niveau_id,
                        date_debut__year=mois_precedent.year,
                        date_debut__month=mois_precedent.month
                    ).order_by('date_debut')

                    etudiants = Etudiant.objects.filter(filiere_id=filiere_id, niveau_id=niveau_id).order_by('nom', 'prenom')

                    if not sessions.exists() or not etudiants.exists():
                        continue

                    wb = Workbook()
                    ws = wb.active
                    ws.title = "Présences"

                    headers = ["Nom", "Prénom"] + [s.date_debut.strftime('%d/%m') for s in sessions]
                    ws.append(headers)

                    for etudiant in etudiants:
                        ligne = [etudiant.nom, etudiant.prenom]
                        for session in sessions:
                            present = Presence.objects.filter(etudiant=etudiant, session=session).exists()
                            ligne.append("Présent" if present else "Absent")
                        ws.append(ligne)

                    buffer = BytesIO()
                    wb.save(buffer)
                    buffer.seek(0)

                    email = EmailMessage(
                        subject=f"Rapport de présence – {mois_str}",
                        body=f"Bonjour {enseignant.prenom},\n\nVoici le rapport de présence pour {mois_str}.",
                        to=[enseignant.user.email]
                    )
                    email.attach(f"rapport_{mois_str}.xlsx", buffer.read(), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                    email.send()

        self.stdout.write(self.style.SUCCESS("Rapports envoyés avec succès."))
