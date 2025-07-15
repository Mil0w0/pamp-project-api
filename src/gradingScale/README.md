# GradingScale API - Endpoints, DTOs et Bonnes Pratiques

Ce document regroupe tous les endpoints REST du module GradingScale, les DTOs associés, des exemples d'utilisation et les bonnes pratiques pour l'intégration côté frontend.

## Endpoints principaux

### Créer une grille de notation
- **POST** `/grading-scales`
- **Body** :
```json
{
  "type": "livrable",
  "targetId": "string (UUID)",
  "notationMode": "groupe | individuel",
  "title": "string"
}
```
- **Réponse 201** : Grille créée (voir exemple plus bas)

### Récupérer une grille de notation
- **GET** `/grading-scales/{id}`
- **Réponse 200** :
```json
{
  "id": "string (UUID)",
  "type": "livrable",
  "targetId": "string (UUID)",
  "notationMode": "groupe | individuel",
  "title": "string",
  "isValidated": true,
  "createdAt": "ISODate",
  "criteria": [ ... ]
}
```

### Modifier une grille de notation
- **PATCH** `/grading-scales/{id}`
- **Body** :
```json
{
  "title": "string (optionnel)"
}
```

### Supprimer une grille de notation
- **DELETE** `/grading-scales/{id}`

### Valider une grille de notation
- **POST** `/grading-scales/{id}/validate`

### Ajouter un critère à une grille
- **POST** `/grading-scales/{id}/criteria`
- **Body** :
```json
{
  "label": "string",
  "maxPoints": 20,
  "weight": 0.4,
  "commentsEnabled": true
}
```

### Modifier un critère
- **PUT** `/grading-scales/criteria/{criterionId}`
- **Body** :
```json
{
  "label": "string (optionnel)",
  "maxPoints": 20,
  "weight": 0.4,
  "commentsEnabled": true
}
```

### Supprimer un critère
- **DELETE** `/grading-scales/criteria/{criterionId}`

### Enregistrer des résultats de notation
- **POST** `/grading-scales/{id}/results`
- **Body** :
```json
{
  "targetGroupId": "string (UUID, optionnel)",
  "targetStudentId": "string (UUID, optionnel)",
  "results": [
    {
      "gradingCriterionId": "string (UUID)",
      "score": 18,
      "comment": "string (optionnel)"
    }
  ]
}
```
- **Réponse 201** :
```json
[
  {
    "id": "string (UUID)",
    "targetGroupId": "string (UUID)",
    "score": 18,
    "comment": "string",
    "gradingCriterionId": "string (UUID)",
    "createdBy": "string (UUID)",
    "createdAt": "ISODate"
  }
]
```

### Modifier un résultat de notation
- **PATCH** `/grading-scales/results/{resultId}`
- **Body** :
```json
{
  "score": 18,
  "comment": "string (optionnel)"
}
```

### Supprimer un résultat de notation
- **DELETE** `/grading-scales/results/{resultId}`

## DTOs principaux

- **CreateGradingScaleDto**
  - `type`: "livrable" | "rapport" | "soutenance"
  - `targetId`: string (UUID)
  - `notationMode`: "groupe" | "individuel"
  - `title`: string

- **UpdateGradingScaleDto**
  - `title?`: string

- **CreateGradingCriterionDto**
  - `label`: string
  - `maxPoints`: number
  - `weight`: number
  - `commentsEnabled`: boolean

- **UpdateGradingCriterionDto**
  - `label?`: string
  - `maxPoints?`: number
  - `weight?`: number
  - `commentsEnabled?`: boolean

- **CreateGradingResultDto**
  - `targetGroupId?`: string (UUID)
  - `targetStudentId?`: string (UUID)
  - `results`: GradingResultItemDto[]

- **GradingResultItemDto**
  - `gradingCriterionId`: string (UUID)
  - `score`: number
  - `comment?`: string

- **UpdateGradingResultDto**
  - `score?`: number
  - `comment?`: string

## Bonnes pratiques pour le frontend

