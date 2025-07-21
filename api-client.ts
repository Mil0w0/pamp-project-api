/**
 * Client API complet pour PAMP Project API
 * Version: 1.0.0
 * Dernière mise à jour: 2025-01-12
 */

import {
  UUID,
  GradingScale,
  GradingCriterion,
  GradingResult,
  Project,
  ProjectGroup,
  ProjectStep,
  StudentBatch,
  ReportDefinition,
  CreateGradingScaleDto,
  CreateGradingCriterionDto,
  CreateGradingResultDto,
  UpdateGradingScaleDto,
  UpdateGradingCriterionDto,
  UpdateGradingResultDto,
  CreateProjectDto,
  UpdateProjectDto,
  CreateProjectGroupDto,
  UpdateProjectGroupDto,
  CreateProjectStepDto,
  UpdateProjectStepDto,
  CreateStudentBatchDto,
  UpdateStudentBatchDto,
  CreateReportDefinitionDto,
  UpdateReportDefinitionDto,
  SubmitReportDto,
  LiveblocksAuthDto,
  RequestOptions,
  ApiMetrics,
  GradingScaleConfig,
  CompleteEvaluation,
  EvaluationSummary,
  DEFAULT_REQUEST_OPTIONS,
  isValidUUID,
  isValidGradingScaleType,
  isValidNotationMode
} from './types';

// ============================================================================
// CLASSES D'ERREUR PERSONNALISÉES
// ============================================================================

class PampApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'PampApiError';
  }
}

