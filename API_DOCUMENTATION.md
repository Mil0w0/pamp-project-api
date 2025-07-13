# API Documentation - Spécifications détaillées

## 📋 Endpoints par module

### 🔍 Endpoint de test

#### GET /
**Description** : Endpoint de test de base de l'API

**Réponse** :
```json
{
  "message": "This is the test endpoint of the API. Enjoy!"
}
```

---

## 📊 Module Grilles de notation

### POST /grading-scales
**Description** : Créer une nouvelle grille de notation

**Corps de la requête** :
```json
{
  "projectId": "uuid", // Optionnel
  "type": "livrable|rapport|soutenance", // Requis
  "targetId": "uuid", // Requis - UUID de la cible
  "notationMode": "groupe|individuel", // Requis
  "title": "string", // Requis
  "criteria": [ // Optionnel - Critères intégrés
    {
      "label": "string",
      "maxPoints": "number",
      "weight": "number", // Optionnel
      "commentEnabled": "boolean" // Optionnel
    }
  ]
}
```

**Réponse 201** :
```json
{
  "id": "uuid",
  "type": "livrable",
  "targetId": "uuid",
  "notationMode": "groupe",
  "title": "string",
  "isValidated": false,
  "createdBy": "uuid",
  "projectId": "uuid",
  "createdAt": "2025-01-12T10:30:00.000Z",
  "updatedAt": "2025-01-12T10:30:00.000Z",
  "criteria": [
    {
      "id": "uuid",
      "label": "string",
      "maxPoints": 20,
      "weight": 0.5,
      "commentEnabled": true
    }
  ]
}
```

**Erreurs** :
- 400 : Données invalides (type, targetId, notationMode)

### GET /grading-scales/{id}
**Description** : Récupérer une grille de notation par ID

**Paramètres** :
- `id` (path) : UUID de la grille

**Réponse 200** : Même structure que POST

**Erreurs** :
- 404 : Grille non trouvée

### PATCH /grading-scales/{id}
**Description** : Modifier une grille de notation

**Corps de la requête** :
```json
{
  "title": "string" // Optionnel
}
```

**Réponse 200** : Grille mise à jour

### POST /grading-scales/{id}/validate
**Description** : Valider une grille de notation

**Réponse 200** : Grille avec `isValidated: true`

### DELETE /grading-scales/{id}
**Description** : Supprimer une grille de notation

**Réponse 200** : Succès

**Erreurs** :
- 403 : Grille validée (suppression interdite)

---

## 📏 Critères de notation

### POST /grading-scales/{id}/criteria
**Description** : Ajouter un critère à une grille

**Corps de la requête** :
```json
{
  "label": "string", // Requis
  "maxPoints": "number", // Requis
  "weight": "number", // Optionnel
  "commentEnabled": "boolean" // Optionnel
}
```

**Réponse 201** :
```json
{
  "id": "uuid",
  "label": "string",
  "maxPoints": 20,
  "weight": 0.5,
  "commentEnabled": true,
  "gradingScale": {
    "id": "uuid",
    "title": "string"
  }
}
```

### PUT /grading-scales/criteria/{criterionId}
**Description** : Modifier un critère

**Corps de la requête** :
```json
{
  "label": "string", // Optionnel
  "maxPoints": "number", // Optionnel
  "weight": "number", // Optionnel
  "commentEnabled": "boolean" // Optionnel
}
```

### DELETE /grading-scales/criteria/{criterionId}
**Description** : Supprimer un critère

**Erreurs** :
- 403 : Grille validée (suppression interdite)

---

## 📈 Résultats de notation

### POST /grading-scales/{id}/results
**Description** : Enregistrer des résultats de notation

**Corps de la requête** :
```json
{
  "targetGroupId": "uuid", // Optionnel
  "targetStudentId": "uuid", // Optionnel
  "results": [ // Requis - DOIT être un tableau
    {
      "gradingCriterionId": "uuid", // Requis
      "score": "number", // Requis (≥ 0)
      "comment": "string" // Optionnel
    }
  ]
}
```

