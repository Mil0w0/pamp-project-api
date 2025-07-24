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
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class ProjectGroupService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectGroup)
    private projectGroupRepository: Repository<ProjectGroup>,
    private readonly studentService: StudentService,
    private readonly notificationService: NotificationService,
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
        relations: ["project", "oral"],
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
   * @param projectId : string
   * Get all student batches with pagination
   */
  async findAll({ limit, page, projectId }: ListProjectGroupsDto) {
    try {
      return await this.projectGroupRepository.find({
        take: limit || DEFAULT_ELEMENT_BY_PAGE,
        skip: (page - 1) * limit || 0,
        where: projectId ? { project: { id: projectId } } : undefined,
        relations: ["project", "oral"],
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
      relations: ["project"],
    });
    if (!group) throw new BadRequestException("Group not found");

    // Get current students before update for notification comparison
    const previousStudentIds = group.studentsIds ? group.studentsIds.split(",").map(id => id.trim()) : [];

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
      const updatedGroup = await this.projectGroupRepository.findOne({
        where: { id },
        relations: ["project", "oral"],
      });

      // Check if students were added and send notifications if conditions are met
      if (fielsToUpdate.studentsIds && updatedGroup) {
        await this.sendGroupAssignmentNotifications(
          updatedGroup,
          previousStudentIds,
          validStudentIds,
          token
        );
      }

      return updatedGroup;
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

  /** get all project groups with their projects where the student is a member
   *
   * @param id
   */
  async findGroupsByStudentId(id: string): Promise<ProjectGroup[]> {
    if (!id) {
      throw new BadRequestException("Student ID is required");
    }

    const groups = await this.projectGroupRepository.find({
      relations: ["project"],
    });

    //Find groups where students Ids includes our student id
    return groups.filter((group) => {
      if (!group.studentsIds) return false;
      const ids = group.studentsIds.split(",").map((id) => id.trim());
      return ids.includes(id);
    });
  }

  /**
   * Submit a report for a project group
   * @param groupId - The ID of the project group
   * @param studentId - The ID of the student submitting the report
   */
  async submitReport(
    groupId: string,
    studentId: string,
  ): Promise<ProjectGroup> {
    // Find the project group
    const group = await this.projectGroupRepository.findOne({
      where: { id: groupId },
      relations: ["project"],
    });

    if (!group) {
      throw new NotFoundException(`Project group '${groupId}' not found`);
    }

    // Check if the student is part of this group
    if (!group.studentsIds) {
      throw new BadRequestException("No students assigned to this group");
    }

    const studentIds = group.studentsIds.split(",").map((id) => id.trim());
    if (!studentIds.includes(studentId)) {
      throw new BadRequestException(
        "You are not a member of this project group",
      );
    }

    // Check if report is already submitted
    if (group.reportSubmitted) {
      throw new BadRequestException(
        "Report has already been submitted for this group",
      );
    }

    try {
      // Update the group to mark report as submitted
      await this.projectGroupRepository.update(groupId, {
        reportSubmitted: true,
        reportSubmittedDate: new Date(),
      });

      // Return the updated group
      return await this.projectGroupRepository.findOne({
        where: { id: groupId },
        relations: ["project"],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to submit report: ${error.message}`,
      );
    }
  }

  async deleteAllGroupsByProjectId(id: string) {
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

  /**
   * Sends notifications to newly assigned students when they are added to a group
   * Only sends if: groupCreator is not STUDENT and project is published
   */
  private async sendGroupAssignmentNotifications(
    group: ProjectGroup,
    previousStudentIds: string[],
    newStudentIds: string[],
    token: string,
  ): Promise<void> {
    try {
      // Check project conditions: groupCreator is not STUDENT and project is published
      if (!group.project || 
          group.project.groupsCreator === 'STUDENT' || 
          !group.project.isPublished) {
        console.log(`Skipping notifications for group ${group.id}: conditions not met`);
        return;
      }

      // Find newly added students (students in new list but not in previous list)
      const newlyAddedStudents = newStudentIds.filter(
        studentId => !previousStudentIds.includes(studentId.trim())
      );

      if (newlyAddedStudents.length === 0) {
        console.log(`No new students added to group ${group.id}, skipping notifications`);
        return;
      }

      console.log(`Sending notifications to ${newlyAddedStudents.length} newly assigned students in group ${group.id}`);

      // Get student details and send notifications
      const students = await this.studentService.getStudentsByIds(newlyAddedStudents, token);
      
      const notificationPromises = students.map(async (student) => {
        try {
          await this.notificationService.sendProjectGroupAssignedNotification(
            student.email,
            student.first_name,
            group.project.name,
            group.project.id,
            group.id,
            group.name,
          );
          console.log(`Notification sent to ${student.email} for group assignment`);
        } catch (error) {
          console.error(`Failed to send group assignment notification to ${student.email}:`, error);
          // Continue with other notifications even if one fails
        }
      });

      await Promise.allSettled(notificationPromises);
    } catch (error) {
      console.error(`Failed to send group assignment notifications for group ${group.id}:`, error);
      // Don't throw error to avoid breaking the update operation
    }
  }
}
