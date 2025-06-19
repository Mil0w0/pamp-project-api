import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProjectGroup } from "./projectGroup.entity";
import { DEFAULT_ELEMENT_BY_PAGE } from "../constants";
import { CreateBatchGroupsDto } from "./dto/create-project-dto";
import { ListProjectGroupsDto } from "./dto/list-projects-dto";

import { Project } from "../project/project.entity";
import { StudentService } from "../studentBatch/students.service";
import { PatchGroupProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectGroupService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectGroup)
    private projectGroupRepository: Repository<ProjectGroup>,
    private readonly studentService: StudentService,
  ) {}

  async create(projectGroups: CreateBatchGroupsDto) {
    const project = await this.projectsRepository.findOneBy({
      id: projectGroups.projectId,
    });
    if (!project) {
      throw new NotFoundException("Project not found");
    }
    const createdGroups: ProjectGroup[] = [];
    for (const group of projectGroups.groups) {
      const otherProjectGroup = await this.projectGroupRepository.findOneBy({
        name: group.name,
        project: project,
      });

      if (otherProjectGroup) {
        throw new BadRequestException(
          `A projectGroup named ${group.name} already exists for this project`,
        );
      }
      try {
        createdGroups.push(
          await this.projectGroupRepository.save({
            ...group,
            project: project,
          }),
        );
      } catch (error) {
        throw new InternalServerErrorException(
          error.message || "An error occurred while creating the projectGroup",
        );
      }
    }
    return createdGroups;
  }

  async findOne(id: string) {
    try {
      const projectGroup = await this.projectGroupRepository.findOne({
        where: { id },
        relations: ["project"],
      });
      if (!projectGroup) {
        throw new NotFoundException(`Project group '${id}' not found`);
      }
      return projectGroup;
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
  async findAll({ limit, page, projectId }: ListProjectGroupsDto) {
    try {
      return await this.projectGroupRepository.find({
        take: limit || DEFAULT_ELEMENT_BY_PAGE,
        skip: (page - 1) * limit || 0,
        where: projectId ? { project: { id: projectId } } : undefined,
        relations: ["project"],
      });
    } catch (error) {
      throw new InternalServerErrorException(`Oospie doopsie. ${error}`);
    }
  }

  /**
   *
   * @param fielsToUpdate : PatchGroupProjectDto
   * @param id : string
   * @param token : string
   * Update the project group
   */
  async update(
    id: string,
    fielsToUpdate: PatchGroupProjectDto,
    token: string,
  ): Promise<ProjectGroup> {
    const group = await this.projectGroupRepository.findOne({
      where: { id },
    });
    if (!group) throw new BadRequestException("Group not found");

    //Check if the ids are existing students
    const validStudentIds: string[] = [];
    if (fielsToUpdate.studentsIds) {
      const students = fielsToUpdate.studentsIds.split(",");
      for (const studentId of students) {
        //If the student exist,it's a valid id
        if (await this.studentService.hasAccountWithId(studentId, token)) {
          validStudentIds.push(studentId);
        }
      }
      console.log(validStudentIds);
      //Replace student ids with the valid ones only
      fielsToUpdate.studentsIds = validStudentIds.join(",");
    }
    try {
      await this.projectGroupRepository.update(id, fielsToUpdate);
      return await this.projectGroupRepository.findOne({
        where: { id },
        relations: ["project"],
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async delete(id: string) {
    const projectGroup = await this.findOne(id);
    if (!projectGroup) {
      throw new NotFoundException(`Project group'${id}' not found`);
    }
    await this.projectGroupRepository.delete(projectGroup.id);
    return projectGroup;
  }
}
