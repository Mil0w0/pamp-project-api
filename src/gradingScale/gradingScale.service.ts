import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { GradingScale } from "./gradingScale.entity";
import { GradingCriterion } from "./gradingCriterion.entity";
import { GradingResult } from "./gradingResult.entity";
import { CreateGradingScaleDto } from "./dto/create-grading-scale.dto";
import { UpdateGradingScaleDto } from "./dto/update-grading-scale.dto";
import { CreateGradingResultDto } from "./dto/create-grading-result.dto";
import { Logger } from "@nestjs/common";

@Injectable()
export class GradingScaleService {
  private readonly logger = new Logger(GradingScaleService.name);
  constructor(
    @InjectRepository(GradingScale)
    private gradingScaleRepository: Repository<GradingScale>,
    @InjectRepository(GradingCriterion)
    private gradingCriterionRepository: Repository<GradingCriterion>,
    @InjectRepository(GradingResult)
    private gradingResultRepository: Repository<GradingResult>,
  ) {}

  async create(
    createGradingScaleDto: CreateGradingScaleDto,
    createdBy: string,
  ): Promise<GradingScale> {
    try {
      this.logger.debug(`Input DTO: ${JSON.stringify(createGradingScaleDto, null, 2)}`);
      this.logger.debug(`createdBy: ${createdBy}`);
      
      const { criteria, ...gradingScaleData } = createGradingScaleDto;
      this.logger.debug(`gradingScaleData: ${JSON.stringify(gradingScaleData, null, 2)}`);
      this.logger.debug(`criteria count: ${criteria?.length || 0}`);

      const gradingScale = this.gradingScaleRepository.create({
        ...gradingScaleData,
        createdBy,
      });
      this.logger.debug(`Created entity: ${JSON.stringify(gradingScale, null, 2)}`);

      this.logger.debug('Saving grading scale...');
      const savedGradingScale = await this.gradingScaleRepository.save(
        gradingScale,
      );
      this.logger.debug(`Saved grading scale ID: ${savedGradingScale.id}`);

      if (criteria && criteria.length > 0) {
        this.logger.debug('Creating criteria entities...');
        const criteriaEntities = criteria.map((criterion) =>
          this.gradingCriterionRepository.create({
            ...criterion,
            gradingScale: savedGradingScale,
          }),
        );
        this.logger.debug('Saving criteria...');
        await this.gradingCriterionRepository.save(criteriaEntities);
        this.logger.debug('Criteria saved successfully');
      }

      this.logger.debug('Fetching complete entity...');
      return this.findOne(savedGradingScale.id);
    } catch (error) {
      this.logger.error(`Error occurred: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByProject(
    projectId: string,
    type?: string,
    targetId?: string,
  ): Promise<GradingScale[]> {
    const whereConditions:  Record<string, unknown> = { projectId };
    
    if (type) {
      whereConditions.type = type;
    }
    
    if (targetId) {
      whereConditions.targetId = targetId;
    }
    
    return this.gradingScaleRepository.find({
      where: whereConditions,
      relations: ["criteria", "criteria.results"],
    });
  }

  async findOne(id: string): Promise<GradingScale> {
    try {
      this.logger.debug(`Looking for grading scale with ID: ${id}`);
      
      const gradingScale = await this.gradingScaleRepository.findOne({
        where: { id },
        relations: ["criteria", "criteria.results"],
      });
      
      this.logger.debug(`Query result: ${gradingScale ? 'Found' : 'Not found'}`);

      if (!gradingScale) {
        this.logger.error(`GradingScale not found with ID: ${id}`);
        throw new NotFoundException(`GradingScale with ID ${id} not found`);
      }
      
      this.logger.debug(`Returning grading scale with ${gradingScale.criteria?.length || 0} criteria`);
      return gradingScale;
    } catch (error) {
      this.logger.error(`Error occurred: ${error.message}`);
      throw error;
    }
  }

  async update(
    id: string,
    updateGradingScaleDto: UpdateGradingScaleDto,
  ): Promise<GradingScale> {
    const gradingScale = await this.findOne(id);

    if (gradingScale.isValidated) {
      this.logger.error(`Tentative de modification d'une grille validée (id: ${id})`);
      throw new ForbiddenException(
        "Cannot update a validated grading scale",
      );
    }

    await this.gradingScaleRepository.update(id, updateGradingScaleDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const gradingScale = await this.findOne(id);

    if (gradingScale.isValidated) {
      throw new ForbiddenException(
        "Cannot delete a validated grading scale",
      );
    }

    await this.gradingScaleRepository.remove(gradingScale);
  }

  async validate(id: string): Promise<GradingScale> {
    const gradingScale = await this.findOne(id);

    if (gradingScale.isValidated) {
      throw new BadRequestException("Grading scale is already validated");
    }

    // Vérification : la grille doit avoir au moins un critère
    if (!gradingScale.criteria || gradingScale.criteria.length === 0) {
      throw new BadRequestException("La grille doit contenir au moins un critère pour être validée.");
    }

    // Vérification : chaque critère doit avoir au moins un résultat
    for (const criterion of gradingScale.criteria) {
      if (!criterion.results || criterion.results.length === 0) {
        throw new BadRequestException(`Le critère '${criterion.label}' n'a pas de note associée. Tous les critères doivent être notés pour valider la grille.`);
      }
    }

    await this.gradingScaleRepository.update(id, { isValidated: true, validatedAt: new Date() });
    return this.findOne(id);
  }

  async addCriterion(
    gradingScaleId: string,
    criterionData: Partial<GradingCriterion>,
  ): Promise<GradingCriterion> {
    const gradingScale = await this.findOne(gradingScaleId);

    if (gradingScale.isValidated) {
      throw new ForbiddenException(
        "Cannot add criteria to a validated grading scale",
      );
    }

    const criterion = this.gradingCriterionRepository.create({
      ...criterionData,
      gradingScale,
    });

    return await this.gradingCriterionRepository.save(criterion) as unknown as GradingCriterion;
  }

  async updateCriterion(
    criterionId: string,
    criterionData: Partial<GradingCriterion>,
  ): Promise<GradingCriterion> {
    const criterion = await this.gradingCriterionRepository.findOne({
      where: { id: criterionId },
      relations: ["gradingScale"],
    });

    if (!criterion) {
      throw new NotFoundException(`Criterion with ID ${criterionId} not found`);
    }

    if (criterion.gradingScale.isValidated) {
      throw new ForbiddenException(
        "Cannot update criteria of a validated grading scale",
      );
    }

    await this.gradingCriterionRepository.update(criterionId, criterionData);
    const updatedCriterion = await this.gradingCriterionRepository.findOne({
      where: { id: criterionId },
    });
    
    if (!updatedCriterion) {
      throw new NotFoundException(`Updated criterion with ID ${criterionId} not found`);
    }
    
    return updatedCriterion;
  }

  async removeCriterion(criterionId: string): Promise<void> {
    const criterion = await this.gradingCriterionRepository.findOne({
      where: { id: criterionId },
      relations: ["gradingScale"],
    });

    if (!criterion) {
      throw new NotFoundException(`Criterion with ID ${criterionId} not found`);
    }

    if (criterion.gradingScale.isValidated) {
      throw new ForbiddenException(
        "Cannot delete criteria of a validated grading scale",
      );
    }

    await this.gradingCriterionRepository.remove(criterion);
  }

  async createResults(
    gradingScaleId: string,
    createGradingResultDto: CreateGradingResultDto,
    createdBy: string,
  ): Promise<GradingResult[]> {
    const gradingScale = await this.findOne(gradingScaleId);

    if (gradingScale.isValidated) {
      throw new ForbiddenException(
        "Cannot add results to a validated grading scale",
      );
    }

    const results = [];
    // Ensure createdBy is a valid UUID or null
    const createdByUuid = /^[0-9a-fA-F-]{36}$/.test(createdBy) ? createdBy : null;
    for (const resultItem of createGradingResultDto.results) {
      const criterion = await this.gradingCriterionRepository.findOne({
        where: { id: resultItem.gradingCriterionId },
      });
      
      if (!criterion) {
        throw new NotFoundException(`Criterion with ID ${resultItem.gradingCriterionId} not found`);
      }

      const result = this.gradingResultRepository.create({
        score: resultItem.score,
        comment: resultItem.comment,
        targetGroupId: createGradingResultDto.targetGroupId,
        targetStudentId: createGradingResultDto.targetStudentId,
        gradingCriterion: criterion,
        createdBy: createdByUuid,
      });
      
      results.push(result);
    }

    try {
      return await this.gradingResultRepository.save(results);
    } catch (error) {
      this.logger.error(`[ERROR] createResults - Exception: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Erreur lors de la sauvegarde des résultats: ${error.message}`);
    }
  }

  async getResults(gradingScaleId: string): Promise<GradingResult[]> {
    const gradingScale = await this.findOne(gradingScaleId);
    const criteriaIds = gradingScale.criteria.map(criterion => criterion.id);
    
    if (criteriaIds.length === 0) {
      return [];
    }
    
    return this.gradingResultRepository.find({
      where: { gradingCriterion: { id: In(criteriaIds) } },
      relations: ["gradingCriterion"],
    });
  }

  async updateResult(
    resultId: string,
    resultData: Partial<GradingResult>,
  ): Promise<GradingResult> {
    this.logger.debug(`[DEBUG] updateResult - Called with resultId: ${resultId}, resultData: ${JSON.stringify(resultData)}`);
    try {
      const result = await this.gradingResultRepository.findOne({
        where: { id: resultId },
        relations: ["gradingCriterion", "gradingCriterion.gradingScale"],
      });
      this.logger.debug(`[DEBUG] updateResult - Result fetched: ${JSON.stringify(result)}`);
      if (!result) {
        this.logger.error(`[ERROR] updateResult - Result with ID ${resultId} not found`);
        throw new NotFoundException(`Result with ID ${resultId} not found`);
      }
      if (result.gradingCriterion.gradingScale.isValidated) {
        this.logger.error(`[ERROR] updateResult - Grading scale is validated for resultId: ${resultId}`);
        throw new ForbiddenException(
          "Cannot update results of a validated grading scale",
        );
      }
      Object.assign(result, resultData);
      await this.gradingResultRepository.save(result);
      this.logger.debug(`[DEBUG] updateResult - Result updated: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`[ERROR] updateResult - Exception: ${error.message}`, error.stack);
      throw error;
    }
  }
}