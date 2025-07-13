# Gestion des grilles de notation (GradingScales)

Ce module gère la création, la modification, la validation et la suppression des grilles de notation, ainsi que la gestion des critères et des résultats associés.

## Endpoints

### 1. Créer une grille de notation
- **POST** `/grading-scales`
- **Body** : [`CreateGradingScaleDto`](#dtos)
- **Réponse 201** : Grille créée (exemple)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "type": "livrable",
  "targetId": "123e4567-e89b-12d3-a456-426614174001",
  "notationMode": "groupe",
  "title": "Évaluation Livrable 1",
  "isValidated": false,
  "createdAt": "2025-01-12T10:00:00Z",
  "criteria": []
}
```

### 2. Récupérer une grille de notation
- **GET** `/grading-scales/{id}`
- **Paramètre** : `id` (UUID)
- **Réponse 200** : Grille trouvée (exemple)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "type": "livrable",
  "targetId": "123e4567-e89b-12d3-a456-426614174001",
  "notationMode": "groupe",
  "title": "Évaluation Livrable 1",
  "isValidated": true,
  "createdAt": "2025-01-12T10:00:00Z",
  "criteria": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "label": "Qualité du code",
      "maxPoints": 20,
      "weight": 0.4,
      "commentsEnabled": true
    }
  ]
}
```

### 3. Modifier une grille de notation
- **PATCH** `/grading-scales/{id}`
- **Paramètre** : `id` (UUID)
- **Body** : [`UpdateGradingScaleDto`](#dtos)
- **Réponse 200** : Grille modifiée

### 4. Supprimer une grille de notation
- **DELETE** `/grading-scales/{id}`
- **Paramètre** : `id` (UUID)
- **Réponse 200** : Grille supprimée

### 5. Valider une grille de notation
- **POST** `/grading-scales/{id}/validate`
- **Paramètre** : `id` (UUID)
- **Réponse 200** :
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "isValidated": true,
  "validatedAt": "2025-01-12T10:30:00Z"
}
```

### 6. Ajouter un critère à une grille
- **POST** `/grading-scales/{id}/criteria`
- **Paramètre** : `id` (UUID)
- **Body** : [`CreateGradingCriterionDto`](#dtos)
- **Réponse 201** : Critère ajouté

### 7. Modifier un critère
- **PUT** `/grading-scales/criteria/{criterionId}`
- **Paramètre** : `criterionId` (UUID)
- **Body** : [`UpdateGradingCriterionDto`](#dtos)
- **Réponse 200** : Critère modifié

### 8. Supprimer un critère
- **DELETE** `/grading-scales/criteria/{criterionId}`
- **Paramètre** : `criterionId` (UUID)
- **Réponse 200** : Critère supprimé

### 9. Enregistrer des résultats de notation
- **POST** `/grading-scales/{id}/results`
- **Paramètre** : `id` (UUID)
- **Body** : [`CreateGradingResultDto`](#dtos)
- **Réponse 201** : Résultat enregistré

#### Exemple de requête
```json
{
  "targetGroupId": "groupe-uuid",
  "targetStudentId": "student-uuid",
  "results": [
    {
      "gradingCriterionId": "criterion-uuid",
      "score": 18,
      "comment": "Excellent travail sur la qualité du code"
    }
  ]
}
```

#### Exemple de réponse
```json
[
  {
    "id": "result-uuid",
    "targetGroupId": "groupe-uuid",
    "score": 18,
    "comment": "Excellent travail sur la qualité du code",
    "gradingCriterionId": "criterion-uuid",
    "createdBy": "user-uuid",
    "createdAt": "2025-01-12T11:00:00Z"
  }
]
```

#### Contrôleur (extrait)
```typescript
@Post(":id/results")
@UsePipes(new ValidationPipe())
async createResults(
  @Param("id") id: string,
  @Body() createGradingResultDto: CreateGradingResultDto,
  @Req() req: Request & { user?: { user_id: string } },
) {
  const createdBy = req.user?.user_id || "system";
  return this.gradingScaleService.createResults(
    id,
    createGradingResultDto,
    createdBy,
  );
}
```

#### Service (extrait)
```typescript
async createResults(
  gradingScaleId: string,
  createGradingResultDto: CreateGradingResultDto,
  createdBy: string,
): Promise<GradingResult[]> {
  const gradingScale = await this.findOne(gradingScaleId);

  if (gradingScale.isValidated) {
    throw new ForbiddenException(
      "Cannot add results to a validated grading scale",
    );
  }

  const results = [];
  for (const resultItem of createGradingResultDto.results) {
    const criterion = await this.gradingCriterionRepository.findOne({
      where: { id: resultItem.gradingCriterionId },
    });
    if (!criterion) {
      throw new NotFoundException(`Criterion with ID ${resultItem.gradingCriterionId} not found`);
    }
    const result = this.gradingResultRepository.create({
      score: resultItem.score,
      comment: resultItem.comment,
      targetGroupId: createGradingResultDto.targetGroupId,
      targetStudentId: createGradingResultDto.targetStudentId,
      gradingCriterion: criterion,
      createdBy,
    });
    results.push(result);
  }
  return this.gradingResultRepository.save(results);
}
```

#### Logique de gestion et validation
- **Vérification de la grille** : la grille doit exister, sinon une erreur 404 est renvoyée.
- **Validation de la grille** : il est interdit d'ajouter des résultats à une grille déjà validée (`ForbiddenException`).
- **Vérification des critères** : chaque résultat doit référencer un critère existant, sinon une erreur 404 est renvoyée.
- **Validation des données** : les DTOs sont validés via `ValidationPipe` (types, champs obligatoires, etc).
- **Gestion des erreurs** :
  - 404 si la grille ou un critère n'existe pas
  - 403 si la grille est validée
  - 400 si les données sont invalides

### 10. Modifier un résultat de notation
- **PATCH** `/grading-scales/results/{resultId}`
- **Paramètre** : `resultId` (UUID)
- **Body** : [`UpdateGradingResultDto`](#dtos)
- **Réponse 200** : Résultat modifié

### 11. Supprimer un résultat de notation
- **DELETE** `/grading-scales/results/{resultId}`
- **Paramètre** : `resultId` (UUID)
- **Réponse 200** : Résultat supprimé

---

## DTOs

### CreateGradingScaleDto
- `projectId?` : string (UUID)
- `type` : "livrable" | "rapport" | "soutenance"
- `targetId` : string (UUID)
- `notationMode` : "groupe" | "individuel"
- `title` : string
- `criteria?` : [`CreateGradingCriterionDto`[]]

### UpdateGradingScaleDto
- `title?` : string

### CreateGradingCriterionDto
- `label` : string
- `maxPoints` : number
- `weight?` : number
- `commentEnabled?` : boolean

### UpdateGradingCriterionDto
- `label?` : string
- `maxPoints?` : number
- `weight?` : number
- `commentEnabled?` : boolean

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