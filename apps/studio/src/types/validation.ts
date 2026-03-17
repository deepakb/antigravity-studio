export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  id?: string;
  severity: ValidationSeverity;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  fix?: {
    description: string;
    command?: string;
  };
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  name: string;
  passed: boolean;
  issues: ValidationIssue[];
  summary: string;
  durationMs?: number;
}

export interface ValidationReport {
  project: string;
  timestamp: string;
  overallPassed: boolean;
  results: ValidationResult[];
}
