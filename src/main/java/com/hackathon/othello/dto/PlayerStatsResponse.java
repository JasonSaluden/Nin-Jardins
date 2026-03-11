package com.hackathon.othello.dto;

import java.util.List;

public record PlayerStatsResponse(
        String pseudo,
        int totalParties,
        int victoires,
        int defaites,
        int egalites,
        double tauxVictoire,
        double scoreMoyen,
        int meilleurScore,
        int victoiresNoir,
        int victoiresBlanc,
        List<PlayerGameHistoryItem> historique) {
}