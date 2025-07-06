// types.ts
export interface UserInfo {
  id: number;
  nom: string;
  prenom: string;
  filiere: string;
  niveau: string;
  photo: string | null;
}


// Dans types/types.ts
export interface PresenceItem {
  id: number;
  matiere: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  date_fin: string;
  status: string;
  justifiee: boolean;
  scanned_at?: string;
  prof_nom: string;
  salle_nom: string;
  type_seance: string;
}