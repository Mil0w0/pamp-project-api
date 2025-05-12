import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {

    const app = await NestFactory.create(
        AppModule
    );

    const config = new DocumentBuilder()
        .setTitle("PAMP PROJECT SERVICE")
        .setDescription("The PAMP project service API")
        .setVersion("0.0")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("swagger-ui", app, document);

    app.enableCors({
        origin: true,
    });
    await app.listen(3000);

}

bootstrap();
