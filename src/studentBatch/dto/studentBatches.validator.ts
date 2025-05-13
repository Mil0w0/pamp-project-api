import { CreateStudentBatch } from "./create-student-batch";
import { BadRequestException } from "@nestjs/common";
import {PatchStudentBatchDto} from "./update-student-batch.dto";

export class StudentBatchesValidator {
  static validateCreateStudentBatchDto(dto: CreateStudentBatch) {
    if (!dto.name) {
      throw new BadRequestException("Name is required");
    }
  }


}
