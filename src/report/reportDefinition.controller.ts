import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ReportDefinitionService } from "./reportDefinition.service";
import { CreateReportDefinitionDto } from "./dto/create-report-definition.dto";
import { PatchReportDefinitionDto } from "./dto/update-report-definition.dto";
import { ListReportDefinitionsDto } from "./dto/list-report-definitions.dto";

@ApiTags("Report Definitions")
@Controller("report-definitions")
export class ReportDefinitionController {
  constructor(
    private readonly reportDefinitionService: ReportDefinitionService,
  ) {}

  /**
   * Crée une nouvelle définition de rapport.
   * POST /report-definitions
   * Body: CreateReportDefinitionDto
   * Réponse: 201 (créé), 400 (erreur de validation ou doublon)
   */
  @Post("")
  @ApiResponse({
    status: 201,
    description: "La définition de rapport a été créée avec succès.",
  })
  @ApiResponse({
    status: 400,
    description:
      "Requête invalide - Projet introuvable ou définition déjà existante",
  })
  @ApiBody({
    type: CreateReportDefinitionDto,
    description: "Structure JSON pour la création d'une définition de rapport",
  })
  async create(@Body() reportDefinition: CreateReportDefinitionDto) {
    return this.reportDefinitionService.create(reportDefinition);
  }

  /**
   * Met à jour une définition de rapport par son ID.
   * PATCH /report-definitions/:id
   * Body: PatchReportDefinitionDto
   * Réponse: 200 (ok), 404 (non trouvé)
   */
  @Patch(":id")
  @ApiResponse({
    status: 200,
    description: "La définition de rapport a été mise à jour avec succès.",
  })
  @ApiResponse({
    status: 404,
    description: "Définition de rapport non trouvée",
  })
  @ApiBody({
    type: PatchReportDefinitionDto,
    description: "Structure JSON pour la mise à jour d'une définition de rapport",
  })
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
  async patch(
    @Body() reportDefinition: PatchReportDefinitionDto,
    @Param("id") id: string,
  ) {
    return this.reportDefinitionService.update(id, reportDefinition);
  }

  /**
   * Récupère une définition de rapport par son ID.
   * GET /report-definitions/:id
   * Réponse: 200 (ok), 404 (non trouvé)
   */
  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "La définition de rapport a été récupérée avec succès.",
  })
  @ApiResponse({
    status: 404,
    description: "Définition de rapport non trouvée",
  })
  async findOne(@Param("id") id: string) {
    return this.reportDefinitionService.findOne(id);
  }

  /**
   * Récupère la définition de rapport d'un projet.
   * GET /report-definitions/project/:projectId
   * Réponse: 200 (ok), 404 (non trouvé)
   */
  @Get("project/:projectId")
  @ApiResponse({
    status: 200,
    description:
      "La définition de rapport du projet a été récupérée avec succès.",
  })
  @ApiResponse({
    status: 404,
    description: "Aucune définition de rapport trouvée pour ce projet",
  })
  async findByProject(@Param("projectId") projectId: string) {
    return this.reportDefinitionService.findByProjectId(projectId);
  }

  /**
   * Met à jour la définition de rapport d'un projet.
   * PATCH /report-definitions/project/:projectId
   * Body: PatchReportDefinitionDto
   * Réponse: 200 (ok), 404 (non trouvé)
   */
  @Patch("project/:projectId")
  @ApiResponse({
    status: 200,
    description:
      "La définition de rapport du projet a été mise à jour avec succès.",
  })
  @ApiResponse({
    status: 404,
    description: "Aucune définition de rapport trouvée pour ce projet",
  })
  @ApiBody({
    type: PatchReportDefinitionDto,
    description: "Structure JSON pour la mise à jour d'une définition de rapport",
  })
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
  async patchByProject(
    @Body() reportDefinition: PatchReportDefinitionDto,
    @Param("projectId") projectId: string,
  ) {
    return this.reportDefinitionService.updateByProjectId(
      projectId,
      reportDefinition,
    );
  }

  /**
   * Récupère toutes les définitions de rapport.
   * GET /report-definitions
   * Réponse: 200 (ok)
   */
  @Get("")
  @ApiResponse({
    status: 200,
    description: "Les définitions de rapport ont été récupérées avec succès.",
  })
  async findAll(@Query() params: ListReportDefinitionsDto) {
    return this.reportDefinitionService.findAll(params);
  }

  /**
   * Supprime une définition de rapport par son ID.
   * DELETE /report-definitions/:id
   * Réponse: 200 (ok), 404 (non trouvé)
   */
  @Delete(":id")
  @ApiResponse({
    status: 200,
    description: "La définition de rapport a été supprimée avec succès.",
  })
  @ApiResponse({
    status: 404,
    description: "Définition de rapport non trouvée",
  })
  async delete(@Param("id") id: string) {
    return this.reportDefinitionService.delete(id);
  }
}
