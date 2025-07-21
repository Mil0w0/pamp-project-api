/**
 * Types TypeScript pour l'API PAMP Project
 * Version: 1.0.0
 * Dernière mise à jour: 2025-01-12
 */


// ============================================================================
// TYPES DE BASE
// ============================================================================

/** UUID v4 standard */
export type UUID = string;

/** Timestamp ISO 8601 */
export type Timestamp = string;

/** Types de grilles de notation */
export type GradingScaleType = 'livrable' | 'rapport' | 'soutenance';

/** Modes de notation */
export type NotationMode = 'groupe' | 'individuel';

/** Codes de statut HTTP */
export type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500;

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/** Grille de notation */
export interface GradingScale {
  id: UUID;
  type: GradingScaleType;
  targetId: UUID;
  notationMode: NotationMode;
  title: string;
  isValidated: boolean;
  createdBy: UUID;
  projectId?: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  criteria?: GradingCriterion[];
}

/** Critère de notation */
export interface GradingCriterion {
  id: UUID;
  label: string;
  maxPoints: number;
  weight?: number;
  commentEnabled: boolean;
  gradingScaleId?: UUID;
  gradingScale?: Partial<GradingScale>;
}

/** Résultat de notation */
export interface GradingResult {
  id: UUID;
  targetGroupId?: UUID;
  targetStudentId?: UUID;
  score: number;
  comment?: string;
  createdBy: UUID;
  gradingCriterionId: UUID;
  createdAt: Timestamp;
  gradingCriterion?: GradingCriterion;
}

/** Projet */
export interface Project {
  id: UUID;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isPublished: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  studentBatchId?: UUID;
  createdBy: UUID;
}

