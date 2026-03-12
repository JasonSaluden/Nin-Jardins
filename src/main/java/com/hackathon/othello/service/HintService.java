package com.hackathon.othello.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HintService {

    private final ChatClient chatClient;
    private final GameService gameService;

    public HintService(ChatClient.Builder chatClientBuilder, GameService gameService) {
        this.chatClient = chatClientBuilder.build();
        this.gameService = gameService;
    }

    public String getHint() {
        int joueur = gameService.getJoueurCourant();
        String couleur = joueur == 1 ? "Noir" : "Blanc";
        List<int[]> coupsValides = gameService.getCoupsValides(joueur);

        if (coupsValides.isEmpty()) {
            return "Aucun coup disponible pour les " + couleur + "s.";
        }

        String prompt = String.format("""
                Tu es un maître ninja expert en Othello/Reversi. Donne un conseil au joueur %s.

                Plateau (0=vide, 1=noir, 2=blanc) — colonnes A à H, lignes 1 à 8 :
                %s
                Coups valides pour %s : %s

                Réponds en exactement 2 phrases en français :
                - Phrase 1 : une courte citation ou sagesse de ninja/samouraï en rapport avec la situation de jeu.
                - Phrase 2 : suggère un coup précis (ex : D3) et explique en une phrase pourquoi.
                """,
                couleur,
                formatPlateau(gameService.getPlateau()),
                couleur,
                formatCoups(coupsValides));

        return chatClient.prompt().user(prompt).call().content();
    }

    private String formatPlateau(int[][] plateau) {
        StringBuilder sb = new StringBuilder("  A B C D E F G H\n");
        for (int l = 0; l < 8; l++) {
            sb.append(l + 1).append(" ");
            for (int c = 0; c < 8; c++) {
                sb.append(plateau[l][c]).append(" ");
            }
            sb.append("\n");
        }
        return sb.toString();
    }

    private String formatCoups(List<int[]> coups) {
        return coups.stream()
                .map(c -> String.valueOf((char) ('A' + c[1])) + (c[0] + 1))
                .collect(Collectors.joining(", "));
    }
}
