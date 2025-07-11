import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { Liveblocks } from "@liveblocks/node";
import { catchError, firstValueFrom } from "rxjs";
import { AxiosError } from "axios";

interface AuthUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "STUDENT" | "TEACHER";
}

@Injectable()
export class LiveblocksService {
  private liveblocks: Liveblocks | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const liveblocksSecret = this.configService.get<string>(
      "LIVEBLOCKS_SECRET_KEY",
    );
    
    // Only initialize Liveblocks if we have a valid secret key
    if (liveblocksSecret && liveblocksSecret.startsWith('sk_')) {
      this.liveblocks = new Liveblocks({
        secret: liveblocksSecret,
      });
    } else {
      console.warn('Liveblocks service disabled: Invalid or missing LIVEBLOCKS_SECRET_KEY (must start with "sk_")');
      this.liveblocks = null;
    }
  }

  private get USER_SERVICE_URL() {
    return this.configService.get<string>("USER_SERVICE_URL");
  }

  /**
   * Get current user info from the auth service
   */
  async getCurrentUser(authHeader: string): Promise<AuthUser> {
    console.log("Getting current user from auth service");
    console.log("Auth header provided:", !!authHeader);
    console.log("USER_SERVICE_URL:", this.USER_SERVICE_URL);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error(
        "Invalid auth header format:",
        authHeader ? "Present but wrong format" : "Missing",
      );
      throw new UnauthorizedException("No valid token provided");
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get<AuthUser>(`${this.USER_SERVICE_URL}/me`, {
            headers: {
              Authorization: authHeader,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error(
                "Auth service error:",
                error.response?.status,
                error.response?.data,
              );
              if (error.response?.status === 401) {
                throw new UnauthorizedException("Invalid or expired token");
              }
              throw new UnauthorizedException(
                `Authentication failed: ${error.message}`,
              );
            }),
          ),
      );

      console.log("User authenticated:", {
        user_id: data.user_id,
        role: data.role,
      });
      return data;
    } catch (error) {
      console.error("Failed to get current user:", error.message);
      throw error;
    }
  }

  /**
   * Check if user has access to the specified project group
   */
  async checkGroupAccess(
    user: AuthUser,
    projectId: string,
    groupId: string,
  ): Promise<boolean> {
    console.log(
      `Checking access for user ${user.user_id} to project ${projectId}, group ${groupId}`,
    );

    // Teachers have access to all groups
    if (user.role === "TEACHER") {
      console.log("User is a teacher, granting access");
      return true;
    }

    // For students, we would need to check if they belong to this group
    // For now, we'll implement a basic check - in a real system, you'd query the database
    // to verify the student is assigned to this specific group

    console.log("User is a student, checking group membership...");

    // TODO: Implement actual group membership check
    // This would typically involve querying the database to see if the student
    // is assigned to the specified project group

    // For now, we'll allow access (you should implement proper group membership checking)
    console.log(
      "Allowing student access (TODO: implement proper group membership check)",
    );
    return true;
  }

  /**
   * Generate Liveblocks access token for the specified room
   */
  async generateAccessToken(
    authHeader: string,
    projectId: string,
    groupId: string,
  ) {
    console.log(
      `Generating access token for project ${projectId}, group ${groupId}`,
    );

    // Check if Liveblocks is initialized
    if (!this.liveblocks) {
      throw new Error('Liveblocks service is not available. Please configure a valid LIVEBLOCKS_SECRET_KEY.');
    }

    try {
      // Get user info from auth service
      const user = await this.getCurrentUser(authHeader);

      // Check if user has access to this group
      const hasAccess = await this.checkGroupAccess(user, projectId, groupId);
      if (!hasAccess) {
        throw new ForbiddenException("You do not have access to this group");
      }

      // Generate room ID
      const roomId = `project-${projectId}-group-${groupId}-report`;
      console.log("Generated room ID:", roomId);

      // Create Liveblocks session
      console.log("Creating Liveblocks session for user:", user.user_id);
      console.log("User info:", {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      });

      const session = this.liveblocks.prepareSession(user.user_id, {
        userInfo: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role,
        },
      });

      // Allow access to the specific room
      console.log("Granting FULL_ACCESS to room:", roomId);
      session.allow(roomId, session.FULL_ACCESS);

      // Generate token
      const authResponse = await session.authorize();
      console.log("Successfully generated Liveblocks token");
      console.log("Raw authResponse.body:", authResponse.body);

      // Parse the token from the response body
      let token: string;
      try {
        const parsedBody = JSON.parse(authResponse.body);
        token = parsedBody.token;
        console.log("Extracted token from JSON response");
      } catch {
        // If it's not JSON, assume it's the token directly
        token = authResponse.body;
        console.log("Using raw response as token");
      }

      console.log("Final token preview:", token.substring(0, 50) + "...");

      return {
        token: token,
        roomId,
      };
    } catch (error) {
      console.error("Error generating access token:", error.message);
      throw error;
    }
  }
}
