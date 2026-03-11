package com.hackathon.othello.service;

import com.hackathon.othello.dto.PlayerGameHistoryItem;
import com.hackathon.othello.dto.PlayerStatsResponse;
import com.hackathon.othello.model.Joueurs;
import com.hackathon.othello.model.Parties;
import com.hackathon.othello.model.Scores;
import com.hackathon.othello.repository.JoueursRepository;
import com.hackathon.othello.repository.ScoresRepository;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class PlayerStatsService {

    private static final String SYSTEM_AI_PSEUDO = "__system_ai__";
    private static final String SYSTEM_LOCAL_PSEUDO = "__system_local__";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss");

    private final JoueursRepository joueursRepository;
    private final ScoresRepository scoresRepository;

    public PlayerStatsService(JoueursRepository joueursRepository, ScoresRepository scoresRepository) {
        this.joueursRepository = joueursRepository;
        this.scoresRepository = scoresRepository;
    }

    public PlayerStatsResponse getStats(int joueurId) {
        Joueurs joueur = joueursRepository.findById(joueurId)
                .orElseThrow(() -> new IllegalArgumentException("Joueur introuvable"));

        List<Scores> scores = new ArrayList<>(scoresRepository.findByJoueur(joueur));
        scores.sort(Comparator.comparing(
                (Scores score) -> score.getPartie().getDate_partie(),
                Comparator.nullsLast(Comparator.naturalOrder())).reversed());

        int victoires = 0;
        int defaites = 0;
        int egalites = 0;
        int meilleurScore = 0;
        int totalPions = 0;
        int victoiresNoir = 0;
        int victoiresBlanc = 0;
        List<PlayerGameHistoryItem> historique = new ArrayList<>();

        for (Scores scoreJoueur : scores) {
            Parties partie = scoreJoueur.getPartie();
            Scores scoreAdversaire = scoresRepository.findByPartie(partie).stream()
                    .filter(score -> score.getJoueur() != null
                            && score.getJoueur().getId_joueurs() != joueur.getId_joueurs())
                    .findFirst()
                    .orElse(null);

            String resultat = calculerResultat(partie, joueur.getId_joueurs());
            if ("victoire".equals(resultat)) {
                victoires++;
                if (scoreJoueur.getCouleur_pion() == Scores.CouleurPion.noir) {
                    victoiresNoir++;
                } else {
                    victoiresBlanc++;
                }
            } else if ("defaite".equals(resultat)) {
                defaites++;
            } else {
                egalites++;
            }

            totalPions += scoreJoueur.getNb_pions_final();
            meilleurScore = Math.max(meilleurScore, scoreJoueur.getNb_pions_final());

            historique.add(new PlayerGameHistoryItem(
                    partie.getId_parties(),
                    formaterDate(partie),
                    partie.getDifficulte() > 0 ? "VS IA" : "Local",
                    formaterDifficulte(partie.getDifficulte()),
                    scoreJoueur.getCouleur_pion() == Scores.CouleurPion.noir ? "Noir" : "Blanc",
                    resultat,
                    scoreJoueur.getNb_pions_final(),
                    scoreAdversaire != null ? scoreAdversaire.getNb_pions_final() : 0,
                    formaterAdversaire(scoreAdversaire),
                    formaterDuree(partie.getTemps_jeu())));
        }

        int totalParties = scores.size();
        double scoreMoyen = totalParties == 0 ? 0.0 : Math.round((totalPions * 10.0) / totalParties) / 10.0;
        double tauxVictoire = totalParties == 0 ? 0.0 : Math.round((victoires * 1000.0) / totalParties) / 10.0;

        return new PlayerStatsResponse(
                joueur.getPseudo(),
                totalParties,
                victoires,
                defaites,
                egalites,
                tauxVictoire,
                scoreMoyen,
                meilleurScore,
                victoiresNoir,
                victoiresBlanc,
                historique);
    }

    private String calculerResultat(Parties partie, int joueurId) {
        if (partie.getVainqueur() == null) {
            return "egalite";
        }
        return partie.getVainqueur().getId_joueurs() == joueurId ? "victoire" : "defaite";
    }

    private String formaterDate(Parties partie) {
        if (partie.getDate_partie() == null) {
            return "";
        }
        return partie.getDate_partie().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime()
                .format(DATE_FORMAT);
    }

    private String formaterDifficulte(int difficulte) {
        return switch (difficulte) {
            case 1 -> "Facile";
            case 2 -> "Moyen";
            case 3 -> "Difficile";
            default -> "Joueur local";
        };
    }

    private String formaterAdversaire(Scores scoreAdversaire) {
        if (scoreAdversaire == null || scoreAdversaire.getJoueur() == null) {
            return "Adversaire inconnu";
        }

        String pseudo = scoreAdversaire.getJoueur().getPseudo();
        if (SYSTEM_AI_PSEUDO.equals(pseudo)) {
            return "IA Othello";
        }
        if (SYSTEM_LOCAL_PSEUDO.equals(pseudo)) {
            return "Joueur local";
        }
        return pseudo;
    }

    private String formaterDuree(Time tempsJeu) {
        if (tempsJeu == null) {
            return "00:00:00";
        }
        return tempsJeu.toLocalTime().format(TIME_FORMAT);
    }
}