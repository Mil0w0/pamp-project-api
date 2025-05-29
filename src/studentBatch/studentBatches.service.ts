import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StudentBatch } from "./studentBatch.entity";
import { CreateStudentBatchDto } from "./dto/create-student-batch-dto";
import { StudentBatchesValidator } from "./dto/studentBatches.validator";
import { ListStudentBatchesDto } from "./dto/list-student-batches.dto";
import { DEFAULT_ELEMENT_BY_PAGE } from "../constants";
import { PatchStudentBatchDto } from "./dto/update-student-batch.dto";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom } from "rxjs";
import { AxiosError } from "axios";
import { StudentService } from "./students.service";
import { GetStudent, StudentBatchReturned } from "./dto/get-students-dao";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StudentBatchesService {
  constructor(
    @InjectRepository(StudentBatch)
    private studentBatchsRepository: Repository<StudentBatch>,
    private readonly studentService: StudentService,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  public USER_SERVICE_URL = this.configService.get<string>("USER_SERVICE_URL");

  async create(studentBatch: CreateStudentBatchDto): Promise<StudentBatch> {
    try {
      StudentBatchesValidator.validateCreateStudentBatchDto(studentBatch);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const otherPromotion = await this.studentBatchsRepository.findOneBy({
      name: studentBatch.name,
    });
    if (otherPromotion) {
      throw new BadRequestException(
        `A student batch named ${studentBatch.name} already exists`,
      );
    }

    try {
      return await this.studentBatchsRepository.save(studentBatch);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || "An error occurred while creating the website",
      );
    }
  }

  async findOne(id: string, token: string) {
    try {
      const studentBatch = await this.studentBatchsRepository.findOne({
        where: { id },
        relations: ["projects"],
      });
      if (!studentBatch) {
        throw new NotFoundException(`Student batch '${id}' not found`);
      }
      console.log(studentBatch);

      //Get students info from user microservice and rebuild an answer object
      if (studentBatch.students && studentBatch.students.length > 0) {
        try {
          const { data } = await firstValueFrom(
            this.httpService
              .get<GetStudent[]>(
                `${this.USER_SERVICE_URL}/users?ids=${studentBatch.students}`,
                {
                  headers: {
                    Authorization: token,
                  },
                },
              )
              .pipe(
                catchError((error: AxiosError) => {
                  throw new InternalServerErrorException(`Error: ${error}`);
                }),
              ),
          );
          return { ...studentBatch, students: data };
        } catch (error) {
          console.error(error);
          return { ...studentBatch, students: [] };
        }
      }
      return { ...studentBatch, students: [] };
    } catch (error) {
      throw new InternalServerErrorException(`Oospie doopsie. ${error}`);
    }
  }

  /**
   *
   * @param limit : number
   * @param page : number
   * @param token : string
   * Get all student batches with pagination
   */
  async findAll(
    //FIXME: big issues with user service calls
    { limit, page }: ListStudentBatchesDto,
    token: string,
  ): Promise<StudentBatchReturned[]> {
    try {
      const batches: StudentBatch[] = await this.studentBatchsRepository.find({
        take: limit || DEFAULT_ELEMENT_BY_PAGE,
        skip: (page - 1) * limit || 0,
        relations: ["projects"],
      });
      const studentBatchs: StudentBatchReturned[] = [];
      for (const batch of batches) {
        if (batch.students && batch.students.length > 0) {
          try {
            const { data } = await firstValueFrom(
              this.httpService
                .get<GetStudent[]>(
                  `${this.USER_SERVICE_URL}/users?ids=${batch.students}`,
                  {
                    headers: { Authorization: token },
                  },
                )
                .pipe(
                  catchError((error: AxiosError) => {
                    console.error(error);
                    throw new InternalServerErrorException(
                      `User service error: ${error.message}`,
                    );
                  }),
                ),
            );
            const enrichedBatch = {
              ...batch,
              students: data,
            };
            studentBatchs.push(enrichedBatch);
          } catch (error) {
            console.error(
              `Failed to enrich batch ${batch.id}: ${error.message}`,
            );
            // Allow page rendering even if the microservice fails but without all data
            studentBatchs.push({ ...batch, students: [] });
          }
        } else {
          studentBatchs.push({ ...batch, students: [] });
        }
      }
      return studentBatchs;
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
    fielsToUpdate: PatchStudentBatchDto,
    token: string,
  ): Promise<StudentBatch> {
    let studentsIdsFormatted: string = "";
    let formattedFields = {};

    try {
      if (fielsToUpdate.students && fielsToUpdate.students.length > 0) {
        const studentsToCreate = [];
        const studentsIds = [];
        for (const student of fielsToUpdate.students) {
          /**
           * Already created students are just added to the studentIds
           * While the others need to be created
           * All students needs to be notified that they got added to a batch.
           * */
          const doesStudentHaveAccount = await this.studentService.hasAccount(
            student.email,
            token,
          );
          if (!doesStudentHaveAccount) {
            studentsToCreate.push(student);
          }
          studentsIds.push(student.user_id);
        }
        studentsIdsFormatted = studentsIds.join(",");
        //Todo: returns a message to frontend with that?
        if (studentsToCreate.length > 0) {
          await this.studentService.createStudentsAccount(
            studentsToCreate,
            token,
          );
        }
        //Todo: send mail if student has been added (and wasn't already in the batch)
        formattedFields = { ...fielsToUpdate, students: studentsIdsFormatted };
      }
      await this.studentBatchsRepository.update(
        id,
        fielsToUpdate.students && fielsToUpdate.students.length > 0
          ? formattedFields
          : fielsToUpdate,
      );
      return await this.studentBatchsRepository.findOne({
        where: { id },
        relations: ["projects"],
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async delete(id: string, token: string) {
    const studentBatch = await this.findOne(id, token);
    if (!studentBatch) {
      throw new NotFoundException(`Student batch '${id}' not found`);
    }
    await this.studentBatchsRepository.delete(studentBatch.id);
    return { ...studentBatch };
  }
}
