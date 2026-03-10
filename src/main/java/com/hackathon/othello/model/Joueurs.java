package com.hackathon.othello.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "joueurs")
public class Joueurs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int Id_joueurs;

    private String pseudo;
    private String mail;
    private String mot_de_passe;

    @Temporal(TemporalType.TIMESTAMP)
    private Date date_inscription;

    public Joueurs() {}

    public Joueurs(String pseudo, String mail, String mot_de_passe, Date date_inscription) {
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
