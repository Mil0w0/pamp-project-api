# PAMP Project API - Documentation complète

## 🚀 Vue d'ensemble

API REST pour la gestion de projets étudiants avec système de notation avancé. Cette API permet de gérer des projets, des groupes d'étudiants, des grilles de notation et des résultats d'évaluation.

## 📋 Table des matières

- [Installation et démarrage](#installation-et-démarrage)
- [Architecture](#architecture)
- [Endpoints disponibles](#endpoints-disponibles)
- [Grilles de notation](#grilles-de-notation)
- [Projets](#projets)
- [Groupes de projet](#groupes-de-projet)
- [Étapes](#étapes)
- [Promotions d'étudiants](#promotions-détudiants)
- [Définitions de rapport](#définitions-de-rapport)
- [Collaboration temps réel](#collaboration-temps-réel)
- [DTOs et modèles de données](#dtos-et-modèles-de-données)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Codes d'erreur](#codes-derreur)
- [Bonnes pratiques](#bonnes-pratiques)

## 🛠 Installation et démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run start:dev

# L'API sera disponible sur http://localhost:3001
```

## 🏗 Architecture

- **Framework** : NestJS avec TypeScript
- **Base de données** : TypeORM (compatible PostgreSQL, MySQL, SQLite)
- **Documentation** : Swagger/OpenAPI
- **Validation** : class-validator
- **Authentification** : JWT (pour certains endpoints)

## 📡 Endpoints disponibles

### URL de base : `http://localhost:3001`

---

## 📊 Grilles de notation

### Types de grilles disponibles
- `livrable` : Évaluation de livrables
- `rapport` : Évaluation de rapports
- `soutenance` : Évaluation de soutenances

### Modes de notation
- `groupe` : Notation par groupe
- `individuel` : Notation individuelle

### Endpoints

#### Créer une grille de notation
```http
POST /grading-scales
Content-Type: application/json

{
  "type": "livrable",
  "targetId": "550e8400-e29b-41d4-a716-446655440000",
  "notationMode": "groupe",
  "title": "Grille Livrable 1",
  "projectId": "project-uuid" // Optionnel
}
```

#### Créer une grille avec critères intégrés
```http
POST /grading-scales
Content-Type: application/json

{
  "type": "soutenance",
  "targetId": "550e8400-e29b-41d4-a716-446655440000",
  "notationMode": "groupe",
  "title": "Grille Soutenance",
  "criteria": [
    {
      "label": "Présentation orale",
      "maxPoints": 10,
      "weight": 0.4,
      "commentEnabled": true
    },
    {
      "label": "Réponses aux questions",
      "maxPoints": 10,
      "weight": 0.6,
      "commentEnabled": false
    }
  ]
}
```

#### Récupérer une grille
```http
GET /grading-scales/{id}
```

#### Modifier une grille
```http
PATCH /grading-scales/{id}
Content-Type: application/json

{
  "title": "Nouveau titre"
}
```

#### Valider une grille
```http
POST /grading-scales/{id}/validate
```

⚠️ **Important** : Une fois validée, une grille ne peut plus être supprimée ni ses critères modifiés.

#### Supprimer une grille
```http
DELETE /grading-scales/{id}
```

### Gestion des critères

#### Ajouter un critère
```http
POST /grading-scales/{id}/criteria
Content-Type: application/json

{
  "label": "Qualité du code",
  "maxPoints": 20,
  "weight": 0.3,
  "commentEnabled": true
}
```

#### Modifier un critère
```http
PUT /grading-scales/criteria/{criterionId}
Content-Type: application/json

{
  "label": "Qualité du code et architecture",
  "maxPoints": 25,
  "weight": 0.4
}
```

#### Supprimer un critère
```http
DELETE /grading-scales/criteria/{criterionId}
```

### Gestion des résultats

#### Enregistrer des résultats
```http
POST /grading-scales/{id}/results
Content-Type: application/json

{
  "targetGroupId": "group-uuid", // Optionnel
  "targetStudentId": "student-uuid", // Optionnel
  "results": [
    {
      "gradingCriterionId": "criterion-uuid",
      "score": 18,
      "comment": "Excellent travail"
    }
  ]
}
```

#### Récupérer les résultats
```http
GET /grading-scales/{id}/results
```

#### Modifier un résultat
```http
PUT /grading-scales/results/{resultId}
Content-Type: application/json

{
  "score": 19,
  "comment": "Très bon travail - mise à jour"
}
```

---

## 📁 Projets

⚠️ **Authentification requise** pour la plupart des endpoints

#### Créer un projet
```http
POST /projects
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Projet Web",
  "description": "Développement d'une application web",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30"
}
```

#### Lister les projets
```http
GET /projects
```

#### Récupérer un projet
```http
GET /projects/{id}
```

#### Modifier un projet
```http
PATCH /projects/{id}
Content-Type: application/json

{
  "title": "Nouveau titre",
  "description": "Nouvelle description"
}
```

#### Supprimer un projet
```http
DELETE /projects/{id}
```

#### Copier un projet
```http
POST /projects/{id}
```

#### Gérer la définition de rapport
```http
# Créer/remplacer
PUT /projects/{id}/report-definition
Content-Type: application/json

{
  "template": "Template de rapport",
  "instructions": "Instructions pour le rapport"
}

# Récupérer
GET /projects/{id}/report-definition
```

#### Récupérer les grilles de notation d'un projet
```http
GET /projects/{id}/grading-scales
```

---

## 👥 Groupes de projet

#### Créer un groupe
```http
POST /projectGroups
Content-Type: application/json

{
  "name": "Groupe A",
  "projectId": "project-uuid",
  "members": ["student1-uuid", "student2-uuid"]
}
```

#### Lister les groupes
```http
GET /projectGroups
```

#### Récupérer un groupe
```http
GET /projectGroups/{id}
```

#### Modifier un groupe
```http
PATCH /projectGroups/{id}
Content-Type: application/json

{
  "name": "Nouveau nom"
}
```

#### Supprimer un groupe
```http
DELETE /projectGroups/{id}
```

#### Mes groupes (étudiant)
```http
GET /projectGroups/myGroups
Authorization: Bearer {student-token}
```

#### Soumettre un rapport
```http
POST /projectGroups/{id}/submit-report
Content-Type: application/json
Authorization: Bearer {student-token}

{
  "content": "Contenu du rapport",
  "attachments": ["file1.pdf", "file2.docx"]
}
```

---

## 📋 Étapes

#### Créer/modifier des étapes
```http
POST /projects/{projectId}/steps
Content-Type: application/json

[
  {
    "title": "Analyse",
    "description": "Phase d'analyse du projet",
    "startDate": "2025-01-01",
    "endDate": "2025-01-15",
    "order": 1
  },
  {
    "title": "Développement",
    "description": "Phase de développement",
    "startDate": "2025-01-16",
    "endDate": "2025-03-15",
    "order": 2
  }
]
```

#### Lister les étapes
```http
GET /projects/{projectId}/steps
```

#### Récupérer une étape
```http
GET /projects/{projectId}/steps/{id}
```

#### Modifier une étape
```http
PATCH /projects/{projectId}/steps/{id}
Content-Type: application/json

{
  "title": "Nouveau titre",
  "description": "Nouvelle description"
}
```

#### Supprimer une étape
```http
DELETE /projects/{projectId}/steps/{id}
```

---

## 🎓 Promotions d'étudiants

#### Créer une promotion
```http
POST /student-batches
Content-Type: application/json

{
  "name": "Promo 2025",
  "year": 2025,
  "students": [
    {
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean.dupont@email.com"
    }
  ]
}
```

#### Lister les promotions
```http
GET /student-batches
```

#### Récupérer une promotion
```http
GET /student-batches/{id}
```

#### Modifier une promotion
```http
PATCH /student-batches/{id}
Content-Type: application/json

{
  "name": "Nouveau nom"
}
```

#### Supprimer une promotion
```http
DELETE /student-batches/{id}
```

#### Mes promotions (étudiant)
```http
GET /student-batches/myStudentBatches
Authorization: Bearer {student-token}
```

---

## 📄 Définitions de rapport

#### Créer une définition
```http
POST /report-definitions
Content-Type: application/json

{
  "title": "Template de rapport",
  "template": "# Rapport\n\n## Introduction\n...",
  "instructions": "Instructions pour remplir le rapport"
}
```

#### Lister les définitions
```http
GET /report-definitions
```

#### Récupérer une définition
```http
GET /report-definitions/{id}
```

#### Modifier une définition
```http
PATCH /report-definitions/{id}
Content-Type: application/json

{
  "title": "Nouveau titre"
}
```

#### Supprimer une définition
```http
DELETE /report-definitions/{id}
```

#### Par projet
```http
# Récupérer
GET /report-definitions/project/{projectId}

# Modifier
PATCH /report-definitions/project/{projectId}
Content-Type: application/json

{
  "template": "Nouveau template"
}
```

---

## 🔗 Collaboration temps réel (Liveblocks)

#### Authentification
```http
POST /liveblocks/auth
Content-Type: application/json

{
  "room": "project-room-id",
  "userId": "user-uuid"
}
```

---

## 📋 DTOs et modèles de données

### Grilles de notation

#### CreateGradingScaleDto
```typescript
{
  projectId?: string;           // UUID du projet (optionnel)
  type: 'livrable' | 'rapport' | 'soutenance';
  targetId: string;             // UUID de la cible
  notationMode: 'groupe' | 'individuel';
  title: string;                // Titre de la grille
  criteria?: CreateGradingCriterionDto[]; // Critères (optionnel)
}
```

#### CreateGradingCriterionDto
```typescript
{
  label: string;                // Libellé du critère
  maxPoints: number;            // Points maximum
  weight?: number;              // Poids (optionnel)
  commentEnabled?: boolean;     // Commentaires activés (optionnel)
}
```

#### CreateGradingResultDto
```typescript
{
  targetGroupId?: string;       // UUID du groupe (optionnel)
  targetStudentId?: string;     // UUID de l'étudiant (optionnel)
  results: GradingResultItemDto[];
}

// GradingResultItemDto
{
  gradingCriterionId: string;   // UUID du critère
  score: number;                // Score (≥ 0)
  comment?: string;             // Commentaire (optionnel)
}
```

#### UpdateGradingScaleDto
```typescript
{
  title?: string;               // Nouveau titre (optionnel)
}
```

#### UpdateGradingCriterionDto
```typescript
{
  label?: string;               // Nouveau libellé (optionnel)
  maxPoints?: number;           // Nouveaux points max (optionnel)
  weight?: number;              // Nouveau poids (optionnel)
  commentEnabled?: boolean;     // Activation commentaires (optionnel)
}
```

#### UpdateGradingResultDto
```typescript
{
  score?: number;               // Nouveau score (≥ 0, optionnel)
  comment?: string;             // Nouveau commentaire (optionnel)
}
```

---

## 💡 Exemples d'utilisation

### Workflow complet de notation

```javascript
// 1. Créer une grille de notation
const grille = await fetch('/grading-scales', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'livrable',
    targetId: 'livrable-uuid',
    notationMode: 'groupe',
    title: 'Évaluation Livrable 1'
  })
}).then(r => r.json());

// 2. Ajouter des critères
const critere1 = await fetch(`/grading-scales/${grille.id}/criteria`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    label: 'Qualité du code',
    maxPoints: 20,
    weight: 0.4,
    commentEnabled: true
  })
}).then(r => r.json());

const critere2 = await fetch(`/grading-scales/${grille.id}/criteria`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    label: 'Documentation',
    maxPoints: 20,
    weight: 0.6,
    commentEnabled: true
  })
}).then(r => r.json());

// 3. Valider la grille
await fetch(`/grading-scales/${grille.id}/validate`, {
  method: 'POST'
});

// 4. Enregistrer des résultats
const resultats = await fetch(`/grading-scales/${grille.id}/results`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetGroupId: 'groupe-uuid',
    results: [
      {
        gradingCriterionId: critere1.id,
        score: 18,
        comment: 'Excellent code, bien structuré'
      },
      {
        gradingCriterionId: critere2.id,
        score: 15,
        comment: 'Documentation correcte mais peut être améliorée'
      }
    ]
  })
}).then(r => r.json());

// 5. Récupérer les résultats
const tousLesResultats = await fetch(`/grading-scales/${grille.id}/results`)
  .then(r => r.json());
```

### Gestion d'erreurs

```javascript
async function creerGrille(data) {
  try {
    const response = await fetch('/grading-scales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erreur ${response.status}: ${error.message}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    throw error;
  }
}
```

---

## ⚠️ Codes d'erreur

### Codes de statut HTTP

- **200 OK** : Succès
- **201 Created** : Ressource créée
- **400 Bad Request** : Données invalides
- **401 Unauthorized** : Authentification requise
- **403 Forbidden** : Action interdite (ex: supprimer une grille validée)
- **404 Not Found** : Ressource non trouvée
- **500 Internal Server Error** : Erreur serveur

### Erreurs de validation courantes

```json
{
  "message": [
    "type must be one of the following values: livrable, rapport, soutenance",
    "targetId must be a UUID",
    "notationMode must be one of the following values: groupe, individuel"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Erreurs métier

```json
{
  "message": "Cannot delete a validated grading scale",
  "error": "Forbidden",
  "statusCode": 403
}
```

---

## 🎯 Bonnes pratiques

### Pour une IA Frontend

1. **Validation côté client** : Utilisez les mêmes règles de validation que les DTOs
2. **Gestion des UUID** : Générez des UUID v4 valides pour les tests
3. **Gestion d'état** : Trackez le statut `isValidated` des grilles
4. **Cache intelligent** : Cachez les données peu changeantes (grilles validées)
5. **Retry logic** : Implémentez une logique de retry pour les erreurs 500

### Workflow recommandé

1. **Création** : Grille → Critères → Validation
2. **Utilisation** : Résultats → Modifications → Consultation
3. **Sécurité** : Vérifiez toujours les permissions avant les actions

### Optimisations

```javascript
// Créer une grille avec critères en une seule requête
const grilleComplete = await fetch('/grading-scales', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'livrable',
    targetId: 'uuid',
    notationMode: 'groupe',
    title: 'Grille complète',
    criteria: [
      { label: 'Critère 1', maxPoints: 10, weight: 0.5 },
      { label: 'Critère 2', maxPoints: 10, weight: 0.5 }
    ]
  })
});
```

### Types TypeScript pour l'intégration

```typescript
// Types pour une intégration TypeScript
interface GradingScale {
  id: string;
  type: 'livrable' | 'rapport' | 'soutenance';
  targetId: string;
  notationMode: 'groupe' | 'individuel';
  title: string;
  isValidated: boolean;
  createdBy: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  criteria?: GradingCriterion[];
}

interface GradingCriterion {
  id: string;
  label: string;
  maxPoints: number;
  weight?: number;
  commentEnabled: boolean;
}

interface GradingResult {
  id: string;
  targetGroupId?: string;
  targetStudentId?: string;
  score: number;
  comment?: string;
  createdBy: string;
  gradingCriterionId: string;
  createdAt: string;
}
```

---

## 📚 Documentation Swagger

Accédez à la documentation interactive Swagger à l'adresse :
`http://localhost:3001/api`

---

## 🔧 Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env` et configurez :

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pamp_db
JWT_SECRET=your-secret-key
LIVEBLOCKS_SECRET=your-liveblocks-secret
```

---

## 🤝 Support

Pour toute question ou problème :
1. Consultez cette documentation
2. Vérifiez la documentation Swagger
3. Consultez les logs du serveur
4. Testez avec les exemples fournis

---

**Version de l'API** : 1.0.0  
**Dernière mise à jour** : 2025-07-12