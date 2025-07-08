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
import { ProjectGroupService } from "../projectGroup/projectGroup.service";
import { CreateProjectGroupDto } from "../projectGroup/dto/create-project-dto";
import { StudentService } from "../studentBatch/students.service";
import { Step } from "../steps/step.entity";

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(StudentBatch)
    private studentBatchRepository: Repository<StudentBatch>,
    private readonly groupService: ProjectGroupService,
    private readonly studentService: StudentService,
    @InjectRepository(Step)
    private readonly stepRepo: Repository<Step>,
  ) {}

  async create(project: CreateProjectDto, teacherId: string): Promise<Project> {
    const otherProject = await this.projectsRepository.findOneBy({
      name: project.name,
    });
    if (otherProject) {
      throw new BadRequestException(
        `A project named ${project.name} already exists`,
      );
    }
    try {
      return await this.projectsRepository.save({
        ...project,
        creatorId: teacherId,
      });
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
        relations: ["studentBatch", "groups", "steps"],
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
   * @param userId: string
   * Get all student batches with pagination. If user is a student, return published project from all the student batches of the user   */
  async findAll({ limit, page, userId }: ListProjectsDto, token: string) {
    try {
      if (userId) {
        //IF user is student
        const user = await this.studentService.getCurrentUser(token);
        if (user.role === "STUDENT") {
          return this.findAllProjectsForStudent(user.user_id);
        } else {
          //USER IS A TEACHER
          return await this.projectsRepository.find({
            take: limit || DEFAULT_ELEMENT_BY_PAGE,
            skip: (page - 1) * limit || 0,
            where: { creatorId: userId },
            relations: ["studentBatch", "groups", "steps"],
          });
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(`Oospie doopsie. ${error}`);
    }
  }

  async findAllProjectsForStudent(userId: string): Promise<Project[]> {
    try {
      const projects = await this.projectsRepository
        .createQueryBuilder("project")
        .leftJoinAndSelect("project.studentBatch", "batch")
        .leftJoinAndSelect("project.groups", "groups")
        .leftJoinAndSelect("project.steps", "steps")
        .where("batch.students LIKE :studentId", { studentId: `%${userId}%` })
        .andWhere("project.isPublished = true")
        .getMany();

      return projects;
    } catch (error) {
      throw new InternalServerErrorException(
        `Could not fetch student projects: ${error}`,
      );
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
      console.log(formattedDto);

      //Save
      await this.projectsRepository.update(id, formattedDto);

      const isGroupConfigurationChanged =
        fielsToUpdate.groupsCreator ||
        fielsToUpdate.maxPerGroup ||
        fielsToUpdate.minPerGroup;

      if (isGroupConfigurationChanged) {
        // delete all existing groups
        await this.groupService.deleteAllGroupsByProjectId(id);

        //CREATE RANDOM GROUPS IF CREATOR IS SYSTEM
        if (formattedDto.groupsCreator === "RANDOM") {
          try {
            await this.createRandomGroups(
              formattedDto.maxPerGroup,
              formattedDto.minPerGroup,
              id,
            );
          } catch (error) {
            console.log(error);
          }
        }
        //else create empty groups that will be filled later
        else {
          const project = await this.findOne(id);
          //Get all students in the student batch of the project
          const allStudents = project.studentBatch.students.split(",");
          const groupBatchDTo: CreateProjectGroupDto[] = [];
          //Create X groups skeleton with a default name
          for (
            let i = 0;
            i < Math.ceil(allStudents.length / formattedDto.minPerGroup);
            i++
          ) {
            groupBatchDTo.push({
              name: `Group ${i + 1}`,
            });
          }
          await this.groupService.create({
            groups: groupBatchDTo,
            projectId: id,
          });
        }
      }

      // Finally return the updated object
      return await this.projectsRepository.findOne({
        where: { id },
        relations: ["studentBatch", "groups", "steps"],
      });
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
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
      relations: ["studentBatch", "steps"],
    });
    const { id, createdAt, groups, studentBatch, steps, ...rest } =
      originalProject;
    console.log(id, createdAt, groups, studentBatch, steps);
    const clonedProject = this.projectsRepository.create({
      ...rest,
      name: `${originalProject.name} (Copy)`,
      isPublished: false,
      groupsCreator: null,
    });
    await this.projectsRepository.save(clonedProject);

    //Clone each step and associate with the new project
    const clonedSteps = steps.map((step) => {
      const { id, createdAt, ...data } = step;
      console.log(id, createdAt);
      return this.stepRepo.create({
        ...data,
        project: clonedProject,
      });
    });
    await this.stepRepo.save(clonedSteps);

    return clonedProject;
  }

  async createRandomGroups(
    maxStudents: number,
    minStudents: number,
    projectId: string,
  ) {
    //Find current project
    const project = await this.findOne(projectId);

    //Get all students in the student batch of the project
    const allStudents = project.studentBatch.students.split(",");
    if (allStudents.length < minStudents) {
      throw new Error("Not enough students to form even one group.");
    }
    // Sort students randomly
    const randomStudentsOrder = allStudents.sort(() => Math.random() - 0.45);

    const groups: CreateProjectGroupDto[] = [];
    const isFixedGroupSize = maxStudents === minStudents;
    let count = 0;

    while (count < randomStudentsOrder.length) {
      const remaining = randomStudentsOrder.length - count;

      let groupSize = maxStudents;

      // (min == max)
      if (isFixedGroupSize) {
        if (remaining < minStudents) {
          // Force assign smaller group
          groupSize = remaining;
        }
      } else {
        // Flexible group size: choose best-fit between min and max
        groupSize = Math.min(maxStudents, remaining);
        if (remaining < minStudents) {
          // Force assign under minStudents if it's the last group
          groupSize = remaining;
        }
      }

      const groupStudents = randomStudentsOrder.slice(count, count + groupSize);

      groups.push({
        name: `Group ${groups.length + 1}`,
        studentsIds: groupStudents.join(","),
      });
      count += groupSize;
    }

    await this.groupService.create({
      groups: groups,
      projectId: projectId,
    });
  }
}
