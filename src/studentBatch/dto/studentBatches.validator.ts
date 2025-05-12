import { CreateStudentBatch } from "./create-student-batch";
import { BadRequestException } from "@nestjs/common";

export class StudentBatchesValidator {
  static validateCreateStudentBatchDto(dto: CreateStudentBatch) {
    if (!dto.name) {
      throw new BadRequestException("Name is required");
    }
  }
}
