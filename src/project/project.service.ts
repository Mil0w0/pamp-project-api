import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Project } from "./project.entity";
import { DEFAULT_ELEMENT_BY_PAGE } from "../constants";
import { CreateProjectDto } from "./dto/create-project-dto";
import { ListProjectsDto } from "./dto/list-projects-dto";
import {
  PatchProjectDto,
  UpdatedProjectPatchDto,
} from "./dto/update-project.dto";
import { StudentBatch } from "../studentBatch/studentBatch.entity";

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(StudentBatch)
    private studentBatchRepository: Repository<StudentBatch>,
  ) {}

  async create(project: CreateProjectDto): Promise<Project> {
    const otherProject = await this.projectsRepository.findOneBy({
      name: project.name,
    });
    if (otherProject) {
      throw new BadRequestException(
        `A project named ${project.name} already exists`,
      );
    }
    try {
      return await this.projectsRepository.save(project);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || "An error occurred while creating the project",
      );
    }
  }

  async findOne(id: string) {
    try {
      const project = await this.projectsRepository.findOne({
        where: { id },
        relations: ["studentBatch"],
      });
      if (!project) {
        throw new NotFoundException(`Project '${id}' not found`);
      }
      return project;
    } catch (error) {
      throw new InternalServerErrorException(`Oospie doopsie. ${error}`);
    }
  }

  /**
   *
   * @param limit : number
   * @param page : number
   * Get all student batches with pagination
   */
  async findAll({ limit, page }: ListProjectsDto) {
    try {
      return await this.projectsRepository.find({
        take: limit || DEFAULT_ELEMENT_BY_PAGE,
        skip: (page - 1) * limit || 0,
        relations: ["studentBatch"],
      });
    } catch (error) {
      throw new InternalServerErrorException(`Oospie doopsie. ${error}`);
    }
  }

  /**
   *
   * @param fielsToUpdate : PatchStudentBatchDto
   * @param id : string
   * Update the promotion
   */
  async update(id: string, fielsToUpdate: PatchProjectDto): Promise<Project> {
    const formattedDto: UpdatedProjectPatchDto = { ...fielsToUpdate };
    if (fielsToUpdate.studentBatchId) {
      const batch = await this.studentBatchRepository.findOne({
        where: { id: fielsToUpdate.studentBatchId },
        relations: ["projects"],
      });
      if (!batch) throw new BadRequestException("Student batch not found");
      delete formattedDto.studentBatchId;
      formattedDto.studentBatch = batch;
    }
    try {
      await this.projectsRepository.update(id, formattedDto);
      return await this.projectsRepository.findOne({
        where: { id },
        relations: ["studentBatch"],
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async delete(id: string) {
    const project = await this.findOne(id);
    if (!project) {
      throw new NotFoundException(`Project '${id}' not found`);
    }
    await this.projectsRepository.delete(project.id);
    return project;
  }

  async copy(projectId: string) {
    const originalProject = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ["studentBatch"],
    });
    const { id, createdAt, ...rest } = originalProject;
    const clonedProject = this.projectsRepository.create({
      ...rest,
      name: `${originalProject.name} (Copy)`,
      isPublished: false,
    });
    await this.projectsRepository.save(clonedProject);
    return clonedProject;
  }
}
