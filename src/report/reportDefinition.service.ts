import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReportDefinition } from "./reportDefinition.entiy";
import { Project } from "../project/project.entity";
import { DEFAULT_ELEMENT_BY_PAGE } from "../constants";
import { CreateReportDefinitionDto } from "./dto/create-report-definition.dto";
import { ListReportDefinitionsDto } from "./dto/list-report-definitions.dto";
import {
  PatchReportDefinitionDto,
  UpdatedReportDefinitionPatchDto,
} from "./dto/update-report-definition.dto";

@Injectable()
export class ReportDefinitionService {
  constructor(
    @InjectRepository(ReportDefinition)
    private reportDefinitionRepository: Repository<ReportDefinition>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  private validateFormatSpecificRules(
    format: "CLASSIC" | "QUESTIONNAIRE",
    instruction?: string,
    questions?: string,
  ): void {
    if (format === "CLASSIC") {
      // For CLASSIC format: instruction is mandatory, questions should be null/empty
      if (!instruction || instruction.trim() === "") {
        throw new BadRequestException(
          "For CLASSIC format, instruction field is mandatory",
        );
      }
      if (questions && questions.trim() !== "") {
        throw new BadRequestException(
          "For CLASSIC format, questions field should be null or empty",
        );
      }
    } else if (format === "QUESTIONNAIRE") {
      // For QUESTIONNAIRE format: questions is mandatory, instruction is optional
      if (!questions || questions.trim() === "") {
        throw new BadRequestException(
          "For QUESTIONNAIRE format, questions field is mandatory",
        );
      }
    }
  }

  async create(
    reportDefinition: CreateReportDefinitionDto,
  ): Promise<ReportDefinition> {
    // Check if project exists
    const project = await this.projectRepository.findOne({
      where: { id: reportDefinition.projectId },
      relations: ["reportDefinition"],
    });

    if (!project) {
      throw new NotFoundException(
        `Project with id ${reportDefinition.projectId} not found`,
      );
    }

    // Check if report definition already exists for this project
    if (project.reportDefinition) {
      throw new BadRequestException(
        `A report definition already exists for project ${project.name}`,
      );
    }

    try {
      const { ...reportDefData } = reportDefinition;

      // Validate format-specific rules
      this.validateFormatSpecificRules(
        reportDefData.format,
        reportDefData.instruction,
        reportDefData.questions,
      );

      const newReportDefinition = this.reportDefinitionRepository.create({
        ...reportDefData,
        project,
      });
      return await this.reportDefinitionRepository.save(newReportDefinition);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message ||
          "An error occurred while creating the report definition",
      );
    }
  }

  async findOne(id: string): Promise<ReportDefinition> {
    try {
      const reportDefinition = await this.reportDefinitionRepository.findOne({
        where: { id },
        relations: ["project"],
      });

      if (!reportDefinition) {
        throw new NotFoundException(`Report definition '${id}' not found`);
      }

      return reportDefinition;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding report definition: ${error.message}`,
      );
    }
  }

  async findByProjectId(projectId: string): Promise<ReportDefinition> {
    try {
      const reportDefinition = await this.reportDefinitionRepository.findOne({
        where: { project: { id: projectId } },
        relations: ["project"],
      });

      if (!reportDefinition) {
        throw new NotFoundException(
          `No report definition found for project '${projectId}'`,
        );
      }

      return reportDefinition;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding report definition: ${error.message}`,
      );
    }
  }

  async findAll({
    limit,
    page,
  }: ListReportDefinitionsDto): Promise<ReportDefinition[]> {
    try {
      return await this.reportDefinitionRepository.find({
        take: limit || DEFAULT_ELEMENT_BY_PAGE,
        skip: ((page || 1) - 1) * (limit || DEFAULT_ELEMENT_BY_PAGE),
        relations: ["project"],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching report definitions: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    fieldsToUpdate: PatchReportDefinitionDto,
  ): Promise<ReportDefinition> {
    const formattedDto: UpdatedReportDefinitionPatchDto = { ...fieldsToUpdate };

    // If projectId is provided, validate and update the project relationship
    if (fieldsToUpdate.projectId) {
      const project = await this.projectRepository.findOne({
        where: { id: fieldsToUpdate.projectId },
      });

      if (!project) {
        throw new BadRequestException("Project not found");
      }

      delete formattedDto.projectId;
      formattedDto.project = project;
    }

    try {
      // Check if report definition exists
      const existingReportDefinition = await this.findOne(id);

      // Merge existing data with updates to validate complete object
      const mergedData = {
        format: formattedDto.format || existingReportDefinition.format,
        instruction:
          formattedDto.instruction !== undefined
            ? formattedDto.instruction
            : existingReportDefinition.instruction,
        questions:
          formattedDto.questions !== undefined
            ? formattedDto.questions
            : existingReportDefinition.questions,
      };

      // Validate format-specific rules
      this.validateFormatSpecificRules(
        mergedData.format,
        mergedData.instruction,
        mergedData.questions,
      );

      // Update the report definition
      await this.reportDefinitionRepository.update(id, formattedDto);

      // Return the updated object
      return await this.reportDefinitionRepository.findOne({
        where: { id },
        relations: ["project"],
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error updating report definition: ${error.message}`,
      );
    }
  }

  async updateByProjectId(
    projectId: string,
    fieldsToUpdate: PatchReportDefinitionDto,
  ): Promise<ReportDefinition> {
    // First find the report definition by project ID
    const reportDefinition = await this.findByProjectId(projectId);

    // Now update it using the existing update method
    return this.update(reportDefinition.id, fieldsToUpdate);
  }

  async upsertByProjectId(
    projectId: string,
    reportDefinitionData: Omit<CreateReportDefinitionDto, "projectId">,
  ): Promise<ReportDefinition> {
    // Check if project exists
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ["reportDefinition"],
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${projectId} not found`);
    }

    try {
      // If report definition exists, replace it completely
      if (project.reportDefinition) {
        const existingId = project.reportDefinition.id;
        await this.reportDefinitionRepository.delete(existingId);
      }

      // Validate format-specific rules
      this.validateFormatSpecificRules(
        reportDefinitionData.format,
        reportDefinitionData.instruction,
        reportDefinitionData.questions,
      );

      // Create new report definition
      const newReportDefinition = this.reportDefinitionRepository.create({
        ...reportDefinitionData,
        project,
      });

      return await this.reportDefinitionRepository.save(newReportDefinition);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message ||
          "An error occurred while upserting the report definition",
      );
    }
  }

  async delete(id: string): Promise<ReportDefinition> {
    const reportDefinition = await this.findOne(id);

    try {
      await this.reportDefinitionRepository.delete(id);
      return reportDefinition;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error deleting report definition: ${error.message}`,
      );
    }
  }
}
