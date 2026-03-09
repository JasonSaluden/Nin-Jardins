CREATE TABLE joueurs (
    Id_joueurs       INT AUTO_INCREMENT,
    pseudo           VARCHAR(50),
    mail             VARCHAR(255),
    mot_de_passe     VARCHAR(255),
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Id_joueurs)
  );

  CREATE TABLE parties (
    Id_parties       INT AUTO_INCREMENT,
    date_partie      DATETIME,
    statut           ENUM('en_cours', 'terminee', 'abandonnee') DEFAULT 'en_cours',
    difficulte       INT,
    temps_jeu        TIME,
    Id_joueur_noir   INT,
    Id_joueur_blanc  INT NULL,
    Id_vainqueur     INT,
    PRIMARY KEY (Id_parties),
    FOREIGN KEY (Id_joueur_noir)  REFERENCES joueurs(Id_joueurs),
    FOREIGN KEY (Id_joueur_blanc) REFERENCES joueurs(Id_joueurs),
    FOREIGN KEY (Id_vainqueur)    REFERENCES joueurs(Id_joueurs)
  );

  CREATE TABLE scores (
    Id_joueurs          INT,
    Id_parties          INT,
    couleur_pion        ENUM('noir', 'blanc'),
    nb_pions_final      INT,
    PRIMARY KEY (Id_joueurs, Id_parties),
    FOREIGN KEY (Id_joueurs) REFERENCES joueurs(Id_joueurs),
    FOREIGN KEY (Id_parties) REFERENCES parties(Id_parties)
  );

  CREATE TABLE coups (
    Id_coup    INT AUTO_INCREMENT,
    Id_parties INT,
    Id_joueurs INT,
    numero_coup INT,
    position_x  INT,
    position_y  INT,
    horodatage  DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Id_coup),
    FOREIGN KEY (Id_parties) REFERENCES parties(Id_parties),
    FOREIGN KEY (Id_joueurs) REFERENCES joueurs(Id_joueurs)
  );