/** Groupe de projet */
export interface ProjectGroup {
  id: UUID;
  name: string;
  projectId: UUID;
  members: UUID[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Étape de projet */
export interface ProjectStep {
  id: UUID;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  order: number;
  projectId: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Promotion d'étudiants */
export interface StudentBatch {
  id: UUID;
  name: string;
  year?: number;
  state: string;
  tags?: string;
  students?: Student[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Étudiant */
export interface Student {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
}

/** Définition de rapport */
export interface ReportDefinition {
  id: UUID;
  title: string;
  template: string;
  instructions?: string;
  projectId?: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// DTOs DE CRÉATION
// ============================================================================

/** DTO pour créer une grille de notation */
export interface CreateGradingScaleDto {
  projectId?: UUID;
  type: GradingScaleType;
  targetId: UUID;
  notationMode: NotationMode;
  title: string;
  criteria?: CreateGradingCriterionDto[];
}

/** DTO pour créer un critère de notation */
export interface CreateGradingCriterionDto {
  label: string;
  maxPoints: number;
  weight?: number;
  commentEnabled?: boolean;
}

/** DTO pour créer des résultats de notation */
export interface CreateGradingResultDto {
  targetGroupId?: UUID;
  targetStudentId?: UUID;
  results: GradingResultItemDto[];
}

/** Item de résultat de notation */
export interface GradingResultItemDto {
  gradingCriterionId: UUID;
  score: number;
  comment?: string;
}

/** DTO pour créer un projet */
export interface CreateProjectDto {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  studentBatchId?: UUID;
}

/** DTO pour créer un groupe de projet */
export interface CreateProjectGroupDto {
  name: string;
  projectId: UUID;
  members: UUID[];
}

/** DTO pour créer une étape */
export interface CreateProjectStepDto {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  order: number;
}

/** DTO pour créer une promotion */
export interface CreateStudentBatchDto {
  name: string;
  year?: number;
  students?: CreateStudentDto[];
}

/** DTO pour créer un étudiant */
export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  email: string;
}

/** DTO pour créer une définition de rapport */
export interface CreateReportDefinitionDto {
  title: string;
  template: string;
  instructions?: string;
}

// ============================================================================
// DTOs DE MISE À JOUR
// ============================================================================

/** DTO pour mettre à jour une grille de notation */
export interface UpdateGradingScaleDto {
  title?: string;
}

/** DTO pour mettre à jour un critère */
export interface UpdateGradingCriterionDto {
  label?: string;
  maxPoints?: number;
  weight?: number;
  commentEnabled?: boolean;
}

/** DTO pour mettre à jour un résultat */
export interface UpdateGradingResultDto {
  score?: number;
  comment?: string;
}

/** DTO pour mettre à jour un projet */
export interface UpdateProjectDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isPublished?: boolean;
}

/** DTO pour mettre à jour un groupe */
export interface UpdateProjectGroupDto {
  name?: string;
  members?: UUID[];
}

/** DTO pour mettre à jour une étape */
export interface UpdateProjectStepDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  order?: number;
}

/** DTO pour mettre à jour une promotion */
export interface UpdateStudentBatchDto {
  name?: string;
  year?: number;
  state?: string;
  tags?: string;
}

/** DTO pour mettre à jour une définition de rapport */
export interface UpdateReportDefinitionDto {
  title?: string;
  template?: string;
  instructions?: string;
}

// ============================================================================
// DTOs SPÉCIAUX
// ============================================================================

/** DTO pour soumettre un rapport */
export interface SubmitReportDto {
  content: string;
  attachments?: string[];
}

/** DTO pour l'authentification Liveblocks */
export interface LiveblocksAuthDto {
  room: string;
  userId?: UUID;
}

// ============================================================================
// RÉPONSES D'ERREUR
// ============================================================================

/** Réponse d'erreur standard */
export interface ApiError {
  message: string | string[];
  error: string;
  statusCode: HttpStatusCode;
}

/** Erreur de validation */
export interface ValidationError extends ApiError {
  statusCode: 400;
  error: 'Bad Request';
}

/** Erreur d'authentification */
export interface AuthenticationError extends ApiError {
  statusCode: 401;
  error: 'Unauthorized';
}

/** Erreur d'autorisation */
export interface AuthorizationError extends ApiError {
  statusCode: 403;
  error: 'Forbidden';
}

/** Erreur de ressource non trouvée */
export interface NotFoundError extends ApiError {
  statusCode: 404;
  error: 'Not Found';
}

/** Erreur serveur */
export interface ServerError extends ApiError {
  statusCode: 500;
  error: 'Internal Server Error';
}

// ============================================================================
// TYPES UTILITAIRES
// ============================================================================

/** Configuration pour créer une grille complète */
export interface GradingScaleConfig {
  type: GradingScaleType;
  targetId: UUID;
  notationMode: NotationMode;
  title: string;
  projectId?: UUID;
  criteria?: CreateGradingCriterionDto[];
}

/** Évaluation complète */
export interface CompleteEvaluation {
  targetGroupId?: UUID;
  targetStudentId?: UUID;
  evaluations: {
    criterionId: UUID;
    score: number;
    comment?: string;
  }[];
}

/** Résumé d'évaluation */
export interface EvaluationSummary {
  grilleId: UUID;
  titre: string;
  type: GradingScaleType;
  mode: NotationMode;
  nombreEvaluations: number;
  moyenneGenerale: string;
  dateCreation: Timestamp;
}

/** Métriques de l'API */
export interface ApiMetrics {
  totalRequests: number;
  successRate: string;
  errorRate: string;
  averageResponseTime: string;
  errorBreakdown: Record<string, number>;
}

/** Options de requête */
export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
}

/** Réponse de l'API */
export interface ApiResponse<T = Response> {
  data: T;
  status: HttpStatusCode;
  headers: Record<string, string>;
}

// ============================================================================
// GUARDS DE TYPE
// ============================================================================

/** Vérifie si une valeur est un UUID valide */
export function isValidUUID(value: string): value is UUID {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/** Vérifie si un type de grille est valide */
export function isValidGradingScaleType(value: string): value is GradingScaleType {
  return ['livrable', 'rapport', 'soutenance'].includes(value);
}

/** Vérifie si un mode de notation est valide */
export function isValidNotationMode(value: string): value is NotationMode {
  return ['groupe', 'individuel'].includes(value);
}

/** Vérifie si une grille est validée */
export function isGradingScaleValidated(scale: GradingScale): boolean {
  return scale.isValidated;
}

/** Vérifie si une erreur est une erreur de validation */
export function isValidationError(error: ApiError): error is ValidationError {
  return error.statusCode === 400;
}

/** Vérifie si une erreur est une erreur d'autorisation */
export function isAuthorizationError(error: ApiError): error is AuthorizationError {
  return error.statusCode === 403;
}

// ============================================================================
// CONSTANTES
// ============================================================================

/** Types de grilles disponibles */
export const GRADING_SCALE_TYPES: GradingScaleType[] = ['livrable', 'rapport', 'soutenance'];

/** Modes de notation disponibles */
export const NOTATION_MODES: NotationMode[] = ['groupe', 'individuel'];

/** Codes de statut HTTP supportés */
export const HTTP_STATUS_CODES: HttpStatusCode[] = [200, 201, 400, 401, 403, 404, 500];

/** Configuration par défaut pour les critères */
export const DEFAULT_CRITERION_CONFIG: Partial<CreateGradingCriterionDto> = {
  weight: 1.0,
  commentEnabled: true
};

/** Configuration par défaut pour les requêtes */
export const DEFAULT_REQUEST_OPTIONS: Partial<RequestOptions> = {
  timeout: 10000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json'
  }
};

// ============================================================================
// TYPES D'EXPORT
// ============================================================================

/** Tous les types principaux */
export type MainEntities = 
  | GradingScale 
  | GradingCriterion 
  | GradingResult 
  | Project 
  | ProjectGroup 
  | ProjectStep 
  | StudentBatch 
  | ReportDefinition;

/** Tous les DTOs de création */
export type CreateDtos = 
  | CreateGradingScaleDto 
  | CreateGradingCriterionDto 
  | CreateGradingResultDto 
  | CreateProjectDto 
  | CreateProjectGroupDto 
  | CreateProjectStepDto 
  | CreateStudentBatchDto 
  | CreateReportDefinitionDto;

/** Tous les DTOs de mise à jour */
export type UpdateDtos = 
  | UpdateGradingScaleDto 
  | UpdateGradingCriterionDto 
  | UpdateGradingResultDto 
  | UpdateProjectDto 
  | UpdateProjectGroupDto 
  | UpdateProjectStepDto 
  | UpdateStudentBatchDto 
  | UpdateReportDefinitionDto;

/** Toutes les erreurs */
export type ApiErrors = 
  | ValidationError 
  | AuthenticationError 
  | AuthorizationError 
  | NotFoundError 
  | ServerError;

// ============================================================================
// INTERFACES POUR CLIENT API
// ============================================================================

/** Interface pour un client API */
export interface ApiClient {
  get<T = Response>(endpoint: string, options?: Partial<RequestOptions>): Promise<T>;
  post<T = Response>(endpoint: string, body?: Response, options?: Partial<RequestOptions>): Promise<T>;
  put<T = Response>(endpoint: string, body?: Response, options?: Partial<RequestOptions>): Promise<T>;
  patch<T = Response>(endpoint: string, body?: Response, options?: Partial<RequestOptions>): Promise<T>;
  delete<T = Response>(endpoint: string, options?: Partial<RequestOptions>): Promise<T>;
}

/** Interface pour un gestionnaire de grilles de notation */
export interface GradingScaleManager {
  create(config: GradingScaleConfig): Promise<GradingScale>;
  get(id: UUID): Promise<GradingScale>;
  update(id: UUID, updates: UpdateGradingScaleDto): Promise<GradingScale>;
  validate(id: UUID): Promise<GradingScale>;
  delete(id: UUID): Promise<void>;
  addCriterion(id: UUID, criterion: CreateGradingCriterionDto): Promise<GradingCriterion>;
  updateCriterion(criterionId: UUID, updates: UpdateGradingCriterionDto): Promise<GradingCriterion>;
  deleteCriterion(criterionId: UUID): Promise<void>;
  addResults(id: UUID, results: CreateGradingResultDto): Promise<GradingResult>;
  getResults(id: UUID): Promise<GradingResult[]>;
  updateResult(resultId: UUID, updates: UpdateGradingResultDto): Promise<GradingResult>;
}

/** Interface pour un moniteur d'API */
export interface ApiMonitor {
  startMonitoring(): void;
  stopMonitoring(): void;
  getMetrics(): ApiMetrics;
  reset(): void;
}

// ============================================================================
// EXPORT PAR DÉFAUT
// ============================================================================

export default {
  // Utilitaires
  isValidUUID,
  isValidGradingScaleType,
  isValidNotationMode,
  
  // Constantes
  GRADING_SCALE_TYPES,
  NOTATION_MODES,
  DEFAULT_CRITERION_CONFIG,
  DEFAULT_REQUEST_OPTIONS
};