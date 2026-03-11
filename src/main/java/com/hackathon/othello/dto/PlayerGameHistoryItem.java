package com.hackathon.othello.dto;

public record PlayerGameHistoryItem(
        int partieId,
        String datePartie,
        String mode,
        String difficulte,
        String couleur,
        String resultat,
        int scoreJoueur,
        int scoreAdversaire,
        String adversaire,
        String duree) {
}