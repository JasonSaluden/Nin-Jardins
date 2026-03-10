package com.hackathon.othello.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity // Annotation pour indiquer que cette classe est une entité JPA
@Table(name = "coups") // Annotation pour spécifier le nom de la table dans la base de données

public class Coups {
    @Id // Annotation pour indiquer que ce champ est la clé primaire de l'entité
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Annotation pour spécifier la stratégie de génération de la
                                                        // clé primaire
    @Column(name = "Id_coup")
    private int Id_coups; // Identifiant unique du coup

    @ManyToOne // Annotation pour indiquer une relation Many-to-One avec l'entité Parties
    @JoinColumn(name = "Id_parties") // Annotation pour spécifier la colonne de jointure pour la partie
    private Parties Id_parties; // Identifiant de la partie à laquelle le coup appartient

    @ManyToOne // Annotation pour indiquer une relation Many-to-One avec l'entité Joueurs
    @JoinColumn(name = "Id_joueurs") // Annotation pour spécifier la colonne de jointure pour le joueur
    private Joueurs Id_joueurs; // Identifiant du joueur qui a effectué le coup

    private int numero_coup; // Numéro du coup dans la partie (ex: 1 pour le premier coup, 2 pour le
                             // deuxième, etc.)
    private int position_x; // Position du coup sur le plateau (ex: "A1", "B2", etc.)
    private int position_y; // Position du coup sur le plateau (ex: "A1", "B2", etc.)
    private String couleur_pion; // Couleur du pion joué (ex: "blanc" ou "noir")

    protected Coups() {
        // Constructeur vide requis par JPA
    }

    // Constructeur
    public Coups(Parties Id_parties, Joueurs Id_joueurs, int numero_coup, int position_x, int position_y,
            String couleur_pion) {
        this.Id_parties = Id_parties;
        this.Id_joueurs = Id_joueurs;
        this.numero_coup = numero_coup;
        this.position_x = position_x;
        this.position_y = position_y;
        this.couleur_pion = couleur_pion;
    }

    // Getters et setters
    public int getId_coups() {
        return Id_coups;
    }

    public Parties getId_parties() {
        return Id_parties;
    }

    public void setId_parties(Parties Id_parties) {
        this.Id_parties = Id_parties;
    }

    public Joueurs getId_joueurs() {
        return Id_joueurs;
    }

    public void setId_joueurs(Joueurs Id_joueurs) {
        this.Id_joueurs = Id_joueurs;
    }

    public int getNumero_coup() {
        return numero_coup;
    }

    public void setNumero_coup(int numero_coup) {
        this.numero_coup = numero_coup;
    }

    public int getPosition_x() {
        return position_x;
    }

    public void setPosition_x(int position_x) {
        this.position_x = position_x;
    }

    public int getPosition_y() {
        return position_y;
    }

    public void setPosition_y(int position_y) {
        this.position_y = position_y;
    }

    public String getCouleur_pion() {
        return couleur_pion;
    }

    public void setCouleur_pion(String couleur_pion) {
        this.couleur_pion = couleur_pion;
    }

}
