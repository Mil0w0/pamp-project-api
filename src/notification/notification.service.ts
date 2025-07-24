import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { catchError, firstValueFrom } from "rxjs";
import { AxiosError } from "axios";
import { EmailNotification, NotificationError } from "./notification.types";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Sends an email notification using the notification API
   */
  private async sendEmailNotification(
    notification: EmailNotification,
  ): Promise<void> {
    try {
      const apiKey = this.configService.get<string>("NOTIFICATION_API_KEY");
      if (!apiKey) {
        throw NotificationError.envError("NOTIFICATION_API_KEY");
      }

      const response = await firstValueFrom(
        this.httpService
          .post(
            "https://b7ywphvnv6.execute-api.eu-west-1.amazonaws.com/prod/notify/email",
            notification,
            {
              headers: {
                "Content-Type": "application/json",
                "X-Api-Key": apiKey,
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              if (error.response) {
                const status = error.response.status;
                const errorText = error.response.data || "Unknown error";
                throw NotificationError.apiError(
                  `API returned error: ${status} - ${errorText}`,
                );
              }
              throw NotificationError.httpError(error);
            }),
          ),
      );

      if (response.status !== 200) {
        this.logger.error(response);
        return;
      }

      this.logger.log(
        `Email notification sent successfully to ${notification.to}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email notification to ${notification.to}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Sends project publication notification to a student about joining groups
   */
  async sendProjectGroupJoinNotification(
    studentEmail: string,
    studentFirstName: string,
    projectName: string,
    projectId: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get<string>("FRONTEND_URL") || "http://localhost:5173";
    const groupsUrl = `${frontendUrl}/projects/${projectId}/groups`;

    const message = `Hello ${studentFirstName},

Great news! The project "${projectName}" has been published and is now available.

You can now create or join a group for this project. Click the button below to access the groups page and get started.

Good luck with your project!

The PAMP Team
${groupsUrl}`;

    const notification: EmailNotification = {
      to: studentEmail,
      subject: `Project Published: ${projectName} - Join a Group`,
      message,
      from: "noreply@edulor.fr",
      buttonText: "Join a Group",
    };

    await this.sendEmailNotification(notification);
  }

  /**
   * Sends project publication notification to a student who is assigned to a specific group
   */
  async sendProjectGroupAssignedNotification(
    studentEmail: string,
    studentFirstName: string,
    projectName: string,
    projectId: string,
    groupId: string,
    groupName: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get<string>("FRONTEND_URL") || "http://localhost:5173";
    const groupUrl = `${frontendUrl}/projects/${projectId}/groups/${groupId}`;

    const message = `Hello ${studentFirstName},

Great news! The project "${projectName}" has been published and you have been assigned to "${groupName}".

You can now access your group workspace and start collaborating with your teammates. Click the button below to access your group.

Good luck with your project!

The PAMP Team
${groupUrl}`;

    const notification: EmailNotification = {
      to: studentEmail,
      subject: `Project Published: ${projectName} - Your Group is Ready`,
      message,
      from: "noreply@edulor.fr",
      buttonText: "Access Your Group",
    };

    await this.sendEmailNotification(notification);
  }

  /**
   * Sends project publication notification to a student when groups will be assigned by professor
   */
  async sendProjectGroupPendingNotification(
    studentEmail: string,
    studentFirstName: string,
    projectName: string,
    projectId: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get<string>("FRONTEND_URL") || "http://localhost:5173";
    const groupsUrl = `${frontendUrl}/projects/${projectId}/groups`;

    const message = `Hello ${studentFirstName},

Great news! The project "${projectName}" has been published and is now available.

Your professor will assign you to a group shortly. You will receive another notification once your group assignment is ready.

In the meantime, you can view the project details and check for group updates using the link below.

Good luck with your project!

The PAMP Team
${groupsUrl}`;

    const notification: EmailNotification = {
      to: studentEmail,
      subject: `Project Published: ${projectName} - Group Assignment Pending`,
      message,
      from: "noreply@edulor.fr",
      buttonText: "View Project Groups",
    };

    await this.sendEmailNotification(notification);
  }
}