**Réponse 201** :
```json
{
  "id": "uuid",
  "targetGroupId": "uuid",
  "targetStudentId": "uuid",
  "score": 18,
  "comment": "string",
  "createdBy": "uuid",
  "gradingCriterionId": "uuid",
  "createdAt": "2025-01-12T10:30:00.000Z"
}
```

### GET /grading-scales/{id}/results
**Description** : Récupérer tous les résultats d'une grille

**Réponse 200** :
```json
[
  {
    "id": "uuid",
    "targetGroupId": "uuid",
    "score": 18,
    "comment": "string",
    "createdBy": "uuid",
    "gradingCriterionId": "uuid",
    "createdAt": "2025-01-12T10:30:00.000Z",
    "gradingCriterion": {
      "id": "uuid",
      "label": "string",
      "maxPoints": 20
    }
  }
]
```

### PUT /grading-scales/results/{resultId}
**Description** : Modifier un résultat

**Corps de la requête** :
```json
{
  "score": "number", // Optionnel (≥ 0)
  "comment": "string" // Optionnel
}
```

---

## 📁 Module Projets

⚠️ **Authentification JWT requise** pour la plupart des endpoints

### POST /projects
**Description** : Créer un nouveau projet

**Headers** :
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Corps de la requête** :
```json
{
  "title": "string", // Requis
  "description": "string", // Optionnel
  "startDate": "YYYY-MM-DD", // Optionnel
  "endDate": "YYYY-MM-DD", // Optionnel
  "studentBatchId": "uuid" // Optionnel
}
```

**Erreurs courantes** :
- 401 : Token manquant ou invalide
- 500 : Erreur d'authentification interne

### GET /projects
**Description** : Lister tous les projets

