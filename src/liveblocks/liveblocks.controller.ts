import { Body, Controller, Headers, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LiveblocksService } from "./liveblocks.service";

interface LiveblocksAuthRequest {
  projectId: string;
  groupId: string;
}

@ApiTags("Liveblocks")
@Controller("liveblocks")
export class LiveblocksController {
  constructor(private readonly liveblocksService: LiveblocksService) {}

  @Post("auth")
  @ApiResponse({
    status: 200,
    description: "Access token generated successfully",
    schema: {
      type: "object",
      properties: {
        token: { type: "string" },
        roomId: { type: "string" },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or expired token",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - User does not have access to this group",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        groupId: { type: "string" },
      },
    },
  })
  async authenticate(
    @Body() body: LiveblocksAuthRequest,
    @Headers("authorization") authHeader: string,
  ) {
    console.log("Liveblocks auth request received:", {
      projectId: body.projectId,
      groupId: body.groupId,
      hasAuthHeader: !!authHeader,
    });

    try {
      const result = await this.liveblocksService.generateAccessToken(
        authHeader,
        body.projectId,
        body.groupId,
      );

      console.log("Liveblocks auth successful, returning token and room ID");
      return result;
    } catch (error) {
      console.error("Liveblocks auth failed:", error.message);
      throw error;
    }
  }
}
