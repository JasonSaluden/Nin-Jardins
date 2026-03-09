package com.hackathon.othello.model;

public class Parties {
    private int Id_parties; // Identifiant unique de la partie
    private java.util.Date date_partie; // Date de la partie
    private String statut; // Statut de la partie (ex: "en cours", "terminée", etc.)
    private int difficulte; // Difficulté de la partie (ex: 1 pour facile, 2 pour moyen, 3 pour difficile)
    private java.sql.Time temps_jeu; // Temps de jeu de la partie
    private Joueurs Id_joueur_Noir; // Joueur noir de la partie
    private Joueurs Id_joueur_Blanc; // Joueur blanc de la partie
    private Pion pionNoir; // Pion du joueur noir
    private Pion pionBlanc; // Pion du joueur blanc
    private int Id_vainqueur; // Identifiant du joueur gagnant (0 si la partie est en cours ou terminée sans
                              // gagnant)

    // Constructeur
    public Parties(java.util.Date date_partie, String statut, int difficulte, java.sql.Time temps_jeu,
            Joueurs Id_joueur_Noir, Joueurs Id_joueur_Blanc, Pion pionNoir, Pion pionBlanc) {
        this.date_partie = date_partie;
        this.statut = statut;
        this.difficulte = difficulte;
        this.temps_jeu = temps_jeu;
        this.Id_joueur_Noir = Id_joueur_Noir;
        this.Id_joueur_Blanc = Id_joueur_Blanc;
        this.pionNoir = pionNoir;
        this.pionBlanc = pionBlanc;
        this.Id_vainqueur = 0; // Par défaut, aucun gagnant au début de la partie
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

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
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

    public Pion getPionNoir() {
        return pionNoir;
    }

    public void setPionNoir(Pion pionNoir) {
        this.pionNoir = pionNoir;
    }

    public Pion getPionBlanc() {
        return pionBlanc;
    }

    public void setPionBlanc(Pion pionBlanc) {
        this.pionBlanc = pionBlanc;
    }

    public int getId_vainqueur() {
        return Id_vainqueur;
    }

    public void setId_vainqueur(int Id_vainqueur) {
        this.Id_vainqueur = Id_vainqueur;
    }
}
