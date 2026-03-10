package com.hackathon.othello.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity // Annotation pour indiquer que cette classe est une entité JPA
@Table(name = "scores") // Annotation pour spécifier le nom de la table dans la base de données

public class Scores {
    @EmbeddedId
    private ScoresId id;

    @ManyToOne // Annotation pour indiquer une relation Many-to-One avec l'entité Joueurs
    @MapsId("idJoueurs")
    @JoinColumn(name = "Id_joueurs") // Annotation pour spécifier la colonne de jointure pour le joueur
    private Joueurs joueur; // Référence à l'entité Joueurs

    @ManyToOne // Annotation pour indiquer une relation Many-to-One avec l'entité Parties
    @MapsId("idParties")
    @JoinColumn(name = "Id_parties") // Annotation pour spécifier la colonne de jointure pour la partie
    private Parties partie; // Référence à l'entité Parties

    @Enumerated(EnumType.STRING) // Annotation pour indiquer que l'énumération doit être stockée sous forme de
                                 // chaîne dans la base de données
    private CouleurPion couleur_pion; // Couleur du pion (NOIR ou BLANC)

    private int nb_pions_final; // Nombre de pions du joueur à la fin de la partie

    public enum CouleurPion {
        noir, blanc
    }; // Couleur du pion (NOIR ou BLANC)

    protected Scores() {
        // Constructeur vide requis par JPA
    }

    // Constructeur
    public Scores(Joueurs joueur, Parties partie, CouleurPion couleur_pion, int nb_pions_final) {
        this.id = new ScoresId(joueur.getId_joueurs(), partie.getId_parties());
        this.joueur = joueur;
        this.partie = partie;
        this.couleur_pion = couleur_pion;
        this.nb_pions_final = nb_pions_final;
    }

    public ScoresId getId() {
        return id;
    }

    public void setId(ScoresId id) {
        this.id = id;
    }

    public Joueurs getJoueur() {
        return joueur;
    }

    public void setJoueur(Joueurs joueur) {
        this.joueur = joueur;
    }

    public Parties getPartie() {
        return partie;
    }

    public void setPartie(Parties partie) {
        this.partie = partie;
    }

    public CouleurPion getCouleur_pion() {
        return couleur_pion;
    }

    public void setCouleur_pion(CouleurPion couleur_pion) {
        this.couleur_pion = couleur_pion;
    }

    public int getNb_pions_final() {
        return nb_pions_final;
    }

    public void setNb_pions_final(int nb_pions_final) {
        this.nb_pions_final = nb_pions_final;
    }
}
