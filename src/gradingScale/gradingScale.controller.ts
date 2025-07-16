import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
  Logger,
} from "@nestjs/common";
import {
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { GradingScaleService } from "./gradingScale.service";
import { CreateGradingScaleDto } from "./dto/create-grading-scale.dto";
import { UpdateGradingScaleDto } from "./dto/update-grading-scale.dto";
import { CreateGradingResultDto } from "./dto/create-grading-result.dto";
import { GradingResult } from "./gradingResult.entity";
import { CreateGradingCriterionDto } from "./dto/create-grading-criterion.dto";
import { UpdateGradingResultDto } from "./dto/update-grading-result.dto";
import { UpdateGradingCriterionDto } from "./dto/update-grading-criterion.dto";

@ApiTags("GradingScales")
@Controller("grading-scales")
export class GradingScaleController {
  private readonly logger = new Logger(GradingScaleController.name);
  constructor(private readonly gradingScaleService: GradingScaleService) {}

  @Post()
  @ApiOperation({
    summary: "Créer une grille de notation",
    description:
      "Crée une nouvelle grille de notation avec ou sans critères intégrés. Supporte les types: livrable, rapport, soutenance.",
  })
  @ApiBody({
    type: CreateGradingScaleDto,
    description: "Données de la grille de notation à créer",
  })
  @ApiResponse({
    status: 201,
    description: "Grille de notation créée avec succès",
    schema: {
      example: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        type: "livrable",
        targetId: "123e4567-e89b-12d3-a456-426614174001",
        notationMode: "groupe",
        title: "Évaluation Livrable 1",
        isValidated: false,
        createdAt: "2025-01-12T10:00:00Z",
        criteria: [],
      },
    },
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createGradingScaleDto: CreateGradingScaleDto,
    @Req() req: Request,
  ) {
    try {
      this.logger.debug(
        `Received request body: ${JSON.stringify(createGradingScaleDto, null, 2)}`,
      );

      const createdBy =
        (req as { user?: { user_id: string } }).user?.user_id ||
        "00000000-0000-0000-0000-000000000000";
      this.logger.debug(`createdBy: ${createdBy}`);

      const result = await this.gradingScaleService.create(
        createGradingScaleDto,
        createdBy,
      );
      this.logger.debug(`Grading scale created successfully: ${result.id}`);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create grading scale: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get(":id")
  @ApiOperation({
    summary: "Récupérer une grille de notation",
    description:
      "Récupère les détails d'une grille de notation par son ID, incluant ses critères associés.",
  })
  @ApiParam({
    name: "id",
    description: "UUID de la grille de notation",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Grille de notation trouvée",
    schema: {
      example: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        type: "livrable",
        targetId: "123e4567-e89b-12d3-a456-426614174001",
        notationMode: "groupe",
        title: "Évaluation Livrable 1",
        isValidated: true,
        createdAt: "2025-01-12T10:00:00Z",
        criteria: [
          {
            id: "123e4567-e89b-12d3-a456-426614174002",
            label: "Qualité du code",
            maxPoints: 20,
            weight: 0.4,
            commentsEnabled: true,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: "Grille de notation non trouvée" })
  async findOne(@Param("id") id: string) {
    return this.gradingScaleService.findOne(id);
  }

  @Patch(":id")
  @ApiBody({ type: UpdateGradingScaleDto })
  @ApiResponse({
    status: 200,
    description: "Grading scale updated successfully",
  })
  @UsePipes(new ValidationPipe())
  async update(
    @Param("id") id: string,
    @Body() updateGradingScaleDto: UpdateGradingScaleDto,
  ) {
    return this.gradingScaleService.update(id, updateGradingScaleDto);
  }

  @Delete(":id")
  @ApiResponse({
    status: 200,
    description: "Grading scale deleted successfully",
  })
  async remove(@Param("id") id: string) {
    return this.gradingScaleService.remove(id);
  }

  @Post(":id/validate")
  @ApiOperation({
    summary: "Valider une grille de notation",
    description:
      "Valide une grille de notation. Une fois validée, la grille ne peut plus être modifiée ou supprimée.",
  })
  @ApiParam({
    name: "id",
    description: "UUID de la grille de notation à valider",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Grille de notation validée avec succès",
    schema: {
      example: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        isValidated: true,
        validatedAt: "2025-01-12T10:30:00Z",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Grille de notation non trouvée" })
  @ApiResponse({
    status: 400,
    description: "Grille déjà validée ou critères manquants",
  })
  async validate(@Param("id") id: string) {
    return this.gradingScaleService.validate(id);
  }

  @Post(":id/criteria")
  @ApiOperation({
    summary: "Ajouter un critère à une grille",
    description:
      "Ajoute un nouveau critère d'évaluation à une grille de notation existante.",
  })
  @ApiParam({
    name: "id",
    description: "UUID de la grille de notation",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiBody({
    type: CreateGradingCriterionDto,
    description: "Données du critère à ajouter",
  })
  @ApiResponse({
    status: 201,
    description: "Critère ajouté avec succès",
    schema: {
      example: {
        id: "123e4567-e89b-12d3-a456-426614174002",
        label: "Qualité du code",
        maxPoints: 20,
        weight: 0.4,
        commentsEnabled: true,
        gradingScaleId: "123e4567-e89b-12d3-a456-426614174000",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Grille de notation non trouvée" })
  @ApiResponse({
    status: 403,
    description: "Grille validée, modification interdite",
  })
  @UsePipes(new ValidationPipe())
  async addCriterion(
    @Param("id") id: string,
    @Body() criterionData: CreateGradingCriterionDto,
  ) {
    return this.gradingScaleService.addCriterion(id, criterionData);
  }

  @Put("criteria/:criterionId")
  @ApiOperation({
    summary: "Modifier un critère",
    description: "Modifie les propriétés d'un critère d'évaluation existant.",
  })
  @ApiParam({
    name: "criterionId",
    description: "UUID du critère à modifier",
    example: "123e4567-e89b-12d3-a456-426614174002",
  })
  @ApiBody({
    type: UpdateGradingCriterionDto,
    description: "Nouvelles données du critère",
  })
  @ApiResponse({
    status: 200,
    description: "Critère modifié avec succès",
    schema: {
      example: {
        id: "123e4567-e89b-12d3-a456-426614174002",
        label: "Qualité du code et architecture",
        maxPoints: 25,
        weight: 0.5,
        commentsEnabled: true,
      },
    },
  })
  @ApiResponse({ status: 404, description: "Critère non trouvé" })
  @ApiResponse({
    status: 403,
    description: "Grille validée, modification interdite",
  })
  @UsePipes(new ValidationPipe())
  async updateCriterion(
    @Param("criterionId") criterionId: string,
    @Body() criterionData: UpdateGradingCriterionDto,
  ) {
    return this.gradingScaleService.updateCriterion(criterionId, criterionData);
  }

  @Delete("criteria/:criterionId")
  @ApiResponse({ status: 200, description: "Criterion deleted successfully" })
  async removeCriterion(@Param("criterionId") criterionId: string) {
    return this.gradingScaleService.removeCriterion(criterionId);
  }

  @Post(":id/results")
  @ApiOperation({
    summary: "Enregistrer des résultats de notation",
    description:
      "Enregistre les résultats d'évaluation pour une grille de notation validée.",
  })
  @ApiParam({
    name: "id",
    description: "UUID de la grille de notation",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiBody({
    type: CreateGradingResultDto,
    description: "Résultats d'évaluation à enregistrer",
  })
  @ApiResponse({
    status: 201,
    description: "Résultats enregistrés avec succès",
    schema: {
      example: {
        id: "123e4567-e89b-12d3-a456-426614174003",
        targetGroupId: "123e4567-e89b-12d3-a456-426614174004",
        score: 18,
        comment: "Excellent travail sur la qualité du code",
        gradingCriterionId: "123e4567-e89b-12d3-a456-426614174002",
        createdBy: "123e4567-e89b-12d3-a456-426614174005",
        createdAt: "2025-01-12T11:00:00Z",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Grille de notation non trouvée" })
  @ApiResponse({
    status: 400,
    description: "Grille non validée ou données invalides",
  })
  @UsePipes(new ValidationPipe())
  async createResults(
    @Param("id") id: string,
    @Body() createGradingResultDto: CreateGradingResultDto,
    @Req() req: Request & { user?: { user_id: string } },
  ) {
    const createdBy = req.user?.user_id || "system";
    return this.gradingScaleService.createResults(
      id,
      createGradingResultDto,
      createdBy,
    );
  }

  @Get(":id/results")
  @ApiResponse({ status: 200, description: "Results found" })
  async getResults(@Param("id") id: string) {
    return this.gradingScaleService.getResults(id);
  }

  @Put("results/:resultId")
  @ApiOperation({
    summary: "Modifier un résultat de notation",
    description:
      "Modifie un résultat d'évaluation existant (score et/ou commentaire).",
  })
  @ApiParam({
    name: "resultId",
    description: "UUID du résultat à modifier",
    example: "123e4567-e89b-12d3-a456-426614174003",
  })
  @ApiBody({
    type: UpdateGradingResultDto,
    description: "Nouvelles données du résultat",
  })
  @ApiResponse({
    status: 200,
    description: "Résultat modifié avec succès",
    schema: {
      example: {
        id: "123e4567-e89b-12d3-a456-426614174003",
        score: 19,
        comment: "Très bon travail, quelques améliorations possibles",
        updatedAt: "2025-01-12T11:30:00Z",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Résultat non trouvé" })
  @UsePipes(new ValidationPipe())
  async updateResult(
    @Param("resultId") resultId: string,
    @Body() resultData: UpdateGradingResultDto,
  ) {
    return this.gradingScaleService.updateResult(
      resultId,
      resultData as Partial<GradingResult>,
    );
  }
}

@ApiTags("Projects")
@Controller("projects")
export class ProjectGradingScaleController {
  constructor(private readonly gradingScaleService: GradingScaleService) {}

  @Get(":id/grading-scales")
  @ApiOperation({
    summary: "Récupérer les grilles d'un projet",
    description:
      "Récupère toutes les grilles de notation associées à un projet, avec filtrage optionnel par type et targetId.",
  })
  @ApiParam({
    name: "id",
    description: "UUID du projet",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @ApiQuery({
    name: "type",
    description: "Filtrer par type de grille",
    required: false,
    enum: ["livrable", "rapport", "soutenance"],
    example: "livrable",
  })
  @ApiQuery({
    name: "targetId",
    description: "Filtrer par ID de cible spécifique",
    required: false,
    example: "123e4567-e89b-12d3-a456-426614174006",
  })
  @ApiResponse({
    status: 200,
    description: "Grilles de notation du projet trouvées",
    schema: {
      type: "array",
      items: {
        example: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          type: "livrable",
          targetId: "123e4567-e89b-12d3-a456-426614174006",
          notationMode: "groupe",
          title: "Évaluation Livrable 1",
          isValidated: true,
          projectId: "123e4567-e89b-12d3-a456-426614174001",
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Projet non trouvé" })
  async findByProject(
    @Param("id") projectId: string,
    @Query("type") type?: string,
    @Query("targetId") targetId?: string,
  ) {
    return this.gradingScaleService.findByProject(projectId, type, targetId);
  }
}
