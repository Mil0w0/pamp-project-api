#  PAMP project service

## About the app

    This API allows the creation and management of student batches (fr: promotions)

## Installing the app
    Run cp .env.exemple  .env and modify it
    Run docker-compose up --build

to run the app in development mode:
```bash
  docker-compose -f docker-compose.dev.yml up --build
```

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
string projectIds FK
}

PROJECTS {
uuid id PK "Primary Key"
bool isPublished "default: false"
timestamp createdAt "default: CURRENT_TIMESTAMP"
string name
string description
string studentBatchId FK
}

PROJECT_GROUPS {
uuid id PK "Primary Key"
timestamp createdAt "default: CURRENT_TIMESTAMP"
string name
string projectId FK
string studentsIds
}
```

### Authors :
    - Loriane HILDERAL