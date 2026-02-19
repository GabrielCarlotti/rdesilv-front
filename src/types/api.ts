export interface CheckResult {
  test_name: string;
  valid: boolean;
  is_line_error: boolean;
  line_number: string | null;
  obtained_value: string | null;
  expected_value: string | null;
  difference: string | null;
  message: string;
}

export interface CheckReport {
  source_file: string | null;
  extraction_success: boolean;
  checks: CheckResult[];
  all_valid: boolean;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
}

export interface ApiParams {
  smic_mensuel: number;
  effectif_50_et_plus: boolean;
  plafond_ss: number;
  include_frappe_check: boolean;
  include_analyse_llm: boolean;
}
