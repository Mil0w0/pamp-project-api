import { CreateStudentBatchDto } from "./create-student-batch-dto";
import { BadRequestException } from "@nestjs/common";
export class StudentBatchesValidator {
  static validateCreateStudentBatchDto(dto: CreateStudentBatchDto) {
    if (!dto.name) {
      throw new BadRequestException("Name is required");
    }
  }


}
