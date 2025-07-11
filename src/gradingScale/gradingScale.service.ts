import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
    const { criteria, ...gradingScaleData } = createGradingScaleDto;

    const gradingScale = this.gradingScaleRepository.create({
      ...gradingScaleData,
      createdBy,
    });

    const savedGradingScale = await this.gradingScaleRepository.save(
      gradingScale,
    );

    if (criteria && criteria.length > 0) {
      const criteriaEntities = criteria.map((criterion) =>
        this.gradingCriterionRepository.create({
          ...criterion,
          gradingScale: savedGradingScale,
        }),
      );
      await this.gradingCriterionRepository.save(criteriaEntities);
    }

    return this.findOne(savedGradingScale.id);
  }

  async findByProject(projectId: string): Promise<GradingScale[]> {
    return this.gradingScaleRepository.find({
      where: { project: { id: projectId } },
      relations: ["criteria", "criteria.results"],
    });
  }

  async findOne(id: string): Promise<GradingScale> {
    const gradingScale = await this.gradingScaleRepository.findOne({
      where: { id },
      relations: ["criteria", "criteria.results"],
    });

    if (!gradingScale) {
      throw new NotFoundException(`GradingScale with ID ${id} not found`);
    }

    return gradingScale;
  }

  async update(
    id: string,
    updateGradingScaleDto: UpdateGradingScaleDto,
  ): Promise<GradingScale> {
    const gradingScale = await this.findOne(id);

    if (gradingScale.isValidated) {
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

    const results = createGradingResultDto.results.map((resultItem) => {
      return this.gradingResultRepository.create({
        ...resultItem,
        targetGroupId: createGradingResultDto.targetGroupId,
        targetStudentId: createGradingResultDto.targetStudentId,
        createdBy,
      });
    });

    return this.gradingResultRepository.save(results);
  }

  async getResults(gradingScaleId: string): Promise<GradingResult[]> {
    return this.gradingResultRepository.find({
      where: { gradingCriterion: { gradingScale: { id: gradingScaleId } } },
      relations: ["gradingCriterion"],
    });
  }

  async updateResult(
    resultId: string,
    resultData: Partial<GradingResult>,
  ): Promise<GradingResult> {
    const result = await this.gradingResultRepository.findOne({
      where: { id: resultId },
      relations: ["gradingCriterion", "gradingCriterion.gradingScale"],
    });

    if (!result) {
      throw new NotFoundException(`Result with ID ${resultId} not found`);
    }

    if (result.gradingCriterion.gradingScale.isValidated) {
      throw new ForbiddenException(
        "Cannot update results of a validated grading scale",
      );
    }

    await this.gradingResultRepository.update(resultId, resultData);
    const updatedResult = await this.gradingResultRepository.findOne({ where: { id: resultId } });
    
    if (!updatedResult) {
      throw new NotFoundException(`Updated result with ID ${resultId} not found`);
    }
    
    return updatedResult;
  }
}