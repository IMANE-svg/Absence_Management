from django.db import migrations

def add_initial_filieres_niveaux(apps, schema_editor):
    Filiere = apps.get_model('api', 'Filiere')
    Niveau = apps.get_model('api', 'Niveau')

    filieres = ['GI', 'GE', 'GIND', 'MGSI', 'GSEIR', 'ITIRC', 'IDSC', 'SICS', 'GC', 'STPI']
    niveaux_par_filiere = {
        'STPI': ['1', '2'],
        'default': ['1', '2', '3'],
    }

    # Création des filières
    for filiere_nom in filieres:
        Filiere.objects.get_or_create(nom=filiere_nom)

    # Création des niveaux (uniques)
    niveaux_a_creer = set()
    for filiere_nom in filieres:
        if filiere_nom == 'STPI':
            niveaux_a_creer.update(niveaux_par_filiere['STPI'])
        else:
            niveaux_a_creer.update(niveaux_par_filiere['default'])

    for niveau_nom in niveaux_a_creer:
        Niveau.objects.get_or_create(nom=niveau_nom)

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_initial_filieres_niveaux),
    ]
