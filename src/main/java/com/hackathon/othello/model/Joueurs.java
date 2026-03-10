package com.hackathon.othello.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity // Annotation pour indiquer que cette classe est une entité JPA
@Table(name = "joueurs") // Annotation pour spécifier le nom de la table dans la base de données

public class Joueurs {
    @Id // Annotation pour indiquer que ce champ est la clé primaire de l'entité
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Annotation pour spécifier la stratégie de génération de la
                                                        // clé primaire
    private int Id_joueurs; // Identifiant unique du joueur

    private String pseudo; // pseudo du joueur
    private String mail; // adresse e-mail du joueur
    private String mot_de_passe; // mot de passe du joueur
    private java.util.Date date_inscription; // date d'inscription du joueur

    protected Joueurs() {
        // Constructeur vide requis par JPA
    }

    // Constructeur
    public Joueurs(String pseudo, String mail, String mot_de_passe, java.util.Date date_inscription) {
        this.pseudo = pseudo;
        this.mail = mail;
        this.mot_de_passe = mot_de_passe;
        this.date_inscription = date_inscription;
    }

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

    public Date getDate_inscription() {
        return date_inscription;
    }

    public void setDate_inscription(Date date_inscription) {
        this.date_inscription = date_inscription;
    }
}
