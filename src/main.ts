import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('PAMP PROJECT SERVICE')
    .setDescription('API RESTful pour la gestion des projets étudiants')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('StudentBatches', 'Gestion des promotions d\'étudiants')
    .addTag('Projects', 'Gestion des projets')
    .addTag('Steps', 'Gestion des étapes de projet')
    .addTag('ProjectGroups', 'Gestion des groupes de projet')
    .addTag('Report Definitions', 'Gestion des définitions de rapport')
    .addTag('Liveblocks', 'Collaboration temps réel')
    .addTag('GradingScales', 'Gestion des grilles de notation')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      // tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'PAMP PROJECT SERVICE',
  });
  SwaggerModule.setup("swagger-ui", app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: 1,
      // tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'PAMP PROJECT SERVICE',
  });

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

bootstrap();
