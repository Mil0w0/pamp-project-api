import { IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class PatchGroupProjectDto {
  @ApiProperty({
    example: "PROJECT group z",
    required: false,
  })
  @IsOptional()
  name?: string;


  @ApiProperty({
    example: 'aaaa-uuehfi-eoihfeio-eee, abaa-uuehfi-eoihfeio-eee',
    required: false,
  })
  @IsOptional()
  studentsIds?: string;
}