# Exemples pratiques d'utilisation de l'API

## 🚀 Scripts de test rapides

### Script PowerShell pour tester l'API

```powershell
# Configuration de base
$baseUrl = "http://localhost:3001"
$headers = @{
    "Content-Type" = "application/json"
}

# Fonction utilitaire pour les requêtes
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    $uri = "$baseUrl$Endpoint"
    $params = @{
        Uri = $uri
        Method = $Method
        Headers = $headers
    }
    
    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-RestMethod @params
        Write-Host "✅ $Method $Endpoint - Succès" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ $Method $Endpoint - Erreur: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

# Test complet du workflow de notation
function Test-GradingWorkflow {
    Write-Host "🧪 Test du workflow de notation" -ForegroundColor Yellow
    
    # 1. Créer une grille
    $grille = Invoke-ApiRequest -Method "POST" -Endpoint "/grading-scales" -Body @{
        type = "livrable"
        targetId = "550e8400-e29b-41d4-a716-446655440000"
        notationMode = "groupe"
        title = "Test Grille PowerShell"
    }
    
    # 2. Ajouter un critère
    $critere = Invoke-ApiRequest -Method "POST" -Endpoint "/grading-scales/$($grille.id)/criteria" -Body @{
        label = "Qualité du code"
        maxPoints = 20
        weight = 1.0
        commentEnabled = $true
    }
    
    # 3. Valider la grille
    $grilleValidee = Invoke-ApiRequest -Method "POST" -Endpoint "/grading-scales/$($grille.id)/validate"
    
    # 4. Enregistrer un résultat
    $resultat = Invoke-ApiRequest -Method "POST" -Endpoint "/grading-scales/$($grille.id)/results" -Body @{
        targetGroupId = "123e4567-e89b-12d3-a456-426614174000"
        results = @(
            @{
                gradingCriterionId = $critere.id
                score = 18
                comment = "Excellent travail"
            }
        )
    }
    
    # 5. Récupérer les résultats
    $resultats = Invoke-ApiRequest -Method "GET" -Endpoint "/grading-scales/$($grille.id)/results"
    
    Write-Host "✅ Workflow terminé avec succès!" -ForegroundColor Green
    return @{
        grille = $grille
        critere = $critere
        resultat = $resultat
        resultats = $resultats
    }
}

# Exécuter le test
Test-GradingWorkflow
```

### Script JavaScript/Node.js

```javascript
// npm install node-fetch
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

class ApiClient {
    async request(method, endpoint, body = null) {
        const url = `${BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`${response.status}: ${error.message}`);
            }
            
            const data = await response.json();
            console.log(`✅ ${method} ${endpoint} - Succès`);
            return data;
        } catch (error) {
            console.error(`❌ ${method} ${endpoint} - Erreur:`, error.message);
            throw error;
        }
    }
    
    // Méthodes utilitaires
    get(endpoint) { return this.request('GET', endpoint); }
    post(endpoint, body) { return this.request('POST', endpoint, body); }
    patch(endpoint, body) { return this.request('PATCH', endpoint, body); }
    put(endpoint, body) { return this.request('PUT', endpoint, body); }
    delete(endpoint) { return this.request('DELETE', endpoint); }
}

// Générateur d'UUID v4
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Tests complets
async function runTests() {
    const api = new ApiClient();
    
    console.log('🧪 Démarrage des tests API');
    
    try {
        // Test 1: Grille simple
        console.log('\n📊 Test 1: Création grille simple');
        const grille1 = await api.post('/grading-scales', {
            type: 'livrable',
            targetId: generateUUID(),
            notationMode: 'groupe',
            title: 'Test Grille Node.js'
        });
        
        // Test 2: Grille avec critères intégrés
        console.log('\n📊 Test 2: Grille avec critères intégrés');
        const grille2 = await api.post('/grading-scales', {
            type: 'soutenance',
            targetId: generateUUID(),
            notationMode: 'individuel',
            title: 'Grille Soutenance Complète',
            criteria: [
                {
                    label: 'Présentation',
                    maxPoints: 10,
                    weight: 0.4,
                    commentEnabled: true
                },
                {
                    label: 'Questions/Réponses',
                    maxPoints: 10,
                    weight: 0.6,
                    commentEnabled: false
                }
            ]
        });
        
        // Test 3: Ajout de critère
        console.log('\n📏 Test 3: Ajout de critère');
        const critere = await api.post(`/grading-scales/${grille1.id}/criteria`, {
            label: 'Documentation',
            maxPoints: 15,
            weight: 0.3,
            commentEnabled: true
        });
        
        // Test 4: Validation
        console.log('\n✅ Test 4: Validation de grille');
        await api.post(`/grading-scales/${grille1.id}/validate`);
        
        // Test 5: Résultats
        console.log('\n📈 Test 5: Enregistrement de résultats');
        const resultats = await api.post(`/grading-scales/${grille1.id}/results`, {
            targetGroupId: generateUUID(),
            results: [
                {
                    gradingCriterionId: critere.id,
                    score: 14,
                    comment: 'Bonne documentation'
                }
            ]
        });
        
        // Test 6: Récupération
        console.log('\n📋 Test 6: Récupération des résultats');
        const tousResultats = await api.get(`/grading-scales/${grille1.id}/results`);
        
        console.log('\n🎉 Tous les tests ont réussi!');
        
        return {
            grille1,
            grille2,
            critere,
            resultats,
            tousResultats
        };
        
    } catch (error) {
        console.error('💥 Erreur lors des tests:', error.message);
        throw error;
    }
}

