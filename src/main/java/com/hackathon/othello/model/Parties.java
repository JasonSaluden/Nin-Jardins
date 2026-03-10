package com.hackathon.othello.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity // Annotation pour indiquer que cette classe est une entité JPA
@Table(name = "parties") // Annotation pour spécifier le nom de la table dans la base de données

public class Parties {
    public enum StatutPartie {
        en_cours,
        terminee,
        abandonnee
    }

    @Id // Annotation pour indiquer que ce champ est la clé primaire de l'entité
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int Id_parties; // Identifiant unique de la partie

    private java.util.Date date_partie; // Date de la partie

    @Enumerated(EnumType.STRING) // Annotation pour indiquer que l'énumération doit être stockée sous forme de
                                 // chaîne dans la base de données
    private StatutPartie statut;

    private int difficulte; // Difficulté de la partie (ex: 1 pour facile, 2 pour moyen, 3 pour difficile)
    private java.sql.Time temps_jeu; // Temps de jeu de la partie

    @ManyToOne // Annotation pour indiquer une relation Many-to-One avec l'entité Joueurs
    @JoinColumn(name = "Id_joueur_noir") // Annotation pour spécifier la colonne de jointure pour le joueur noir
    private Joueurs Id_joueur_Noir; // Joueur noir de la partie

    @ManyToOne // Annotation pour indiquer une relation Many-to-One avec l'entité Joueurs
    @JoinColumn(name = "Id_joueur_blanc") // Annotation pour spécifier la colonne de jointure pour le joueur blanc
    private Joueurs Id_joueur_Blanc; // Joueur blanc de la partie

    @ManyToOne
    @JoinColumn(name = "Id_vainqueur")
    private Joueurs vainqueur;

    protected Parties() {
        // Constructeur vide requis par JPA
    }

    // Constructeur
    public Parties(java.util.Date date_partie, StatutPartie statut, int difficulte, java.sql.Time temps_jeu,
            Joueurs Id_joueur_Noir, Joueurs Id_joueur_Blanc) {
        this.date_partie = date_partie;
        this.statut = statut;
        this.difficulte = difficulte;
        this.temps_jeu = temps_jeu;
        this.Id_joueur_Noir = Id_joueur_Noir;
        this.Id_joueur_Blanc = Id_joueur_Blanc;
    }

    // Getters et setters
    public int getId_parties() {
        return Id_parties;
    }

    public java.util.Date getDate_partie() {
        return date_partie;
    }

    public void setDate_partie(java.util.Date date_partie) {
        this.date_partie = date_partie;
    }

    public StatutPartie getStatut() {
        return statut;
    }

    public void setStatut(StatutPartie statut) {
        this.statut = statut;
    }

    public int getDifficulte() {
        return difficulte;
    }

    public void setDifficulte(int difficulte) {
        this.difficulte = difficulte;
    }

    public java.sql.Time getTemps_jeu() {
        return temps_jeu;
    }

    public void setTemps_jeu(java.sql.Time temps_jeu) {
        this.temps_jeu = temps_jeu;
    }

    public Joueurs getId_joueur_Noir() {
        return Id_joueur_Noir;
    }

    public void setId_joueur_Noir(Joueurs Id_joueur_Noir) {
        this.Id_joueur_Noir = Id_joueur_Noir;
    }

    public Joueurs getId_joueur_Blanc() {
        return Id_joueur_Blanc;
    }

    public void setId_joueur_Blanc(Joueurs Id_joueur_Blanc) {
        this.Id_joueur_Blanc = Id_joueur_Blanc;
    }

    public Joueurs getVainqueur() {
        return vainqueur;
    }

    public void setVainqueur(Joueurs vainqueur) {
        this.vainqueur = vainqueur;
    }
}
