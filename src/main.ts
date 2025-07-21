import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import * as path from "path";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          dirname: path.join(__dirname, "../logs"),
          filename: "app.log",
          level: "debug",
        }),
      ],
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  });

  const config = new DocumentBuilder()
    .setTitle("PAMP PROJECT SERVICE")
    .setDescription(
      "The PAMP project service API" +
        "\n\n" +
        "The JSON schema for the API can be found at [swagger-ui-json](" +
        "http://localhost:" +
        (process.env.PORT || 3000) +
        "/swagger-ui-json)",
    )
    .setVersion("3.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      docExpansion: "list",
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      operationsSorter: (a, b) => {
        const methodsOrder = [
          "post",
          "get",
          "put",
          "patch",
          "delete",
          "options",
          "head",
          "trace",
        ];
        let result =
          methodsOrder.indexOf(a.get("method")) -
          methodsOrder.indexOf(b.get("method"));
        if (result === 0) {
          result = a.get("path").localeCompare(b.get("path"));
        }
        return result;
      },
      tagsSorter: (a, b) => {
        const order = [
          "default",
          "StudentBatches",
          "Projects",
          "ProjectGroups",
          "Report Definitions",
          "Liveblocks",
          "GradingScales",
          "schemas",
        ];
        return order.indexOf(a) - order.indexOf(b);
      },
    },
    customSiteTitle: "PAMP PROJECT SERVICE",
  });
  SwaggerModule.setup("swagger-ui", app, document, {
    swaggerOptions: {
      docExpansion: "list",
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      operationsSorter: (a, b) => {
        const methodsOrder = [
          "post",
          "get",
          "put",
          "patch",
          "delete",
          "options",
          "head",
          "trace",
        ];
        let result =
          methodsOrder.indexOf(a.get("method")) -
          methodsOrder.indexOf(b.get("method"));
        if (result === 0) {
          result = a.get("path").localeCompare(b.get("path"));
        }
        return result;
      },
      tagsSorter: (a, b) => {
        const order = [
          "default",
          "StudentBatches",
          "Projects",
          "ProjectGroups",
          "Report Definitions",
          "Liveblocks",
          "GradingScales",
          "schemas",
        ];
        return order.indexOf(a) - order.indexOf(b);
      },
    },
    customSiteTitle: "PAMP PROJECT SERVICE",
  });

  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Cache-Control",
      "Pragma",
    ],
  });

  app.enableCors({
    origin: "https://auth.edulor.fr",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Cache-Control",
      "Pragma",
    ],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

bootstrap();
