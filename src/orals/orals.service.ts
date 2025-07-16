import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DEFAULT_ELEMENT_BY_PAGE } from "../constants";

import { Project } from "../project/project.entity";
import { Oral } from "./oral.entity";
import { CreateOralDto } from "./dto/create-oral-dto";
import { PatchOralDto } from "./dto/patch-oral-dto";
import { ProjectGroup } from "../projectGroup/projectGroup.entity";
import { ListOralDto } from "./dto/list-oral-dto";

@Injectable()
export class OralsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Oral)
    private oralRepository: Repository<Oral>,
    @InjectRepository(ProjectGroup)
    private projectGroupRepository: Repository<ProjectGroup>,
  ) {}

  async create(oralDTO: CreateOralDto) {
    console.log(oralDTO);
    const { groupId, startTime, endTime } = { ...oralDTO };

    const group = await this.projectGroupRepository.findOneBy({
      id: groupId,
    });
    if (!group) {
      throw new BadRequestException("Group not found");
    }

    const otherOral = await this.oralRepository.findOneBy({
      group: group,
    });

    if (otherOral) {
      throw new BadRequestException(
        `There is already an oral for ${group.name}`,
      );
    }
    try {
      return await this.oralRepository.save({
        startTime: startTime,
        endTime: endTime,
        group: group,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || "An error occurred while creating the oral",
      );
    }
  }

  async findOne(id: string) {
    try {
      const projectGroup = await this.oralRepository.findOne({
        where: { id },
        relations: ["group"],
      });
      if (!projectGroup) {
        throw new NotFoundException(`Oral '${id}' not found`);
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
   * @param projectId : string
   * Get all orals from groups linked to a specific project
   */
  async findAllByProject({ limit, page }: ListOralDto, projectId: string) {
    const project = await this.projectsRepository.findOneBy({ id: projectId });

    if (!project) {
      throw new NotFoundException(`Project not found`);
    }
    try {
      return await this.oralRepository.find({
        take: limit || DEFAULT_ELEMENT_BY_PAGE,
        skip: (page - 1) * limit || 0,
        where: { group: { project: { id: projectId } } },
        relations: ["group"],
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(`Oospie doopsie. ${error}`);
    }
  }

  /**
   *
   * @param fielsToUpdate : PatchOralDto
   * @param id : string
   * Update the project group
   */
  async update(id: string, fielsToUpdate: PatchOralDto): Promise<Oral> {
    const oral = await this.oralRepository.findOne({
      where: { id },
    });
    if (!oral) throw new BadRequestException("Oral not found");

    try {
      await this.oralRepository.update(id, fielsToUpdate);
      return await this.oralRepository.findOne({
        where: { id },
        relations: ["group"],
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async delete(id: string) {
    const oral = await this.findOne(id);
    if (!oral) {
      throw new NotFoundException(`Project oral'${id}' not found`);
    }
    await this.oralRepository.delete(oral.id);
    return oral;
  }

  async deleteAllOralsByGroupId(id: string) {
    const project = await this.projectsRepository.findOneBy({ id });
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    try {
      const result = await this.projectGroupRepository.delete({
        project: { id: project.id },
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete groups for project ${id}: ${error.message}`,
      );
    }
  }
}
