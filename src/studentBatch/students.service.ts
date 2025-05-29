import { catchError, firstValueFrom, of } from "rxjs";
import { AxiosError } from "axios";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import {
  CreateStudent,
  CreateStudentsResponse,
  GetStudent,
} from "./dto/get-students-dao";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StudentService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public USER_SERVICE_URL = this.configService.get<string>("USER_SERVICE_URL");
  /*Returns number of students created*/
  async createStudentsAccount(
    students: CreateStudent[],
    token: string,
  ): Promise<number> {
    try {
      //Remove id from those students fixme: it's ugly but working
      const newStudents = students.map((student) => {
        return {
          email: student.email,
          first_name: student.first_name,
          last_name: student.last_name,
        };
      });

      const { data } = await firstValueFrom(
        this.httpService
          .post<CreateStudentsResponse>(
            `${this.USER_SERVICE_URL}/register/students`,
            { students: newStudents },
            {
              headers: {
                Authorization: token,
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              console.log(error);
              throw new InternalServerErrorException(
                `Error while creating accounts: ${error}`,
              );
            }),
          ),
      );
      return data.created_count;
    } catch (error) {
      throw new InternalServerErrorException(
        `Something went wrong while creating accounts : ${error}`,
      );
    }
  }

  /**
   * Check if student has an account already thx to their email
   * @param studentEmail
   * @param token
   */
  async hasAccount(studentEmail: string, token: string): Promise<boolean> {
    try {
      const { status } = await firstValueFrom(
        this.httpService
          .get<GetStudent>(
            `${this.USER_SERVICE_URL}/users/email/${encodeURIComponent(studentEmail)}`,
            {
              headers: {
                Authorization: token,
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              if (error.response?.status === 404) {
                return of({ status: 404 } as never); // Return mock response to indicate 404
              } else {
                throw new InternalServerErrorException(
                  `Error while checking if student exists: ${error.message}`,
                );
              }
            }),
          ),
      );
      //If the student isn't found return false else true
      return status !== 404;
    } catch (error) {
      throw new InternalServerErrorException(`${error}`);
    }
  }
}
