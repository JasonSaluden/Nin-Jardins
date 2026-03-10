package com.hackathon.othello.model;

public class Scores {
    private int Id_joueurs;                     // Identifiant unique du joueur
    private int Id_parties;                     // Identifiant unique de la partie

    private enum couleur_pion { NOIR, BLANC };  // Couleur du pion (NOIR ou BLANC)

    private couleur_pion couleur_pion;          // Champ stockant la couleur du pion

    private int nb_pions_final;                 // Nombre de pions du joueur à la fin de la partie

    // Constructeur
    public Scores(int Id_joueurs, int Id_parties, couleur_pion couleur_pion, int nb_pions_final) {
        this.Id_joueurs = Id_joueurs;
        this.Id_parties = Id_parties;
        this.couleur_pion = couleur_pion;
        this.nb_pions_final = nb_pions_final;
    }

    public int getId_joueurs() {
        return Id_joueurs;
    }

    public void setId_joueurs(int Id_joueurs) {
        this.Id_joueurs = Id_joueurs;
    }

    public int getId_parties() {
        return Id_parties;
    }

    public void setId_parties(int Id_parties) {
        this.Id_parties = Id_parties;
    }

    public couleur_pion getCouleur_pion() {
        return couleur_pion;
    }

    public void setCouleur_pion(couleur_pion couleur_pion) {
        this.couleur_pion = couleur_pion;
    }

    public int getNb_pions_final() {
        return nb_pions_final;
    }

    public void setNb_pions_final(int nb_pions_final) {
        this.nb_pions_final = nb_pions_final;
    }
}
