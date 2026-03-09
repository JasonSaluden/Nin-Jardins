package com.hackathon.othello.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "joueurs")
public class Joueur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_joueurs")
    private Long id;

    @Column(name = "pseudo", nullable = false, unique = true, length = 50)
    private String pseudo;

    @Column(name = "mail", length = 255)
    private String mail;

    @Column(name = "mot_de_passe", nullable = false, length = 255)
    private String motDePasse;

    @Column(name = "date_inscription")
    private LocalDateTime dateInscription;

    @PrePersist
    protected void onCreate() {
        dateInscription = LocalDateTime.now();
    }

    public Joueur() {}

    public Long getId() { return id; }
    public String getPseudo() { return pseudo; }
    public void setPseudo(String pseudo) { this.pseudo = pseudo; }
    public String getMail() { return mail; }
    public void setMail(String mail) { this.mail = mail; }
    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
    public LocalDateTime getDateInscription() { return dateInscription; }
}
