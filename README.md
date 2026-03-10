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

Avant de lancer le projet, soit assurez-vous d'avoir installé :

- [Java 21](https://adoptium.net/)
- [Maven 3.8+](https://maven.apache.org/download.cgi)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Ollama](https://ollama.com/download)

Sinon, récupérer les images docker correspondantes avec la commande 
```bash
docker-compose up
```
Ca téléchargera les images MySQL, Maven, Ollama


Vérification des installations :
```bash
java -version
mvn -version
docker -v
ollama -v
```

---

## Lancement du projet

### 1. Démarrer la base de données (MySQL via Docker)

```bash
docker-compose up -d
```

La base `othello` est automatiquement créée avec les tables suivantes : `joueurs`, `parties`, `scores`, `coups`.

Identifiants BDD :
- **Host** : `localhost:3306`
- **Base** : `othello`
- **User** : `othello_user`
- **Password** : `othello_pass`

### 2. Démarrer Ollama avec le modèle Mistral

```bash
ollama pull mistral
ollama serve
```

> Ollama doit tourner sur `http://localhost:11434`

### 3. Lancer le backend Spring Boot

```bash
mvn spring-boot:run
```

Le serveur démarre sur `http://localhost:8080`

---

## Tester l'application

### Interface graphique

Ouvrir dans le navigateur :
```
http://localhost:8080/grille.html
```

### API REST — Authentification

**Inscription :**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"pseudo":"joueur1","email":"joueur1@test.com","password":"motdepasse"}'
```

**Connexion :**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pseudo":"joueur1","password":"motdepasse"}'
```

---

## Architecture du projet

```
othello/
├── docker-compose.yml               # Conteneur MySQL
├── sql/
│   └── init.sql                     # Schéma de la base de données
└── src/main/
    ├── java/com/hackathon/othello/
    │   ├── OthelloApplication.java  # Point d'entrée Spring Boot
    │   ├── config/                  # Configuration (BCrypt)
    │   ├── controller/              # Endpoints REST
    │   ├── service/                 # Logique métier
    │   ├── repository/              # Accès BDD (JPA)
    │   ├── model/                   # Entités (Joueur, Partie, Coup...)
    │   └── dto/                     # Objets de transfert (Login, Register)
    └── resources/
        ├── application.properties   # Configuration Spring Boot
        └── static/
            ├── index.html
            ├── grille.html          # Interface du plateau de jeu
            └── css/
                └── grille.css
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

L'IA utilise **Mistral** via **Ollama** (LLM local, pas de clé API nécessaire) et est intégrée grâce à **Spring AI**.

Elle peut intervenir comme :
- **IA adversaire** : calcule les coups à jouer
- **IA d'assistance** : suggère des coups au joueur humain

Configuration dans `application.properties` :
```properties
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.model=mistral
```
