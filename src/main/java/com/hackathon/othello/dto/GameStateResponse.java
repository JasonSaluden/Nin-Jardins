package com.hackathon.othello.dto;

import java.util.List;

public class GameStateResponse {
    private int[][] plateau;
    private List<int[]> coupsValides;
    private boolean partieTerminee;
    private int vainqueur; // 0 = égalité, 1 = noir, 2 = blanc
    private int joueurCourant; // 1 = noir, 2 = blanc
    private int scoreNoir;
    private int scoreBlanc;
    private boolean contreIA;
    private String difficulteIA;

    public GameStateResponse(int[][] plateau, List<int[]> coupsValides,
            boolean partieTerminee, int vainqueur,
            int joueurCourant, int scoreNoir, int scoreBlanc,
            boolean contreIA, String difficulteIA) {
        this.plateau = plateau;
        this.coupsValides = coupsValides;
        this.partieTerminee = partieTerminee;
        this.vainqueur = vainqueur;
        this.joueurCourant = joueurCourant;
        this.scoreNoir = scoreNoir;
        this.scoreBlanc = scoreBlanc;
        this.contreIA = contreIA;
        this.difficulteIA = difficulteIA;
    }

    public int[][] getPlateau() {
        return plateau;
    }

    public List<int[]> getCoupsValides() {
        return coupsValides;
    }

    public boolean isPartieTerminee() {
        return partieTerminee;
    }

    public int getVainqueur() {
        return vainqueur;
    }

    public int getJoueurCourant() {
        return joueurCourant;
    }

    public int getScoreNoir() {
        return scoreNoir;
    }

    public int getScoreBlanc() {
        return scoreBlanc;
    }

    public boolean isContreIA() {
        return contreIA;
    }

    public String getDifficulteIA() {
        return difficulteIA;
    }
}
