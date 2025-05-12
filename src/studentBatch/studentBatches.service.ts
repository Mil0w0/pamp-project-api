import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException,} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {StudentBatch} from "./studentBatch.entity";
import {CreateStudentBatch} from "./dto/create-student-batch";
import {WebsitesValidator} from "./dto/websites.validator";
@Injectable()
export class StudentBatchesService {
    constructor(
        @InjectRepository(StudentBatch)
        private studentBatchsRepository: Repository<StudentBatch>,
    ) {
    }

    async create(studentBatch: CreateStudentBatch): Promise<StudentBatch> {
        try {
            WebsitesValidator.validateWebsiteDto(studentBatch);
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

}
