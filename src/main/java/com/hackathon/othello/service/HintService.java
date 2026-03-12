package com.hackathon.othello.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class HintService {

    private static final List<String> INTRODUCTIONS = List.of(
        "Comme le disait le vieux sage",
        "Comme l'enseignait le maître du bambou",
        "Comme l'a murmuré le petit scarabée au pied de la montagne",
        "Comme le répétait le vieux maître au bord de la rivière",
        "Comme le dit le proverbe des anciens",
        "Comme l'écrivait le sage dans le livre du vent",
        "Comme le disait le vieil homme qui regardait pousser les bambous",
        "Comme l'a appris le disciple auprès du maître silencieux",
        "Comme le racontait le pêcheur du lac brumeux",
        "Comme le disait le moine du temple oublié",
        "Comme l'enseignait le maître assis sous le cerisier",
        "Comme le disait le sage en observant la lune",
        "Comme le racontait l'ancien au coin du feu",
        "Comme le dit la sagesse des montagnes",
        "Comme le disait le vieux maître en servant le thé"
    );

    private static final Random RANDOM = new Random();

    private final ChatClient chatClient;
    private final GameService gameService;

    public HintService(ChatClient.Builder chatClientBuilder, GameService gameService) {
        this.chatClient = chatClientBuilder.build();
        this.gameService = gameService;
    }

    private String randomIntro() {
        return INTRODUCTIONS.get(RANDOM.nextInt(INTRODUCTIONS.size()));
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

                Complète les deux phrases suivantes en français. Ne change pas le début des phrases, invente uniquement la suite indiquée entre crochets.

                Phrase 1 : %s, [invente ici une sagesse ninja ou samouraï originale et légèrement humoristique].
                Phrase 2 : Joue en [choisis exactement une case parmi : %s].
                """,
                couleur,
                formatPlateau(gameService.getPlateau()),
                couleur,
                formatCoups(coupsValides),
                randomIntro(),
                formatCoups(coupsValides));

        String response = chatClient.prompt().user(prompt).call().content();
        // Sécurité : ne garder que les 2 premières phrases si le modèle en génère davantage
        if (response != null) {
            int sentenceCount = 0;
            int secondSentenceEnd = -1;
            for (int i = 0; i < response.length(); i++) {
                char c = response.charAt(i);
                if (c == '.' || c == '!' || c == '?') {
                    sentenceCount++;
                    if (sentenceCount == 2) {
                        secondSentenceEnd = i;
                        break;
                    }
                }
            }
            if (secondSentenceEnd != -1 && secondSentenceEnd < response.length() - 1) {
                response = response.substring(0, secondSentenceEnd + 1).trim();
            }
        }
        return response;
    }

    public Flux<String> getHintStream() {
        int joueur = gameService.getJoueurCourant();
        String couleur = joueur == 1 ? "Noir" : "Blanc";
        List<int[]> coupsValides = gameService.getCoupsValides(joueur);

        if (coupsValides.isEmpty()) {
            return Flux.just("Aucun coup disponible pour les " + couleur + "s.");
        }

        String prompt = String.format("""
                Tu es un maître ninja expert en Othello/Reversi. Donne un conseil au joueur %s.

                Plateau (0=vide, 1=noir, 2=blanc) — colonnes A à H, lignes 1 à 8 :
                %s
                Coups valides pour %s : %s

                Complète les deux phrases suivantes en français. Ne change pas le début des phrases, invente uniquement la suite indiquée entre crochets.

                Phrase 1 : %s, [invente ici une sagesse ninja ou samouraï originale et légèrement humoristique].
                Phrase 2 : Joue en [choisis exactement une case parmi : %s].
                """,
                couleur,
                formatPlateau(gameService.getPlateau()),
                couleur,
                formatCoups(coupsValides),
                randomIntro(),
                formatCoups(coupsValides));

        return chatClient.prompt().user(prompt).stream().content();
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