// Exécuter les tests
if (require.main === module) {
    runTests()
        .then(results => {
            console.log('\n📊 Résultats des tests:', JSON.stringify(results, null, 2));
        })
        .catch(error => {
            console.error('Échec des tests:', error);
            process.exit(1);
        });
}

module.exports = { ApiClient, generateUUID, runTests };
```

## 🎯 Cas d'usage spécifiques

### 1. Évaluation de livrable par groupe

```javascript
async function evaluerLivrable(livrableId, groupeId) {
    const api = new ApiClient();
    
    // 1. Créer la grille d'évaluation
    const grille = await api.post('/grading-scales', {
        type: 'livrable',
        targetId: livrableId,
        notationMode: 'groupe',
        title: 'Évaluation Livrable Sprint 1',
        criteria: [
            {
                label: 'Fonctionnalités implémentées',
                maxPoints: 20,
                weight: 0.4,
                commentEnabled: true
            },
            {
                label: 'Qualité du code',
                maxPoints: 20,
                weight: 0.3,
                commentEnabled: true
            },
            {
                label: 'Tests unitaires',
                maxPoints: 20,
                weight: 0.3,
                commentEnabled: true
            }
        ]
    });
    
    // 2. Valider la grille
    await api.post(`/grading-scales/${grille.id}/validate`);
    
    // 3. Enregistrer les notes
    const notes = {
        fonctionnalites: { score: 18, comment: 'Toutes les fonctionnalités demandées sont présentes' },
        qualiteCode: { score: 15, comment: 'Code propre mais quelques améliorations possibles' },
        tests: { score: 12, comment: 'Tests présents mais couverture insuffisante' }
    };
    
    const resultats = await api.post(`/grading-scales/${grille.id}/results`, {
        targetGroupId: groupeId,
        results: [
            {
                gradingCriterionId: grille.criteria[0].id,
                score: notes.fonctionnalites.score,
                comment: notes.fonctionnalites.comment
            },
            {
                gradingCriterionId: grille.criteria[1].id,
                score: notes.qualiteCode.score,
                comment: notes.qualiteCode.comment
            },
            {
                gradingCriterionId: grille.criteria[2].id,
                score: notes.tests.score,
                comment: notes.tests.comment
            }
        ]
    });
    
    // 4. Calculer la note finale
    const noteFinale = (
        notes.fonctionnalites.score * 0.4 +
        notes.qualiteCode.score * 0.3 +
        notes.tests.score * 0.3
    );
    
    console.log(`Note finale du groupe: ${noteFinale.toFixed(2)}/20`);
    
    return {
        grille,
        resultats,
        noteFinale
    };
}
```

### 2. Évaluation de soutenance individuelle

```javascript
async function evaluerSoutenance(soutenanceId, etudiantId) {
    const api = new ApiClient();
    
    const grille = await api.post('/grading-scales', {
        type: 'soutenance',
        targetId: soutenanceId,
        notationMode: 'individuel',
        title: 'Soutenance Projet Final',
        criteria: [
            {
                label: 'Clarté de la présentation',
                maxPoints: 20,
                weight: 0.25,
                commentEnabled: true
            },
            {
                label: 'Maîtrise technique',
                maxPoints: 20,
                weight: 0.35,
                commentEnabled: true
            },
            {
                label: 'Réponses aux questions',
                maxPoints: 20,
                weight: 0.25,
                commentEnabled: true
            },
            {
                label: 'Respect du temps',
                maxPoints: 20,
                weight: 0.15,
                commentEnabled: false
            }
        ]
    });
    
    await api.post(`/grading-scales/${grille.id}/validate`);
    
    // Notation individuelle
    const resultats = await api.post(`/grading-scales/${grille.id}/results`, {
        targetStudentId: etudiantId,
        results: [
            {
                gradingCriterionId: grille.criteria[0].id,
                score: 16,
                comment: 'Présentation claire et bien structurée'
            },
            {
                gradingCriterionId: grille.criteria[1].id,
                score: 18,
                comment: 'Excellente maîtrise des technologies utilisées'
            },
            {
                gradingCriterionId: grille.criteria[2].id,
                score: 14,
                comment: 'Bonnes réponses mais quelques hésitations'
            },
            {
                gradingCriterionId: grille.criteria[3].id,
                score: 20
            }
        ]
    });
    
    return { grille, resultats };
}
```

### 3. Gestion des erreurs robuste

```javascript
class RobustApiClient extends ApiClient {
    constructor(maxRetries = 3, retryDelay = 1000) {
        super();
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
    }
    
