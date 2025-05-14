import {catchError, firstValueFrom} from "rxjs";
import {USER_SERVICE_URL} from "../constants";
import {AxiosError} from "axios";
import {Injectable, InternalServerErrorException} from "@nestjs/common";
import {HttpService} from "@nestjs/axios";
import {CreateStudent, CreateStudentsResponse, GetStudent} from "./dto/get-students-dao";

@Injectable()
export class StudentService {
    constructor(
        private readonly httpService: HttpService
    ) {
    }

    /*Returns number of students created*/
    async createStudentsAccount(students: CreateStudent[]): Promise<number> {
        try {
            const {data} = await firstValueFrom(
                this.httpService.post<CreateStudentsResponse>(`${USER_SERVICE_URL}/user-api/register/students`, students).pipe(
                    catchError((error: AxiosError) => {
                        throw new InternalServerErrorException(`Error while creating accounts: ${error}`);
                    }),
                ),
            );
            return data.created_count;
        } catch (error) {
            throw new InternalServerErrorException(`Something went wrong while creating accounts : ${error}`);
        }

    }


    async hasAccount(studentId: string) {
        try {
            const {status} = await firstValueFrom(
                this.httpService.get<GetStudent>(`${USER_SERVICE_URL}/user-api/users/${studentId}`).pipe(
                    catchError((error: AxiosError) => {
                        throw new InternalServerErrorException(`Error while checking if student exist: ${error}`);
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