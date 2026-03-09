package com.hackathon.othello.model;

public class Joueurs {
    private int Id_joueurs; // Identifiant unique du joueur
    private String pseudo; // pseudo du joueur
    private String mail; // adresse e-mail du joueur
    private String mot_de_passe; // mot de passe du joueur
    private java.util.Date date_inscription; // date d'inscription du joueur

    // Constructeur
    public Joueurs(String pseudo, String mail, String mot_de_passe, java.util.Date date_inscription) {
        this.pseudo = pseudo;
        this.mail = mail;
        this.mot_de_passe = mot_de_passe;
        this.date_inscription = date_inscription;
    }

    // Getters et setters
    public int getId_joueurs() {
        return Id_joueurs;
    }

    public String getPseudo() {
        return pseudo;
    }

    public void setPseudo(String pseudo) {
        this.pseudo = pseudo;
    }

    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    public String getMot_de_passe() {
        return mot_de_passe;
    }

    public void setMot_de_passe(String mot_de_passe) {
        this.mot_de_passe = mot_de_passe;
    }

    public java.util.Date getDate_inscription() {
        return date_inscription;
    }

    public void setDate_inscription(java.util.Date date_inscription) {
        this.date_inscription = date_inscription;
    }
}
