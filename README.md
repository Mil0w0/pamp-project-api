#  PAMP project service

## About the app

    This API allows the creation and management of student batches (fr: promotions)

## Installing the app
    Run cp .env.exemple  .env and modify it
    Run docker-compose up --build

    The app is accessible at localhost:3000/

### Database Entities:
```mermaid
erDiagram
STUDENT_BATCHES {
uuid id PK "Primary Key"
string state "default: active"
timestamp createdAt "default: CURRENT_TIMESTAMP"
string name
string tags "default: empty"
string students "Comma-separated user IDs fetched from user service"
}
```

### Authors :
    - Loriane HILDERAL