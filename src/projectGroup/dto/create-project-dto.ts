import { ApiProperty } from "@nestjs/swagger";

import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class CreateProjectGroupDto {
  @ApiProperty({
    example: "Groupe 1",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "['aaaa-uuehfi-eoihfeio-eee', 'abaa-uuehfi-eoihfeio-eee ]",
    required: false,
  })
  @IsOptional()
  studentsIds?: string;
}

export class CreateBatchGroupsDto {
  @ApiProperty()
  @IsNotEmpty()
  groups: CreateProjectGroupDto[]

  @ApiProperty({
    example: "bbbb-rjihrf-fziohr",
    required: true
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;
}