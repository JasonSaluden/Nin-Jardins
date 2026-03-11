package com.hackathon.othello.dto;

public class StartGameRequest {
    private Boolean contreIA;
    private String difficulteIA;
    private String couleurJoueur;
    private Integer joueurId;
    private Integer joueurBlancId;

    public Boolean getContreIA() {
        return contreIA;
    }

    public void setContreIA(Boolean contreIA) {
        this.contreIA = contreIA;
    }

    public String getDifficulteIA() {
        return difficulteIA;
    }

    public void setDifficulteIA(String difficulteIA) {
        this.difficulteIA = difficulteIA;
    }

    public String getCouleurJoueur() {
        return couleurJoueur;
    }

    public void setCouleurJoueur(String couleurJoueur) {
        this.couleurJoueur = couleurJoueur;
    }

    public Integer getJoueurId() {
        return joueurId;
    }

    public void setJoueurId(Integer joueurId) {
        this.joueurId = joueurId;
    }

    public Integer getJoueurBlancId() {
        return joueurBlancId;
    }

    public void setJoueurBlancId(Integer joueurBlancId) {
        this.joueurBlancId = joueurBlancId;
    }
}