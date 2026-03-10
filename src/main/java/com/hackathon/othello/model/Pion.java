package com.hackathon.othello.model;

import jakarta.persistence.Embeddable;

//Class pour les pions

@Embeddable
public class Pion {
    private String couleur; // Couleur du pion (ex: "blanc" ou "noir")
    private String position; // Position actuelle du pion sur le plateau (ex: "A1", "B2", etc.)

    protected Pion() {
        // Constructeur vide requis par JPA
    }

    // Constructeur
    public Pion(String couleur, String position) {
        this.couleur = couleur;
        this.position = position;
    }

    // Getters et setters
    public String getCouleur() {
        return couleur;
    }

    public void setCouleur(String couleur) {
        this.couleur = couleur;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }
}