import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException,} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {StudentBatch} from "./studentBatch.entity";
import {CreateStudentBatchDto} from "./dto/create-student-batch-dto";
import {StudentBatchesValidator} from "./dto/studentBatches.validator";
import {ListStudentBatchesDto} from "./dto/list-student-batches.dto";
import {DEFAULT_ELEMENT_BY_PAGE, USER_SERVICE_URL} from "../constants";
import {PatchStudentBatchDto} from "./dto/update-student-batch.dto";
import {HttpService} from "@nestjs/axios";
import { catchError, firstValueFrom } from 'rxjs';
import {AxiosError} from "axios";
import {StudentService} from "./students.service";
import {GetStudent} from "./dto/get-students-dao";

@Injectable()
export class StudentBatchesService {
    constructor(
        @InjectRepository(StudentBatch)
        private studentBatchsRepository: Repository<StudentBatch>,
        private readonly studentService: StudentService,
        private readonly httpService: HttpService

) {
    }

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
            throw new BadRequestException(`A student batch named ${studentBatch.name} already exists`);
        }

        try {
            return await this.studentBatchsRepository.save(studentBatch);
        } catch (error) {
            throw new InternalServerErrorException(
                error.message || "An error occurred while creating the website",
            );
        }
    }

    async findOne(id: string, token: string){
        const studentBatch = await this.studentBatchsRepository.findOneBy({id});
        if (!studentBatch) {
            throw new NotFoundException(`Student batch '${id}' not found`);
        }

        //Get students info from user microservice and rebuild an answer object
        const {data} = await firstValueFrom(
            //TODO: CHANGE THE URL TO GET ALL USERS BY ID PRESENT IN THE BATCH
            this.httpService.get<GetStudent[]>(`${USER_SERVICE_URL}/user-api/users`, {
                headers: {
                    Authorization: token,
                }
            }).pipe(
                catchError((error: AxiosError) => {
                    throw new InternalServerErrorException(`Error: ${error}`);
                }),
            ),
        );
        return {...studentBatch, students: data} ;
    }

    /**
     *
     * @param limit : number
     * @param page : number
     * @param token : string
     * Get all student batches with pagination
     */
    async findAll({limit, page}: ListStudentBatchesDto, token: string): Promise<StudentBatch[]> {
        console.log(token);
        try {
            const batches: StudentBatch[] = await this.studentBatchsRepository.find(
                {
                    take: limit || DEFAULT_ELEMENT_BY_PAGE,
                    skip: (page - 1) * limit || 0,
                }
            );
            let studentBatchs = [];
            for (const batch of batches) {
                console.log(batch.students);
                //Get students info from user microservice and rebuild an answer object
                const {data} = await firstValueFrom(
                    this.httpService.get<GetStudent[]>(`${USER_SERVICE_URL}/users?ids=${batch.students}`, {
                        headers: {
                            Authorization: token,
                        },
                    }).pipe(
                        catchError((error: AxiosError) => {
                            throw new InternalServerErrorException(`Error: ${error}`);
                        }),
                    ),
                );
                studentBatchs.push({...batch, students: data});
            }
            return studentBatchs;
        }catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    /**
     *
     * @param fielsToUpdate : PatchStudentBatchDto
     * @param id : string
     * Update the promotion
     */
    async update(id: string, fielsToUpdate: PatchStudentBatchDto, token: string ): Promise<StudentBatch> {

        let studentsIds: string = ""
        let formattedFields = {}

        if(fielsToUpdate.students){
            let studentsToCreate = []
            for (const student of fielsToUpdate.students) {
               /**
                * Already created students are just added to the studentIds
                * While the others need to be created
                * All students needs to be notified that they got added to a batch.
                * */
               const doesStudentHaveAccount = await this.studentService.hasAccount(student.id, token)
               if(!doesStudentHaveAccount){
                   studentsToCreate.push(student);
               }
               studentsIds+= `${student.id}, `
            }
            //Todo: returns a message to frontend with that?
            const nbStudendsCreated = await this.studentService.createStudentsAccount(studentsToCreate, token);
            //Todo: send mail
            formattedFields = {...fielsToUpdate, students: studentsIds};
        }

        try {
            const updated= await this.studentBatchsRepository.update(
                id,
                formattedFields
            )
            return await this.studentBatchsRepository.findOne({ where: { id } });
        }catch (error) {
            throw new InternalServerErrorException()
        }
    }

    async delete(id: string, token: string ) {
        const studentBatch = await this.findOne(id, token);
        if (!studentBatch) {
            throw new NotFoundException(`Student batch '${id}' not found`);
        }
        await this.studentBatchsRepository.delete(studentBatch.id);
        return {...studentBatch};
    }

}
