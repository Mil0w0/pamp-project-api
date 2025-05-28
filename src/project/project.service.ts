import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {Project} from "./project.entity";
import { DEFAULT_ELEMENT_BY_PAGE,  } from "../constants";
import {CreateProjectDto} from "./dto/create-project-dto";
import {ListProjectsDto} from "./dto/list-projects-dto";
import {PatchProjectDto} from "./dto/update-student-batch.dto";

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>
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
      const project = await this.projectsRepository.findOneBy({ id });
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
  async findAll(
    { limit, page }: ListProjectsDto,
  ) {
    try {
      return await this.projectsRepository.find({
        take: limit || DEFAULT_ELEMENT_BY_PAGE,
        skip: (page - 1) * limit || 0,
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
  async update(
    id: string,
    fielsToUpdate: PatchProjectDto,
  ): Promise<Project> {
    try {
      await this.projectsRepository.update(
          id,
          fielsToUpdate,
      );
      return await this.projectsRepository.findOne({ where: { id } });
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
}