    async requestWithRetry(method, endpoint, body = null, retryCount = 0) {
        try {
            return await this.request(method, endpoint, body);
        } catch (error) {
            // Retry sur les erreurs 500
            if (error.message.includes('500') && retryCount < this.maxRetries) {
                console.log(`🔄 Tentative ${retryCount + 1}/${this.maxRetries} pour ${method} ${endpoint}`);
                await this.delay(this.retryDelay * (retryCount + 1));
                return this.requestWithRetry(method, endpoint, body, retryCount + 1);
            }
            
            // Gestion spécifique des erreurs
            if (error.message.includes('400')) {
                console.error('❌ Erreur de validation:', error.message);
                throw new ValidationError(error.message);
            }
            
            if (error.message.includes('403')) {
                console.error('🚫 Action interdite:', error.message);
                throw new ForbiddenError(error.message);
            }
            
            if (error.message.includes('404')) {
                console.error('🔍 Ressource non trouvée:', error.message);
                throw new NotFoundError(error.message);
            }
            
            throw error;
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Classes d'erreurs personnalisées
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ForbiddenError';
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}
```

### 4. Utilitaires pour IA Frontend

```javascript
class GradingScaleManager {
    constructor() {
        this.api = new RobustApiClient();
        this.cache = new Map();
    }
    
    // Créer une grille optimisée
    async createOptimizedScale(config) {
        const { type, targetId, notationMode, title, criteria } = config;
        
        // Validation côté client
        this.validateConfig(config);
        
        // Création avec critères intégrés si possible
        const grille = await this.api.post('/grading-scales', {
            type,
            targetId,
            notationMode,
            title,
            criteria: criteria || []
        });
        
        // Cache pour éviter les requêtes répétées
        this.cache.set(grille.id, grille);
        
        return grille;
    }
    
    // Validation côté client
    validateConfig(config) {
        const validTypes = ['livrable', 'rapport', 'soutenance'];
        const validModes = ['groupe', 'individuel'];
        
        if (!validTypes.includes(config.type)) {
            throw new ValidationError(`Type invalide: ${config.type}`);
        }
        
        if (!validModes.includes(config.notationMode)) {
            throw new ValidationError(`Mode invalide: ${config.notationMode}`);
        }
        
        if (!this.isValidUUID(config.targetId)) {
            throw new ValidationError(`UUID invalide: ${config.targetId}`);
        }
        
        if (!config.title || config.title.trim().length === 0) {
            throw new ValidationError('Titre requis');
        }
    }
    
    // Validation UUID
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    
    // Workflow complet automatisé
    async createCompleteEvaluation(config, evaluations) {
        // 1. Créer la grille
        const grille = await this.createOptimizedScale(config);
        
        // 2. Valider automatiquement
        await this.api.post(`/grading-scales/${grille.id}/validate`);
        
        // 3. Enregistrer toutes les évaluations
        const resultats = [];
        for (const evaluation of evaluations) {
            const resultat = await this.api.post(`/grading-scales/${grille.id}/results`, evaluation);
            resultats.push(resultat);
        }
        
        return {
            grille,
            resultats,
            summary: this.generateSummary(grille, resultats)
        };
    }
    
    // Génération de résumé
    generateSummary(grille, resultats) {
        const totalEvaluations = resultats.length;
        const moyenneGenerale = resultats.reduce((sum, r) => sum + r.score, 0) / totalEvaluations;
        
        return {
            grilleId: grille.id,
            titre: grille.title,
            type: grille.type,
            mode: grille.notationMode,
            nombreEvaluations: totalEvaluations,
            moyenneGenerale: moyenneGenerale.toFixed(2),
            dateCreation: grille.createdAt
        };
    }
}
```

## 🧪 Tests de validation

### Test des contraintes de validation

```javascript
async function testValidationConstraints() {
    const api = new ApiClient();
    
    console.log('🧪 Test des contraintes de validation');
    
    // Test 1: Type invalide
    try {
        await api.post('/grading-scales', {
            type: 'invalide',
            targetId: generateUUID(),
            notationMode: 'groupe',
            title: 'Test'
        });
        console.error('❌ Devrait échouer avec type invalide');
    } catch (error) {
        console.log('✅ Type invalide correctement rejeté');
    }
    
    // Test 2: UUID invalide
    try {
        await api.post('/grading-scales', {
            type: 'livrable',
            targetId: 'uuid-invalide',
            notationMode: 'groupe',
            title: 'Test'
        });
        console.error('❌ Devrait échouer avec UUID invalide');
    } catch (error) {
        console.log('✅ UUID invalide correctement rejeté');
    }
    
    // Test 3: Mode invalide
    try {
        await api.post('/grading-scales', {
            type: 'livrable',
            targetId: generateUUID(),
            notationMode: 'invalide',
            title: 'Test'
        });
        console.error('❌ Devrait échouer avec mode invalide');
    } catch (error) {
        console.log('✅ Mode invalide correctement rejeté');
    }
    
    console.log('✅ Tous les tests de validation réussis');
}
```

### Test des règles métier

```javascript
async function testBusinessRules() {
    const api = new ApiClient();
    
    console.log('🧪 Test des règles métier');
    
    // Créer et valider une grille
    const grille = await api.post('/grading-scales', {
        type: 'livrable',
        targetId: generateUUID(),
        notationMode: 'groupe',
        title: 'Test Règles Métier'
    });
    
    await api.post(`/grading-scales/${grille.id}/validate`);
    
    // Test 1: Suppression grille validée
    try {
        await api.delete(`/grading-scales/${grille.id}`);
        console.error('❌ Devrait échouer - grille validée');
    } catch (error) {
        console.log('✅ Suppression grille validée correctement bloquée');
    }
    
    // Test 2: Ajouter critère à grille validée
    const critere = await api.post(`/grading-scales/${grille.id}/criteria`, {
        label: 'Test Critère',
        maxPoints: 10,
        weight: 1.0
    });
    
    // Test 3: Supprimer critère de grille validée
    try {
        await api.delete(`/grading-scales/criteria/${critere.id}`);
        console.error('❌ Devrait échouer - grille validée');
    } catch (error) {
        console.log('✅ Suppression critère de grille validée correctement bloquée');
    }
    
    console.log('✅ Tous les tests de règles métier réussis');
}
```

## 📊 Monitoring et métriques

```javascript
class ApiMonitor {
    constructor() {
        this.metrics = {
            requests: 0,
            successes: 0,
            errors: 0,
            responseTime: [],
            errorTypes: {}
        };
    }
    
    async monitoredRequest(api, method, endpoint, body = null) {
        const startTime = Date.now();
        this.metrics.requests++;
        
        try {
            const result = await api.request(method, endpoint, body);
            this.metrics.successes++;
            this.metrics.responseTime.push(Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.errors++;
            const errorType = this.categorizeError(error);
            this.metrics.errorTypes[errorType] = (this.metrics.errorTypes[errorType] || 0) + 1;
            throw error;
        }
    }
    
    categorizeError(error) {
        if (error.message.includes('400')) return 'Validation';
        if (error.message.includes('401')) return 'Authentication';
        if (error.message.includes('403')) return 'Authorization';
        if (error.message.includes('404')) return 'NotFound';
        if (error.message.includes('500')) return 'ServerError';
        return 'Unknown';
    }
    
    getReport() {
        const avgResponseTime = this.metrics.responseTime.length > 0 
            ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length 
            : 0;
            
        return {
            totalRequests: this.metrics.requests,
            successRate: (this.metrics.successes / this.metrics.requests * 100).toFixed(2) + '%',
            errorRate: (this.metrics.errors / this.metrics.requests * 100).toFixed(2) + '%',
            averageResponseTime: avgResponseTime.toFixed(2) + 'ms',
            errorBreakdown: this.metrics.errorTypes
        };
    }
}
```

---

## 🎯 Conseils pour l'IA Frontend

### 1. Stratégie de cache
- Cachez les grilles validées (elles ne changent plus)
- Invalidez le cache lors des modifications
- Utilisez des timestamps pour la fraîcheur des données

### 2. Gestion d'état
- Trackez le statut `isValidated` des grilles
- Désactivez les actions interdites dans l'UI
- Affichez des indicateurs de statut clairs

### 3. UX optimisée
- Créez des grilles avec critères intégrés quand possible
- Validez côté client avant d'envoyer
- Affichez des messages d'erreur contextuels

### 4. Performance
- Utilisez des requêtes batch quand disponible
- Implémentez un retry intelligent
- Optimisez les requêtes de lecture

---

**Dernière mise à jour** : 2025-01-12  
**Testé avec** : API v1.0.0