class ValidationError extends PampApiError {
  constructor(message: string, originalError?: Error) {
    super(message, 400, originalError);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends PampApiError {
  constructor(message: string = 'Authentication required', originalError?: Error) {
    super(message, 401, originalError);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends PampApiError {
  constructor(message: string = 'Action forbidden', originalError?: Error) {
    super(message, 403, originalError);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends PampApiError {
  constructor(message: string = 'Resource not found', originalError?: Error) {
    super(message, 404, originalError);
    this.name = 'NotFoundError';
  }
}

class ServerError extends PampApiError {
  constructor(message: string = 'Internal server error', originalError?: Error) {
    super(message, 500, originalError);
    this.name = 'ServerError';
  }
}

// ============================================================================
// CLIENT API PRINCIPAL
// ============================================================================

export class PampApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private authToken?: string;
  private metrics: {
    requests: number;
    successes: number;
    errors: number;
    responseTime: number[];
    errorTypes: Record<string, number>;
  };

  constructor(
    baseUrl: string = 'http://localhost:3001',
    defaultOptions: Partial<RequestOptions> = {}
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = {
      ...DEFAULT_REQUEST_OPTIONS.headers,
      ...defaultOptions.headers
    };
    this.metrics = {
      requests: 0,
      successes: 0,
      errors: 0,
      responseTime: [],
      errorTypes: {}
    };
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /**
   * Définir le token d'authentification
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Supprimer le token d'authentification
   */
  clearAuthToken(): void {
    this.authToken = undefined;
  }

  /**
   * Obtenir les métriques de l'API
   */
  getMetrics(): ApiMetrics {
    const avgResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length
      : 0;

    return {
      totalRequests: this.metrics.requests,
      successRate: (this.metrics.successes / this.metrics.requests * 100).toFixed(2) + '%',
      errorRate: (this.metrics.errors / this.metrics.requests * 100).toFixed(2) + '%',
      averageResponseTime: avgResponseTime.toFixed(2) + 'ms',
      errorBreakdown: { ...this.metrics.errorTypes }
    };
  }

  /**
   * Réinitialiser les métriques
   */
  resetMetrics(): void {
    this.metrics = {
      requests: 0,
      successes: 0,
      errors: 0,
      responseTime: [],
      errorTypes: {}
    };
  }

  // ============================================================================
  // MÉTHODES HTTP DE BASE
  // ============================================================================

  private async request<T = Request>(
    method: string,
    endpoint: string,
    body?: unknown,
    options: Partial<RequestOptions> = {}
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.requests++;

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...options.headers
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, fetchOptions);
      const responseTime = Date.now() - startTime;
      this.metrics.responseTime.push(responseTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        this.handleError(response.status, errorData);
      }

      const data = await response.json();
      this.metrics.successes++;
      return data;
    } catch (error) {
      this.metrics.errors++;
      const errorType = this.categorizeError(error);
      this.metrics.errorTypes[errorType] = (this.metrics.errorTypes[errorType] || 0) + 1;
      throw error;
    }
  }

  private handleError(status: number, errorData: Error): never {
    const message = Array.isArray(errorData.message) 
      ? errorData.message.join(', ') 
      : errorData.message || 'Unknown error';

    switch (status) {
      case 400:
        throw new ValidationError(message, errorData);
      case 401:
        throw new AuthenticationError(message, errorData);
      case 403:
        throw new AuthorizationError(message, errorData);
      case 404:
        throw new NotFoundError(message, errorData);
      case 500:
        throw new ServerError(message, errorData);
      default:
        throw new PampApiError(message, status, errorData);
    }
  }

  private categorizeError(error: Error): string {
    if (error instanceof ValidationError) return 'Validation';
    if (error instanceof AuthenticationError) return 'Authentication';
    if (error instanceof AuthorizationError) return 'Authorization';
    if (error instanceof NotFoundError) return 'NotFound';
    if (error instanceof ServerError) return 'ServerError';
    return 'Unknown';
  }

  // Méthodes HTTP publiques
  async get<T = Request>(endpoint: string, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T = Request>(endpoint: string, body?: unknown, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>('POST', endpoint, body, options);
  }

  async put<T = Request>(endpoint: string, body?: unknown, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>('PUT', endpoint, body, options);
  }

  async patch<T = Request>(endpoint: string, body?: unknown, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>('PATCH', endpoint, body, options);
  }

  async delete<T = Request>(endpoint: string, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  // ============================================================================
  // ENDPOINT DE TEST
  // ============================================================================

  /**
   * Tester la connexion à l'API
   */
  async testConnection(): Promise<{ message: string }> {
    return this.get('/');
  }

  // ============================================================================
  // GRILLES DE NOTATION
  // ============================================================================

  /**
   * Créer une grille de notation
   */
  async createGradingScale(data: CreateGradingScaleDto): Promise<GradingScale> {
    this.validateGradingScaleData(data);
    return this.post('/grading-scales', data);
  }

  /**
   * Récupérer une grille de notation
   */
  async getGradingScale(id: UUID): Promise<GradingScale> {
    this.validateUUID(id, 'Grading scale ID');
    return this.get(`/grading-scales/${id}`);
  }

  /**
   * Modifier une grille de notation
   */
  async updateGradingScale(id: UUID, data: UpdateGradingScaleDto): Promise<GradingScale> {
    this.validateUUID(id, 'Grading scale ID');
    return this.patch(`/grading-scales/${id}`, data);
  }

  /**
   * Valider une grille de notation
   */
  async validateGradingScale(id: UUID): Promise<GradingScale> {
    this.validateUUID(id, 'Grading scale ID');
    return this.post(`/grading-scales/${id}/validate`);
  }

  /**
   * Supprimer une grille de notation
   */
  async deleteGradingScale(id: UUID): Promise<void> {
    this.validateUUID(id, 'Grading scale ID');
    return this.delete(`/grading-scales/${id}`);
  }

  // ============================================================================
  // CRITÈRES DE NOTATION
  // ============================================================================

  /**
   * Ajouter un critère à une grille
   */
  async addGradingCriterion(scaleId: UUID, data: CreateGradingCriterionDto): Promise<GradingCriterion> {
    this.validateUUID(scaleId, 'Grading scale ID');
    this.validateCriterionData(data);
    return this.post(`/grading-scales/${scaleId}/criteria`, data);
  }

  /**
   * Modifier un critère
   */
  async updateGradingCriterion(criterionId: UUID, data: UpdateGradingCriterionDto): Promise<GradingCriterion> {
    this.validateUUID(criterionId, 'Criterion ID');
    return this.put(`/grading-scales/criteria/${criterionId}`, data);
  }

  /**
   * Supprimer un critère
   */
  async deleteGradingCriterion(criterionId: UUID): Promise<void> {
    this.validateUUID(criterionId, 'Criterion ID');
    return this.delete(`/grading-scales/criteria/${criterionId}`);
  }

  // ============================================================================
  // RÉSULTATS DE NOTATION
  // ============================================================================

  /**
   * Enregistrer des résultats de notation
   */
  async addGradingResults(scaleId: UUID, data: CreateGradingResultDto): Promise<GradingResult> {
    this.validateUUID(scaleId, 'Grading scale ID');
    this.validateResultsData(data);
    return this.post(`/grading-scales/${scaleId}/results`, data);
  }

  /**
   * Récupérer les résultats d'une grille
   */
  async getGradingResults(scaleId: UUID): Promise<GradingResult[]> {
    this.validateUUID(scaleId, 'Grading scale ID');
    return this.get(`/grading-scales/${scaleId}/results`);
  }

  /**
   * Modifier un résultat
   */
  async updateGradingResult(resultId: UUID, data: UpdateGradingResultDto): Promise<GradingResult> {
    this.validateUUID(resultId, 'Result ID');
    return this.put(`/grading-scales/results/${resultId}`, data);
  }

  // ============================================================================
  // PROJETS
  // ============================================================================

  /**
   * Créer un projet
   */
  async createProject(data: CreateProjectDto): Promise<Project> {
    return this.post('/projects', data);
  }

  /**
   * Lister les projets
   */
  async getProjects(): Promise<Project[]> {
    return this.get('/projects');
  }

  /**
   * Récupérer un projet
   */
  async getProject(id: UUID): Promise<Project> {
    this.validateUUID(id, 'Project ID');
    return this.get(`/projects/${id}`);
  }

  /**
   * Modifier un projet
   */
  async updateProject(id: UUID, data: UpdateProjectDto): Promise<Project> {
    this.validateUUID(id, 'Project ID');
    return this.patch(`/projects/${id}`, data);
  }

  /**
   * Supprimer un projet
   */
  async deleteProject(id: UUID): Promise<void> {
    this.validateUUID(id, 'Project ID');
    return this.delete(`/projects/${id}`);
  }

  /**
   * Copier un projet
   */
  async copyProject(id: UUID): Promise<Project> {
    this.validateUUID(id, 'Project ID');
    return this.post(`/projects/${id}`);
  }

  /**
   * Récupérer les grilles de notation d'un projet
   */
  async getProjectGradingScales(id: UUID): Promise<GradingScale[]> {
    this.validateUUID(id, 'Project ID');
    return this.get(`/projects/${id}/grading-scales`);
  }

  // ============================================================================
  // GROUPES DE PROJET
  // ============================================================================

  /**
   * Créer un groupe de projet
   */
  async createProjectGroup(data: CreateProjectGroupDto): Promise<ProjectGroup> {
    return this.post('/projectGroups', data);
  }

  /**
   * Lister les groupes
   */
  async getProjectGroups(): Promise<ProjectGroup[]> {
    return this.get('/projectGroups');
  }

  /**
   * Récupérer un groupe
   */
  async getProjectGroup(id: UUID): Promise<ProjectGroup> {
    this.validateUUID(id, 'Project group ID');
    return this.get(`/projectGroups/${id}`);
  }

  /**
   * Modifier un groupe
   */
  async updateProjectGroup(id: UUID, data: UpdateProjectGroupDto): Promise<ProjectGroup> {
    this.validateUUID(id, 'Project group ID');
    return this.patch(`/projectGroups/${id}`, data);
  }

  /**
   * Supprimer un groupe
   */
  async deleteProjectGroup(id: UUID): Promise<void> {
    this.validateUUID(id, 'Project group ID');
    return this.delete(`/projectGroups/${id}`);
  }

  /**
   * Récupérer mes groupes (étudiant)
   */
  async getMyProjectGroups(): Promise<ProjectGroup[]> {
    return this.get('/projectGroups/myGroups');
  }

  /**
   * Soumettre un rapport
   */
  async submitReport(groupId: UUID, data: SubmitReportDto): Promise<Request> {
    this.validateUUID(groupId, 'Project group ID');
    return this.post(`/projectGroups/${groupId}/submit-report`, data);
  }

  // ============================================================================
  // ÉTAPES DE PROJET
  // ============================================================================

  /**
   * Créer/remplacer les étapes d'un projet
   */
  async setProjectSteps(projectId: UUID, steps: CreateProjectStepDto[]): Promise<ProjectStep[]> {
    this.validateUUID(projectId, 'Project ID');
    return this.post(`/projects/${projectId}/steps`, steps);
  }

  /**
   * Lister les étapes d'un projet
   */
  async getProjectSteps(projectId: UUID): Promise<ProjectStep[]> {
    this.validateUUID(projectId, 'Project ID');
    return this.get(`/projects/${projectId}/steps`);
  }

  /**
   * Récupérer une étape
   */
  async getProjectStep(projectId: UUID, stepId: UUID): Promise<ProjectStep> {
    this.validateUUID(projectId, 'Project ID');
    this.validateUUID(stepId, 'Step ID');
    return this.get(`/projects/${projectId}/steps/${stepId}`);
  }

  /**
   * Modifier une étape
   */
  async updateProjectStep(projectId: UUID, stepId: UUID, data: UpdateProjectStepDto): Promise<ProjectStep> {
    this.validateUUID(projectId, 'Project ID');
    this.validateUUID(stepId, 'Step ID');
    return this.patch(`/projects/${projectId}/steps/${stepId}`, data);
  }

  /**
   * Supprimer une étape
   */
  async deleteProjectStep(projectId: UUID, stepId: UUID): Promise<void> {
    this.validateUUID(projectId, 'Project ID');
    this.validateUUID(stepId, 'Step ID');
    return this.delete(`/projects/${projectId}/steps/${stepId}`);
  }

  // ============================================================================
  // PROMOTIONS D'ÉTUDIANTS
  // ============================================================================

  /**
   * Créer une promotion
   */
  async createStudentBatch(data: CreateStudentBatchDto): Promise<StudentBatch> {
    return this.post('/student-batches', data);
  }

  /**
   * Lister les promotions
   */
  async getStudentBatches(): Promise<StudentBatch[]> {
    return this.get('/student-batches');
  }

  /**
   * Récupérer une promotion
   */
  async getStudentBatch(id: UUID): Promise<StudentBatch> {
    this.validateUUID(id, 'Student batch ID');
    return this.get(`/student-batches/${id}`);
  }

  /**
   * Modifier une promotion
   */
  async updateStudentBatch(id: UUID, data: UpdateStudentBatchDto): Promise<StudentBatch> {
    this.validateUUID(id, 'Student batch ID');
    return this.patch(`/student-batches/${id}`, data);
  }

  /**
   * Supprimer une promotion
   */
  async deleteStudentBatch(id: UUID): Promise<void> {
    this.validateUUID(id, 'Student batch ID');
    return this.delete(`/student-batches/${id}`);
  }

  /**
   * Récupérer mes promotions (étudiant)
   */
  async getMyStudentBatches(): Promise<StudentBatch[]> {
    return this.get('/student-batches/myStudentBatches');
  }

  // ============================================================================
  // DÉFINITIONS DE RAPPORT
  // ============================================================================

  /**
   * Créer une définition de rapport
   */
  async createReportDefinition(data: CreateReportDefinitionDto): Promise<ReportDefinition> {
    return this.post('/report-definitions', data);
  }

  /**
   * Lister les définitions
   */
  async getReportDefinitions(): Promise<ReportDefinition[]> {
    return this.get('/report-definitions');
  }

  /**
   * Récupérer une définition
   */
  async getReportDefinition(id: UUID): Promise<ReportDefinition> {
    this.validateUUID(id, 'Report definition ID');
    return this.get(`/report-definitions/${id}`);
  }

  /**
   * Modifier une définition
   */
  async updateReportDefinition(id: UUID, data: UpdateReportDefinitionDto): Promise<ReportDefinition> {
    this.validateUUID(id, 'Report definition ID');
    return this.patch(`/report-definitions/${id}`, data);
  }

  /**
   * Supprimer une définition
   */
  async deleteReportDefinition(id: UUID): Promise<void> {
    this.validateUUID(id, 'Report definition ID');
    return this.delete(`/report-definitions/${id}`);
  }

  /**
   * Récupérer la définition de rapport d'un projet
   */
  async getProjectReportDefinition(projectId: UUID): Promise<ReportDefinition> {
    this.validateUUID(projectId, 'Project ID');
    return this.get(`/report-definitions/project/${projectId}`);
  }

  /**
   * Modifier la définition de rapport d'un projet
   */
  async updateProjectReportDefinition(projectId: UUID, data: UpdateReportDefinitionDto): Promise<ReportDefinition> {
    this.validateUUID(projectId, 'Project ID');
    return this.patch(`/report-definitions/project/${projectId}`, data);
  }

  /**
   * Créer/remplacer la définition de rapport d'un projet
   */
  async setProjectReportDefinition(projectId: UUID, data: CreateReportDefinitionDto): Promise<ReportDefinition> {
    this.validateUUID(projectId, 'Project ID');
    return this.put(`/projects/${projectId}/report-definition`, data);
  }

  /**
   * Récupérer la définition de rapport d'un projet (via projects)
   */
  async getProjectReportDefinitionViaProjects(projectId: UUID): Promise<ReportDefinition> {
    this.validateUUID(projectId, 'Project ID');
    return this.get(`/projects/${projectId}/report-definition`);
  }

  // ============================================================================
  // LIVEBLOCKS
  // ============================================================================

  /**
   * Authentification Liveblocks
   */
  async authenticateLiveblocks(data: LiveblocksAuthDto): Promise<Request> {
    return this.post('/liveblocks/auth', data);
  }

  // ============================================================================
  // MÉTHODES UTILITAIRES AVANCÉES
  // ============================================================================

  /**
   * Créer une grille de notation complète avec validation automatique
   */
  async createCompleteGradingScale(config: GradingScaleConfig): Promise<{
    scale: GradingScale;
    validated: GradingScale;
  }> {
    // Créer la grille
    const scale = await this.createGradingScale(config);
    
    // Ajouter les critères si pas déjà inclus
    if (config.criteria && config.criteria.length > 0 && (!scale.criteria || scale.criteria.length === 0)) {
      for (const criterion of config.criteria) {
        await this.addGradingCriterion(scale.id, criterion);
      }
    }
    
    // Valider automatiquement
    const validated = await this.validateGradingScale(scale.id);
    
    return { scale, validated };
  }

  /**
   * Évaluer complètement un groupe/étudiant
   */
  async evaluateComplete(
    scaleId: UUID,
    evaluation: CompleteEvaluation
  ): Promise<{
    results: GradingResult;
    summary: EvaluationSummary;
  }> {
    // Convertir le format d'évaluation
   const resultsData: CreateGradingResultDto = {
  targetGroupId: evaluation.targetGroupId,
  targetStudentId: evaluation.targetStudentId,
  results: evaluation.evaluations.map(item => ({
    gradingCriterionId: item.criterionId,
    score: item.score,
    comment: item.comment
  }))
};
    
    // Enregistrer les résultats
    const results = await this.addGradingResults(scaleId, resultsData);
    
    // Récupérer la grille pour le résumé
    const scale = await this.getGradingScale(scaleId);
    
    // Calculer la moyenne
    const totalScore = evaluation.evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    const averageScore = totalScore / evaluation.evaluations.length;
    
    const summary: EvaluationSummary = {
      grilleId: scale.id,
      titre: scale.title,
      type: scale.type,
      mode: scale.notationMode,
      nombreEvaluations: evaluation.evaluations.length,
      moyenneGenerale: averageScore.toFixed(2),
      dateCreation: scale.createdAt
    };
    
    return { results, summary };
  }

  /**
   * Générer un UUID v4
   */
  generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ============================================================================
  // MÉTHODES DE VALIDATION
  // ============================================================================

  private validateUUID(uuid: string, fieldName: string): void {
    if (!isValidUUID(uuid)) {
      throw new ValidationError(`${fieldName} must be a valid UUID`);
    }
  }

  private validateGradingScaleData(data: CreateGradingScaleDto): void {
    if (!isValidGradingScaleType(data.type)) {
      throw new ValidationError(`Type must be one of: livrable, rapport, soutenance`);
    }
    
    if (!isValidNotationMode(data.notationMode)) {
      throw new ValidationError(`Notation mode must be one of: groupe, individuel`);
    }
    
    this.validateUUID(data.targetId, 'Target ID');
    
    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationError('Title is required');
    }
    
    if (data.projectId) {
      this.validateUUID(data.projectId, 'Project ID');
    }
  }

  private validateCriterionData(data: CreateGradingCriterionDto): void {
    if (!data.label || data.label.trim().length === 0) {
      throw new ValidationError('Criterion label is required');
    }
    
    if (data.maxPoints <= 0) {
      throw new ValidationError('Max points must be greater than 0');
    }
    
    if (data.weight !== undefined && (data.weight < 0 || data.weight > 1)) {
      throw new ValidationError('Weight must be between 0 and 1');
    }
  }

  private validateResultsData(data: CreateGradingResultDto): void {
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      throw new ValidationError('Results must be a non-empty array');
    }
    
    for (const result of data.results) {
      this.validateUUID(result.gradingCriterionId, 'Grading criterion ID');
      
      if (result.score < 0) {
        throw new ValidationError('Score must be greater than or equal to 0');
      }
    }
    
    if (data.targetGroupId) {
      this.validateUUID(data.targetGroupId, 'Target group ID');
    }
    
    if (data.targetStudentId) {
      this.validateUUID(data.targetStudentId, 'Target student ID');
    }
  }
}

// ============================================================================
// INSTANCE GLOBALE (OPTIONNELLE)
// ============================================================================

/**
 * Instance globale du client API
 * Peut être configurée une fois et utilisée partout
 */
export const pampApi = new PampApiClient();

// ============================================================================
// UTILITAIRES D'EXPORT
// ============================================================================

export {
 
  // Erreurs
  PampApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
  
  // Types (ré-export depuis types.ts)
  UUID,
  GradingScale,
  GradingCriterion,
  GradingResult,
  Project,
  ProjectGroup,
  ProjectStep,
  StudentBatch,
  ReportDefinition,
  CreateGradingScaleDto,
  UpdateGradingScaleDto,
  GradingScaleConfig,
  CompleteEvaluation,
  EvaluationSummary,
  ApiMetrics
};