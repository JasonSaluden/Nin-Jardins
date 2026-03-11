# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexte : Hackathon Ninja IA

Ce projet est réalisé dans le cadre du **Hackathon Ninja IA**, dont l'objectif est de concevoir et développer un jeu de logique intégrant de l'intelligence artificielle. Les équipes doivent créer une application permettant de jouer contre une IA ou d'utiliser une assistance intelligente pour résoudre un problème logique.

**Critères d'évaluation :**
- Qualité technique (architecture, modularité)
- Pertinence de l'IA (stratégie ou assistance)
- Expérience utilisateur (interface claire, jouabilité)
- Innovation (originalité, usage intelligent de l'IA)
- Travail d'équipe (gestion de projet, collaboration Git)

**Livrables attendus :** application fonctionnelle jouable, repository GitHub avec historique de commits, README technique, présentation finale avec démonstration.

**Composition de l'équipe :**
- Chef de projet (CDA) — architecture, versionning, intégration IA
- Développeur (DWWM) — front-end, back-end, logique de jeu
- Designer (CDUI) — UI/UX, maquettes, expérience utilisateur

**Intégration IA attendue** (trois modes possibles) :
- *IA adversaire* — algorithmes classiques (minimax, heuristiques) ou LLM
- *IA d'assistance* — suggestion de coups, analyse du plateau, explication de stratégie
- *IA conversationnelle* — chatbot règles/coach via Ollama + Spring AI

## Project Overview

Full-stack **Othello/Reversi game** with AI integration. Backend: Spring Boot 3.3.4 + Java 21 + MySQL. Frontend: vanilla HTML/CSS/JS + Bootstrap 5. AI: Ollama/Mistral via Spring AI. Deployment: Docker Compose.

## Commands

### Run (Docker — recommended)
```bash
docker-compose up          # Start all services (MySQL, Ollama, Spring Boot on port 8080)
docker-compose logs app    # View Spring Boot logs
```

### Run locally (requires MySQL and Ollama running separately)
```bash
mvn spring-boot:run        # Run Spring Boot app on port 8080
```

### Build & Test
```bash
mvn clean install          # Full build
mvn test                   # Run tests (no tests currently implemented)
```

## Architecture

**Backend layers** (`src/main/java/com/hackathon/othello/`):
- `controller/` — REST endpoints: `AuthController` (`/api/auth`) and `GameController` (`/api/game`)
- `service/` — Business logic: `AuthService` (BCrypt auth) and `GameService` (Othello rules engine)
- `repository/` — JPA interfaces for `Joueurs`, `Parties`, `Coups`, `Scores`
- `model/` — JPA entities; `Pion.java` is a game piece (not a DB entity)
- `dto/` — Request/response objects: `MoveRequest`, `GameStateResponse`, `LoginRequest`, etc.

**Frontend** (`src/main/resources/static/`):
- `index.html` + `accueil.js` — Login/register/guest entry point
- `grille.html` + `grille.js` — Game board; communicates with backend via fetch calls
- User session stored client-side in `sessionStorage` (pseudo + guest flag)

## Game Logic (GameService)

- Board: `int[8][8]` — 0=empty, 1=black, 2=white
- `joueurCourant` tracks whose turn it is (1 or 2)
- Move validation checks all 8 directions for valid captures
- Auto-passes turn if current player has no valid moves
- Game ends when both players have no valid moves

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register `{pseudo, mail, motDePasse}` |
| POST | `/api/auth/login` | Login `{pseudo, motDePasse}` |
| POST | `/api/game/start` | Start new game → `GameStateResponse` |
| GET  | `/api/game/state` | Get current board state |
| POST | `/api/game/move` | Play move `{ligne, colonne}` (0–7) |

`GameStateResponse` fields: `plateau` (8x8), `coupsValides`, `partieTerminee`, `vainqueur`, `joueurCourant`, `scoreNoir`, `scoreBlanc`

## Database

MySQL schema in `sql/init.sql`, auto-initialized by Docker:
- `joueurs` — players (id, pseudo, mail, mot_de_passe, date_inscription)
- `parties` — game sessions (statut, difficulte, noir/blanc player IDs, vainqueur)
- `scores` — composite key (Id_joueurs, Id_parties), couleur_pion, nb_pions_final
- `coups` — move log (Id_parties, Id_joueurs, numero_coup, position_x/y, horodatage)

Connection: `jdbc:mysql://localhost:3306/othello` (user: `othello_user`, pass: `othello_pass`)

## Ollama / Spring AI

Mistral model pulled automatically on first `docker-compose up` (~4GB). Config in `application.properties`:
```
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.model=mistral
```
Spring AI dependency: `spring-ai-ollama-spring-boot-starter` (version 1.0.0-M4).
