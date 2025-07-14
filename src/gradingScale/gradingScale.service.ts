import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { GradingScale } from "./gradingScale.entity";
import { GradingCriterion } from "./gradingCriterion.entity";
import { GradingResult } from "./gradingResult.entity";
import { CreateGradingScaleDto } from "./dto/create-grading-scale.dto";
import { UpdateGradingScaleDto } from "./dto/update-grading-scale.dto";
import { CreateGradingResultDto } from "./dto/create-grading-result.dto";

@Injectable()
export class GradingScaleService {
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
      console.log("[DEBUG] Service create - Input DTO:", JSON.stringify(createGradingScaleDto, null, 2));
      console.log("[DEBUG] Service create - createdBy:", createdBy);
      
      const { criteria, ...gradingScaleData } = createGradingScaleDto;
      console.log("[DEBUG] Service create - gradingScaleData:", JSON.stringify(gradingScaleData, null, 2));
      console.log("[DEBUG] Service create - criteria count:", criteria?.length || 0);

      const gradingScale = this.gradingScaleRepository.create({
        ...gradingScaleData,
        createdBy,
      });
      console.log("[DEBUG] Service create - Created entity:", JSON.stringify(gradingScale, null, 2));

      console.log("[DEBUG] Service create - Saving grading scale...");
      const savedGradingScale = await this.gradingScaleRepository.save(
        gradingScale,
      );
      console.log("[DEBUG] Service create - Saved grading scale ID:", savedGradingScale.id);

      if (criteria && criteria.length > 0) {
        console.log("[DEBUG] Service create - Creating criteria entities...");
        const criteriaEntities = criteria.map((criterion) =>
          this.gradingCriterionRepository.create({
            ...criterion,
            gradingScale: savedGradingScale,
          }),
        );
        console.log("[DEBUG] Service create - Saving criteria...");
        await this.gradingCriterionRepository.save(criteriaEntities);
        console.log("[DEBUG] Service create - Criteria saved successfully");
      }

      console.log("[DEBUG] Service create - Fetching complete entity...");
      return this.findOne(savedGradingScale.id);
    } catch (error) {
      console.error("[ERROR] Service create - Error occurred:", error.message);
      console.error("[ERROR] Service create - Stack trace:", error.stack);
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
      console.log("[DEBUG] findOne - Looking for grading scale with ID:", id);
      
      const gradingScale = await this.gradingScaleRepository.findOne({
        where: { id },
        relations: ["criteria", "criteria.results"],
      });
      
      console.log("[DEBUG] findOne - Query result:", gradingScale ? "Found" : "Not found");

      if (!gradingScale) {
        console.error("[ERROR] findOne - GradingScale not found with ID:", id);
        throw new NotFoundException(`GradingScale with ID ${id} not found`);
      }
      
      console.log("[DEBUG] findOne - Returning grading scale with", gradingScale.criteria?.length || 0, "criteria");
      return gradingScale;
    } catch (error) {
      console.error("[ERROR] findOne - Error occurred:", error.message);
      throw error;
    }
  }

  async update(
    id: string,
    updateGradingScaleDto: UpdateGradingScaleDto,
  ): Promise<GradingScale> {
    const gradingScale = await this.findOne(id);

    if (gradingScale.isValidated) {
      console.error(`[ERROR] update - Tentative de modification d'une grille validée (id: ${id})`);
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

    await this.gradingScaleRepository.update(id, { isValidated: true });
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
        createdBy,
      });
      
      results.push(result);
    }

    return this.gradingResultRepository.save(results);
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
    console.log(`[DEBUG] updateResult - Called with resultId: ${resultId}, resultData:`, resultData);
    try {
      const result = await this.gradingResultRepository.findOne({
        where: { id: resultId },
        relations: ["gradingCriterion", "gradingCriterion.gradingScale"],
      });
      console.log("[DEBUG] updateResult - Result fetched:", result);
      if (!result) {
        console.error(`[ERROR] updateResult - Result with ID ${resultId} not found`);
        throw new NotFoundException(`Result with ID ${resultId} not found`);
      }
      if (result.gradingCriterion.gradingScale.isValidated) {
        console.error(`[ERROR] updateResult - Grading scale is validated for resultId: ${resultId}`);
        throw new ForbiddenException(
          "Cannot update results of a validated grading scale",
        );
      }
      await this.gradingResultRepository.update(resultId, resultData);
      const updatedResult = await this.gradingResultRepository.findOne({ where: { id: resultId } });
      console.log("[DEBUG] updateResult - Updated result:", updatedResult);
      if (!updatedResult) {
        console.error(`[ERROR] updateResult - Updated result with ID ${resultId} not found`);
        throw new NotFoundException(`Updated result with ID ${resultId} not found`);
      }
      return updatedResult;
    } catch (error) {
      console.error(`[ERROR] updateResult - Exception:`, error);
      throw error;
    }
  }
}