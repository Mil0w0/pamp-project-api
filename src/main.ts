import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle("PAMP PROJECT SERVICE")
        .setDescription("The PAMP project service API" +
            "\n\n" +
            "The JSON schema for the API can be found at [swagger-ui-json]("
            + "http://localhost:" + (process.env.PORT || 3000)
            + "/swagger-ui-json)")
        .setVersion("0.0")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("swagger-ui", app, document);

    app.enableCors({
        origin: true,
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on port ${port}`);
}

bootstrap();