- Toujours vérifier les statuts HTTP et gérer les erreurs 400, 403, 404.
- Utiliser les DTOs pour valider les données côté client avant envoi.
- Les UUIDs doivent être valides (vérification côté frontend recommandée).
- Après validation d'une grille, elle n'est plus modifiable ni supprimable.
- Les critères ne peuvent être modifiés/supprimés que si la grille n'est pas validée.
- Les champs optionnels doivent être omis ou explicitement mis à null selon le cas d'usage.
- Utiliser les exemples de requêtes/réponses pour simuler les appels API côté frontend.
- Respecter les types attendus (notamment pour les scores numériques et les UUIDs).

---

Pour plus d'exemples ou de détails, se référer à la documentation principale du projet ou contacter l'équipe backend.

---

# Endpoints Project, ProjectGroup et Step

## Project

### Créer un projet
- **POST** `/projects`
- **Body** :
```json
{
  "name": "string"
}
```
- **Réponse 201** : Projet créé

### Modifier un projet
- **PATCH** `/projects/{id}`
- **Body** :
```json
{
  "name": "string (optionnel)"
}
```

### Récupérer un projet
- **GET** `/projects/{id}`
- **Réponse 200** : Projet trouvé

### Lister les projets
- **GET** `/projects?limit=10&page=1`
- **Réponse 200** : Liste paginée

### Supprimer un projet
- **DELETE** `/projects/{id}`

### Copier un projet
- **POST** `/projects/{id}`

### Upsert report definition
- **PUT** `/projects/{id}/report-definition`
- **Body** : UpsertReportDefinitionDto

### Récupérer report definition
- **GET** `/projects/{id}/report-definition`

#### DTOs Project
- **CreateProjectDto** : `{ "name": string }`
- **PatchProjectDto** : `{ "name"?: string }`
- **ListProjectsDto** : `{ "limit"?: number, "page"?: number }`

## ProjectGroup

### Créer un groupe de projet
- **POST** `/projectGroups`
- **Body** :
```json
{
  "name": "string",
  "studentsIds": "string (liste d'UUIDs séparés par des virgules)"
}
```

### Modifier un groupe
- **PATCH** `/projectGroups/{id}`
- **Body** :
```json
{
  "name": "string (optionnel)"
}
```

### Récupérer un groupe
- **GET** `/projectGroups/{id}`

### Lister les groupes
- **GET** `/projectGroups?limit=10&page=1`

### Supprimer un groupe
- **DELETE** `/projectGroups/{id}`

### Mes groupes (étudiant)
- **GET** `/projectGroups/myGroups`

### Soumettre un rapport (étudiant)
- **POST** `/projectGroups/{id}/submit-report`

### Récupérer report definition
- **GET** `/projectGroups/{id}/report-definition`

#### DTOs ProjectGroup
- **CreateBatchGroupsDto** : `{ "name": string, "studentsIds"?: string }`
- **PatchGroupProjectDto** : `{ "name"?: string }`
- **ListProjectGroupsDto** : `{ "limit"?: number, "page"?: number, "studentId"?: string }`

## Step

### Créer ou mettre à jour les étapes d'un projet
- **POST** `/projects/{projectId}/steps`
- **Body** : Tableau de CreateStepDTO

### Modifier une étape
- **PATCH** `/projects/{projectId}/steps/{id}`
- **Body** : PatchStepDTO

### Récupérer une étape
- **GET** `/projects/{projectId}/steps/{id}`

### Lister les étapes d'un projet
- **GET** `/projects/{projectId}/steps?limit=10&page=1`

### Supprimer une étape
- **DELETE** `/projects/{projectId}/steps/{id}`

#### DTOs Step
- **CreateStepDTO** : `{ "name": string, "description"?: string, "hasMandatorySubmission"?: boolean }`
- **PatchStepDTO** : `{ "name"?: string, "description"?: string, "hasMandatorySubmission"?: boolean }`
- **ListStepDto** : `{ "limit"?: number, "page"?: number }`

### CreateGradingResultDto
- `targetGroupId?` : string (UUID)
- `targetStudentId?` : string (UUID)
- `results` : [`GradingResultItemDto`[]]

#### GradingResultItemDto
- `gradingCriterionId` : string (UUID)
- `score` : number
- `comment?` : string

### UpdateGradingResultDto
- `score?` : number
- `comment?` : string

---

## Notes
- Une grille validée (`isValidated: true`) ne peut plus être modifiée ni supprimée.
- Les critères et résultats sont liés à chaque grille via leurs UUIDs respectifs.
- Les erreurs courantes incluent : grille non trouvée (404), modification interdite (403), données invalides (400).