# CEGI — Vérificateur de fiches de paie

Interface web pour l'analyse automatique de fiches de paie et le calcul d'indemnités de licenciement.

---

## Lancement rapide (Docker)

### Prérequis

- [Docker](https://docs.docker.com/get-docker/) et Docker Compose installés
- Une clé API Gemini (Google AI Studio)

### 1. Cloner les deux dépôts côte à côte

```bash
git clone <url-repo-front> rdesilv-front
git clone <url-repo-back>  rdesilv
```

La structure doit être :

```
esilv/
├── rdesilv-front/   ← ce repo (frontend)
└── rdesilv/         ← repo backend
```

### 2. Configurer le backend

Copier le `Dockerfile.backend` fourni dans ce repo vers le repo backend :

```bash
cp rdesilv-front/Dockerfile.backend rdesilv/Dockerfile
```

Créer le fichier `.env` dans le repo backend :

```bash
# rdesilv/.env
GEMINI_API_KEY=votre_clé_api_gemini
```

### 3. Lancer l'application

Depuis le dossier **`rdesilv-front`** :

```bash
docker compose up --build
```

- Frontend : http://localhost:3000
- Backend  : http://localhost:8000
- Docs API : http://localhost:8000/docs

Pour arrêter :

```bash
docker compose down
```

---

## Développement local (sans Docker)

### Backend

```bash
cd rdesilv
cp .env.example .env   # puis renseigner GEMINI_API_KEY
uv sync
uv run prod
```

### Frontend

```bash
cd rdesilv-front
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8000/api
npm install
npm run dev
```

---

## Variables d'environnement

### Frontend (`rdesilv-front/.env`)

| Variable | Défaut | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | URL de base de l'API backend |

### Backend (`rdesilv/.env`)

| Variable | Requis | Description |
|---|---|---|
| `GEMINI_API_KEY` | Oui | Clé API Google Gemini (analyses IA) |

---

## Fonctionnalités

**Onglet Analyse fiche de paie**
- Upload d'une fiche de paie PDF
- Vérification automatique des cotisations (bases, CSG, RGDU, etc.)
- Surlignage des lignes en erreur dans l'aperçu PDF
- Rapport d'erreurs groupé par type de vérification
- Export PDF du rapport

**Onglet Calcul licenciement**
- Pré-remplissage depuis les 12 dernières fiches de paie (PDF)
- Calcul de l'indemnité légale (licenciement et rupture conventionnelle)
- Support CCN 1966
- Export PDF du résultat
