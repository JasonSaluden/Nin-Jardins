package com.hackathon.othello.model;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ScoresId implements Serializable {
    @Column(name = "Id_joueurs")
    private Integer idJoueurs;

    @Column(name = "Id_parties")
    private Integer idParties;

    protected ScoresId() {
        // Constructeur vide requis par JPA
    }

    public ScoresId(Integer idJoueurs, Integer idParties) {
        this.idJoueurs = idJoueurs;
        this.idParties = idParties;
    }

    public Integer getIdJoueurs() {
        return idJoueurs;
    }

    public void setIdJoueurs(Integer idJoueurs) {
        this.idJoueurs = idJoueurs;
    }

    public Integer getIdParties() {
        return idParties;
    }

    public void setIdParties(Integer idParties) {
        this.idParties = idParties;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ScoresId)) {
            return false;
        }
        ScoresId scoresId = (ScoresId) o;
        return Objects.equals(idJoueurs, scoresId.idJoueurs)
                && Objects.equals(idParties, scoresId.idParties);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idJoueurs, idParties);
    }
}