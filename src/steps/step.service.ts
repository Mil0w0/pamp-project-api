import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Step } from "./step.entity";
import { DEFAULT_ELEMENT_BY_PAGE } from "../constants";
import { CreateStepDTO } from "./dto/create-step-dto";

import { Project } from "../project/project.entity";
import { ListProjectsDto } from "../project/dto/list-projects-dto";
@Injectable()
export class StepService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Step)
    private stepRepository: Repository<Step>,
  ) {}

  /**
   * Delete all project steps that aren't kept and create the new steps given then update the lasts
   * @param stepsData
   * @param projectId
   */
  async createBatch(projectId: string, stepsData: CreateStepDTO[]) {
    console.log("Got there");
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ["steps"],
    });
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    //DELETE STEPS THAT AREN'T KEPT IN THE NEW DATA
    const incomingStepIds = stepsData
      .filter((step) => !!step.id) // Only consider steps with an ID
      .map((step) => step.id);

    console.log(incomingStepIds);
    const stepsToDelete = project.steps.filter(
      (existingStep) => !incomingStepIds.includes(existingStep.id),
    );
    console.log(stepsToDelete);
    if (stepsToDelete.length > 0) {
      await this.stepRepository.remove(stepsToDelete);
    }

    //CREATE OR UPDATE THE OTHERS STEPS
    try {
      for (const step of stepsData) {
        if (step.id) {
          // Update existing step

          await this.stepRepository.update(step.id, step);
        } else {
          // Create new step

          const newStep = this.stepRepository.create({
            ...step,
            project,
          });
          await this.stepRepository.save(newStep);
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || "An error occurred while creating or updating a step",
      );
    }
    return await this.findAll(
      { limit: DEFAULT_ELEMENT_BY_PAGE, page: 1 },
      projectId,
    );
  }

  async findOne(id: string) {
    try {
      const step = await this.stepRepository.findOne({
        where: { id },
        relations: ["project"],
      });
      if (!step) {
        throw new NotFoundException(`Project step '${id}' not found`);
      }
      return step;
    } catch (error) {
      throw new InternalServerErrorException(`${error}`);
    }
  }

  /**
   *
   * @param limit : number
   * @param page : number
   * @param projectId : string
   * Get all steps with pagination
   */
  async findAll({ limit, page }: ListProjectsDto, projectId: string) {
    try {
      return await this.stepRepository.find({
        take: limit || DEFAULT_ELEMENT_BY_PAGE,
        skip: (page - 1) * limit || 0,
        where: projectId ? { project: { id: projectId } } : undefined,
        relations: ["project"],
      });
    } catch (error) {
      throw new InternalServerErrorException(`${error}`);
    }
  }

  async delete(id: string): Promise<Step> {
    const step = await this.findOne(id);
    if (!step) {
      throw new NotFoundException(`Project STEP'${id}' not found`);
    }
    await this.stepRepository.delete(step.id);
    return step;
  }
}
