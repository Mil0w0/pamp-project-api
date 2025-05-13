import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException,} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {StudentBatch} from "./studentBatch.entity";
import {CreateStudentBatch} from "./dto/create-student-batch";
import {StudentBatchesValidator} from "./dto/studentBatches.validator";
import {ListStudentBatchesDto} from "./dto/list-student-batches.dto";
import {DEFAULT_ELEMENT_BY_PAGE} from "../constants";
import {PatchStudentBatchDto} from "./dto/update-student-batch.dto";

@Injectable()
export class StudentBatchesService {
    constructor(
        @InjectRepository(StudentBatch)
        private studentBatchsRepository: Repository<StudentBatch>,
    ) {
    }

    async create(studentBatch: CreateStudentBatch): Promise<StudentBatch> {
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

    async findOne(id: string): Promise<StudentBatch> {
        const studentBatch = await this.studentBatchsRepository.findOneBy({id});
        if (!studentBatch) {
            throw new NotFoundException(`Student batch '${id}' not found`);
        }
        return studentBatch;
    }

    /**
     *
     * @param limit : number
     * @param page : number
     * Get all student batches with pagination
     */
    async findAll({limit, page}: ListStudentBatchesDto): Promise<StudentBatch[]> {
        try {
            return await this.studentBatchsRepository.find(
                {
                    take: limit || DEFAULT_ELEMENT_BY_PAGE,
                    skip: (page - 1) * limit || 0,
                }
            );
        }catch (error) {
            throw new InternalServerErrorException()
        }
    }

    async exists(id: string): Promise<boolean> {
        if(!await this.findOne(id)) throw new NotFoundException(`Student batch '${id}' not found`);
        return true;
    }

    /**
     *
     * @param fielsToUpdate : PatchStudentBatchDto
     * @param id : string
     * Update the promotion
     */
    async update(id: string, fielsToUpdate: PatchStudentBatchDto): Promise<StudentBatch> {
        try {
            const updated= await this.studentBatchsRepository.update(
                id,
                fielsToUpdate
            )
            return await this.studentBatchsRepository.findOne({ where: { id } });
        }catch (error) {
            throw new InternalServerErrorException()
        }
    }

    async delete(id: string): Promise<StudentBatch> {
        const studentBatch = await this.findOne(id);
        if (!studentBatch) {
            throw new NotFoundException(`Student batch '${id}' not found`);
        }
        await this.studentBatchsRepository.delete(studentBatch.id);
        return studentBatch; //todo: do i need this
    }

}
