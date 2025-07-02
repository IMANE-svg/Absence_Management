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
export type PresenceItem = {
  id: number;
  matiere: string;
  date: string;
  status: string;
  scanned_at?: string;
  prof_nom: string;
  salle_nom: string;
  salle_type: string;
  date_fin: string;
};