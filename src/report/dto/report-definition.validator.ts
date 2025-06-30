import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

export function IsValidReportDefinition(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isValidReportDefinition",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>;
          const format = obj.format;
          const instruction = obj.instruction;
          const questions = obj.questions;

          if (format === "CLASSIC") {
            // For CLASSIC format: instruction is mandatory, questions should be null/undefined
            if (
              typeof instruction !== "string" ||
              !instruction ||
              instruction.trim() === ""
            ) {
              return false;
            }
            if (
              questions !== null &&
              questions !== undefined &&
              questions !== ""
            ) {
              return false;
            }
          } else if (format === "QUESTIONNAIRE") {
            // For QUESTIONNAIRE format: questions is mandatory, instruction is optional
            if (
              typeof questions !== "string" ||
              !questions ||
              questions.trim() === ""
            ) {
              return false;
            }
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>;
          const format = obj.format;

          if (format === "CLASSIC") {
            if (
              typeof obj.instruction !== "string" ||
              !obj.instruction ||
              obj.instruction.trim() === ""
            ) {
              return "For CLASSIC format, instruction field is mandatory";
            }
            if (
              obj.questions !== null &&
              obj.questions !== undefined &&
              obj.questions !== ""
            ) {
              return "For CLASSIC format, questions field should be null or empty";
            }
          } else if (format === "QUESTIONNAIRE") {
            if (
              typeof obj.questions !== "string" ||
              !obj.questions ||
              obj.questions.trim() === ""
            ) {
              return "For QUESTIONNAIRE format, questions field is mandatory";
            }
          }

          return "Invalid report definition format validation";
        },
      },
    });
  };
}
