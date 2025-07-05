import { ApiProperty } from "@nestjs/swagger";

import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateStepDTO {
  @IsOptional()
  id?: string;

  @ApiProperty({
    example: "Step 1",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "descriptio nd e fou",
    required: false,
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  hasMandatorySubmission?: boolean;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  allowSubmittingAfterDeadLine?: boolean;

  @ApiProperty({
    example: "12-06-2025T10:00:00Z",
    required: false,
  })
  @IsOptional()
  submissionDeadLine?: boolean;
}

export class PatchStepDTO {
  @ApiProperty({
    example: "Step 1",
    required: true,
  })
  @IsOptional()
  name: string;

  @ApiProperty({
    example: "descriptio nd e fou",
    required: false,
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  hasMandatorySubmission?: boolean;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  allowSubmittingAfterDeadLine?: boolean;

  @ApiProperty({
    example: "12-06-2025T10:00:00Z",
    required: false,
  })
  @IsOptional()
  submissionDeadLine?: boolean;

  @ApiProperty({
    example: "aaaa-1111-fkfeojfeoij-ffzm",
    required: false,
  })
  @IsOptional()
  submissionId?: string;
}