export type TypeRupture = 'licenciement' | 'rupture_conventionnelle';

export type MotifLicenciement =
  | 'personnel'
  | 'economique'
  | 'inaptitude_professionnelle'
  | 'inaptitude_non_professionnelle'
  | 'faute_grave'
  | 'faute_lourde';

export type ConventionCollective = 'aucune' | 'ccn_1966';

export interface PeriodeTravail {
  duree_mois: number;
  coefficient_temps: number;
}

export interface LicenciementInput {
  type_rupture: TypeRupture;
  date_entree: string;             // ISO date YYYY-MM-DD
  date_notification: string | null; // licenciement uniquement
  date_fin_contrat: string;
  motif: MotifLicenciement | null;
  indemnite_supralegale: string | null;
  convention_collective: ConventionCollective;
  salaires_12_derniers_mois: string[];
  primes_annuelles_3_derniers_mois: string;
  periodes_travail: PeriodeTravail[];
  mois_suspendus_non_comptes: number;
  mois_conge_parental_temps_plein: number;
  age_salarie: number | null;
  salaire_mensuel_actuel: string | null;
}

export interface LicenciementResult {
  type_rupture: TypeRupture;
  montant_indemnite: string;
  montant_minimum: string;
  salaire_reference: string;
  methode_salaire_reference: string;
  anciennete_retenue_mois: number;
  anciennete_retenue_annees: string;
  indemnite_legale: string;
  indemnite_conventionnelle: string | null;
  multiplicateur: string;
  preavis_mois: number;
  indemnite_supralegale: string;
  plafond_applique: boolean;
  plafond_description: string | null;
  explication: string;
  eligible: boolean;
  raison_ineligibilite: string | null;
}

export interface SalaireMensuel {
  mois: number;
  annee: number;
  salaire_brut: string;
}

export interface LicenciementPdfExtraction {
  extraction_success: boolean;
  extraction_errors: string[];
  date_entree: string | null;
  convention_collective: ConventionCollective;
  convention_collective_brute: string | null;
  salaires_extraits: SalaireMensuel[];
  salaires_12_derniers_mois: string[];
  nombre_fiches_extraites: number;
}