**Erreurs courantes** :
- 500 : Erreur serveur (problème d'authentification)

### GET /projects/{id}
**Description** : Récupérer un projet par ID

### PATCH /projects/{id}
**Description** : Modifier un projet

### DELETE /projects/{id}
**Description** : Supprimer un projet

### POST /projects/{id}
**Description** : Copier un projet existant

### PUT /projects/{id}/report-definition
**Description** : Créer/remplacer la définition de rapport d'un projet

**Corps de la requête** :
```json
{
  "template": "string", // Template Markdown
  "instructions": "string" // Instructions
}
```

### GET /projects/{id}/report-definition
**Description** : Récupérer la définition de rapport d'un projet

### GET /projects/{id}/grading-scales
**Description** : Récupérer toutes les grilles de notation d'un projet

---

## 👥 Module Groupes de projet

### POST /projectGroups
**Description** : Créer un groupe de projet

**Corps de la requête** :
```json
{
  "name": "string", // Requis
  "projectId": "uuid", // Requis
  "members": ["uuid"] // Tableau d'UUIDs d'étudiants
}
```

### GET /projectGroups
**Description** : Lister tous les groupes

### GET /projectGroups/{id}
**Description** : Récupérer un groupe par ID

### PATCH /projectGroups/{id}
**Description** : Modifier un groupe

### DELETE /projectGroups/{id}
**Description** : Supprimer un groupe

### GET /projectGroups/myGroups
**Description** : Récupérer les groupes de l'étudiant connecté

**Headers** :
```
Authorization: Bearer {student_jwt_token}
```

### POST /projectGroups/{id}/submit-report
**Description** : Soumettre un rapport pour un groupe

**Headers** :
```
Authorization: Bearer {student_jwt_token}
```

**Corps de la requête** :
```json
{
  "content": "string", // Contenu du rapport
  "attachments": ["string"] // Fichiers joints
}
```

---

## 📋 Module Étapes

### POST /projects/{projectId}/steps
**Description** : Créer/remplacer toutes les étapes d'un projet

**Corps de la requête** :
```json
[
  {
    "title": "string", // Requis
    "description": "string", // Optionnel
    "startDate": "YYYY-MM-DD", // Optionnel
    "endDate": "YYYY-MM-DD", // Optionnel
    "order": "number" // Ordre d'affichage
  }
]
```

### GET /projects/{projectId}/steps
**Description** : Lister toutes les étapes d'un projet

### GET /projects/{projectId}/steps/{id}
**Description** : Récupérer une étape par ID

### PATCH /projects/{projectId}/steps/{id}
**Description** : Modifier une étape

### DELETE /projects/{projectId}/steps/{id}
**Description** : Supprimer une étape

---

## 🎓 Module Promotions d'étudiants

### POST /student-batches
**Description** : Créer une promotion d'étudiants

**Corps de la requête** :
```json
{
  "name": "string", // Requis
  "year": "number", // Optionnel
  "students": [ // Optionnel
    {
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    }
  ]
}
```

### GET /student-batches
**Description** : Lister toutes les promotions

### GET /student-batches/{id}
**Description** : Récupérer une promotion par ID

### PATCH /student-batches/{id}
**Description** : Modifier une promotion

### DELETE /student-batches/{id}
**Description** : Supprimer une promotion

### GET /student-batches/myStudentBatches
**Description** : Récupérer les promotions de l'étudiant connecté

**Headers** :
```
Authorization: Bearer {student_jwt_token}
```

---

## 📄 Module Définitions de rapport

### POST /report-definitions
**Description** : Créer une définition de rapport

**Corps de la requête** :
```json
{
  "title": "string", // Requis
  "template": "string", // Template Markdown
  "instructions": "string" // Instructions
}
```

### GET /report-definitions
**Description** : Lister toutes les définitions

### GET /report-definitions/{id}
**Description** : Récupérer une définition par ID

### PATCH /report-definitions/{id}
**Description** : Modifier une définition

### DELETE /report-definitions/{id}
**Description** : Supprimer une définition

### GET /report-definitions/project/{projectId}
**Description** : Récupérer la définition de rapport d'un projet

### PATCH /report-definitions/project/{projectId}
**Description** : Modifier la définition de rapport d'un projet

---

## 🔗 Module Collaboration temps réel (Liveblocks)

### POST /liveblocks/auth
**Description** : Authentification pour Liveblocks

**Corps de la requête** :
```json
{
  "room": "string", // ID de la salle
  "userId": "uuid" // ID de l'utilisateur
}
```

**Erreurs courantes** :
- 500 : Erreur de configuration Liveblocks

---

## 🔧 Règles de validation

### UUIDs
- Tous les IDs doivent être des UUID v4 valides
- Format : `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

### Énumérations
- `type` : `livrable`, `rapport`, `soutenance`
- `notationMode` : `groupe`, `individuel`

### Contraintes numériques
- `score` : ≥ 0
- `maxPoints` : > 0
- `weight` : 0 ≤ weight ≤ 1

### Contraintes de chaînes
- `title`, `label` : Non vides
- `email` : Format email valide

---

## 🚨 Gestion des erreurs

### Format standard des erreurs
```json
{
  "message": "string ou array",
  "error": "string",
  "statusCode": "number"
}
```

### Erreurs de validation (400)
```json
{
  "message": [
    "type must be one of the following values: livrable, rapport, soutenance",
    "targetId must be a UUID"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Erreurs métier (403)
```json
{
  "message": "Cannot delete a validated grading scale",
  "error": "Forbidden",
  "statusCode": 403
}
```

### Erreurs d'authentification (401)
```json
{
  "message": "Unauthorized",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

## 📊 Statuts des endpoints

### ✅ Endpoints fonctionnels (85%)
- Grilles de notation : Complet
- Critères de notation : Complet
- Résultats de notation : Complet
- Endpoint de test : Fonctionnel

### ⚠️ Endpoints avec limitations
- Projets : Authentification requise
- Groupes de projet : Partiellement testé
- Étapes : Non testé
- Promotions : Non testé
- Définitions de rapport : Non testé
- Liveblocks : Configuration requise

---

## 🔍 Tests recommandés

### Tests de base
1. Créer une grille simple
2. Ajouter des critères
3. Valider la grille
4. Enregistrer des résultats
5. Récupérer les résultats

### Tests avancés
1. Créer une grille avec critères intégrés
2. Tenter de supprimer une grille validée
3. Modifier des critères
4. Tester les validations UUID
5. Tester les énumérations

### Tests d'erreur
1. Données invalides
2. UUIDs malformés
3. Actions interdites
4. Ressources non trouvées

---

**Documentation générée le** : 2025-01-12  
**Version de l'API** : 1.0.0