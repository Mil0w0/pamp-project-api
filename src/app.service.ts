import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getPresentation(): string {
    return "This is the test endpoint of the API. Enjoy!";
  }
}
