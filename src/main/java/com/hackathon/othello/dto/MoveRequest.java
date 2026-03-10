package com.hackathon.othello.dto;

public class MoveRequest {
    private int ligne;
    private int colonne;

    public int getLigne() { return ligne; }
    public void setLigne(int ligne) { this.ligne = ligne; }

    public int getColonne() { return colonne; }
    public void setColonne(int colonne) { this.colonne = colonne; }
}
