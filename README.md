# Othello IA — Hackathon NINJA IA

Jeu d'Othello jouable contre une IA propulsée par Mistral via Ollama.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Java 21 + Spring Boot 3.3.4 |
| Base de données | MySQL 8.0 |
| IA | Ollama + Mistral (LLM local) |
| Frontend | HTML5 / CSS3 / JavaScript natif |
| Build | Maven |
| Conteneurisation | Docker + Docker Compose |

---

## Prérequis

Le seul prérequis est d'avoir **Docker Desktop** installé.
Tout le reste (Java, Maven, MySQL, Ollama, Mistral) est géré automatiquement par Docker.

- [Télécharger Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Lancer le projet

### 1. Cloner le repository

```bash
git clone https://github.com/JasonSaluden/othello.git
cd othello
```

### 2. Démarrer l'application

```bash
docker-compose up
```

Cette commande télécharge et démarre automatiquement :
- **MySQL** — la base de données avec les tables créées
- **Ollama** — le moteur IA
- **Mistral** — le modèle LLM (téléchargé automatiquement au premier démarrage)
- **Spring Boot** — le backend via Maven

> Le premier démarrage peut prendre quelques minutes le temps de télécharger les images et le modèle Mistral (~4 Go).
> Les démarrages suivants sont quasi instantanés.

### 3. Accéder à l'application

Une fois les conteneurs démarrés, ouvrir dans le navigateur :

```
http://localhost:8080
```

---

## Vérifier que tout fonctionne

### Vérifier les conteneurs
```bash
docker-compose ps
```
Les 3 services doivent être en `Up` :
```
othello-db-1        Up
othello-ollama-1    Up
othello-app-1       Up
```

### Vérifier le backend
```
http://localhost:8080
```
La page d'accueil doit s'afficher.

### Vérifier la base de données
```bash
docker exec -it othello-db-1 mysql -u othello_user -pothello_pass othello -e "SHOW TABLES;"
```
Doit afficher : `joueurs`, `parties`, `scores`, `coups`

### Vérifier Ollama + Mistral
```bash
docker exec -it othello-ollama-1 ollama list
```
Mistral doit apparaître dans la liste.

### Consulter les logs en cas de problème
```bash
docker-compose logs app       # logs Spring Boot
docker-compose logs db        # logs MySQL
docker-compose logs ollama    # logs Ollama
```

---

## Architecture du projet

```
othello/
├── docker-compose.yml               # Orchestration des conteneurs
├── sql/
│   └── init.sql                     # Schéma de la base de données
└── src/main/
    ├── java/com/hackathon/othello/
    │   ├── OthelloApplication.java  # Point d'entrée Spring Boot
    │   ├── config/                  # Configuration (BCrypt)
    │   ├── controller/              # Endpoints REST
    │   ├── service/                 # Logique métier
    │   ├── repository/              # Accès BDD (JPA)
    │   ├── model/                   # Entités (Joueurs, Parties, Coups...)
    │   └── dto/                     # Objets de transfert (Login, Register)
    └── resources/
        ├── application.properties   # Configuration Spring Boot
        └── static/
            ├── index.html           # Page d'accueil (connexion/inscription)
            ├── grille.html          # Interface du plateau de jeu
            ├── css/
            │   ├── accueil.css
            │   └── grille.css
            └── js/
                └── accueil.js
```

---

## Schéma de base de données

```
joueurs     → Id_joueurs, pseudo, mail, mot_de_passe, date_inscription
parties     → Id_parties, date_partie, statut, difficulte, Id_joueur_noir, Id_joueur_blanc, Id_vainqueur
scores      → Id_joueurs, Id_parties, couleur_pion, nb_pions_final
coups       → Id_coup, Id_parties, Id_joueurs, numero_coup, position_x, position_y, horodatage
```

---

## Fonctionnement de l'IA

L'IA utilise **Mistral** via **Ollama** (LLM local, aucune clé API nécessaire) intégré grâce à **Spring AI**.

Elle intervient comme :
- **IA adversaire** : calcule les coups à jouer
- **IA d'assistance** : suggère des coups au joueur humain
