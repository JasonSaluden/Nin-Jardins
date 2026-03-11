package com.hackathon.othello.service;

import com.hackathon.othello.model.Joueurs;
import com.hackathon.othello.model.Parties;
import com.hackathon.othello.model.Scores;
import com.hackathon.othello.repository.JoueursRepository;
import com.hackathon.othello.repository.PartiesRepository;
import com.hackathon.othello.repository.ScoresRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.Locale;
import java.util.List;
import java.util.Random;

@Service
public class GameService {

    private static final String SYSTEM_AI_PSEUDO = "__system_ai__";
    private static final String SYSTEM_AI_MAIL = "__system_ai__@local";
    private static final String SYSTEM_LOCAL_PSEUDO = "__system_local__";
    private static final String SYSTEM_LOCAL_MAIL = "__system_local__@local";

    // Création du plateau de jeu
    private int[][] plateau = new int[8][8];

    // Joueur courant : 1 = noir, 2 = blanc
    private int joueurCourant = 1;
    private boolean contreIA = false;
    private final int joueurIA = 2;
    private String difficulteIA = "medium";
    private final Random random = new Random();
    private final JoueursRepository joueursRepository;
    private final PartiesRepository partiesRepository;
    private final ScoresRepository scoresRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private Joueurs joueurNoir;
    private Joueurs joueurBlanc;
    private Instant debutPartie;
    private boolean partieSauvegardee;

    private static final int[][] POSITION_WEIGHTS = {
            { 120, -20, 20, 5, 5, 20, -20, 120 },
            { -20, -40, -5, -5, -5, -5, -40, -20 },
            { 20, -5, 15, 3, 3, 15, -5, 20 },
            { 5, -5, 3, 3, 3, 3, -5, 5 },
            { 5, -5, 3, 3, 3, 3, -5, 5 },
            { 20, -5, 15, 3, 3, 15, -5, 20 },
            { -20, -40, -5, -5, -5, -5, -40, -20 },
            { 120, -20, 20, 5, 5, 20, -20, 120 }
    };

    // Directions pour vérifier les coups (8 directions : haut, bas, gauche, droite
    // et les 4 diagonales)
    private static final int[][] DIRECTIONS = {
            { -1, 0 }, // haut
            { 1, 0 }, // bas
            { 0, -1 }, // gauche
            { 0, 1 }, // droite
            { -1, -1 }, // diagonale haut-gauche
            { -1, 1 }, // diagonale haut-droite
            { 1, -1 }, // diagonale bas-gauche
            { 1, 1 } // diagonale bas-droite
    };

    public GameService(
            JoueursRepository joueursRepository,
            PartiesRepository partiesRepository,
            ScoresRepository scoresRepository,
            BCryptPasswordEncoder passwordEncoder) {
        this.joueursRepository = joueursRepository;
        this.partiesRepository = partiesRepository;
        this.scoresRepository = scoresRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Initialise le plateau avec les 4 pions de départ
    public void initialiserPlateau() {
        plateau = new int[8][8];
        plateau[3][3] = 2; // blanc
        plateau[3][4] = 1; // noir
        plateau[4][3] = 1; // noir
        plateau[4][4] = 2; // blanc
    }

    public int[][] getPlateau() {
        return plateau;
    }

    // Vérifie si un coup est valide pour un joueur donné
    public boolean estCoupValide(int ligne, int colonne, int joueur) {

        // Vérifie que la case est vide
        if (plateau[ligne][colonne] != 0)
            return false;

        // Détermine l'adversaire
        int adversaire = (joueur == 1) ? 2 : 1;

        // Vérifie dans toutes les directions s'il y a au moins un pion adverse suivi
        // d'un pion du joueur
        for (int[] dir : DIRECTIONS) {
            int l = ligne + dir[0];
            int c = colonne + dir[1];
            boolean aPionAdverse = false;

            // Tant qu'il y a des pions adverses dans la direction, continue à avancer
            while (l >= 0 && l < 8 && c >= 0 && c < 8 && plateau[l][c] == adversaire) {
                aPionAdverse = true;
                l += dir[0];
                c += dir[1];
            }

            // Si on a trouvé au moins un pion adverse et qu'on arrive sur un pion du
            // joueur, le coup est valide
            if (aPionAdverse && l >= 0 && l < 8 && c >= 0 && c < 8 && plateau[l][c] == joueur) {
                return true;
            }
        }
        return false;
    }

    // Retourne la liste de tous les coups valides pour un joueur
    public List<int[]> getCoupsValides(int joueur) {
        // Chaque coup valide est représenté par un tableau de deux éléments : [ligne,
        // colonne]
        List<int[]> coups = new ArrayList<>();
        // Parcourt tout le plateau pour trouver les coups valides
        for (int l = 0; l < 8; l++) {
            for (int c = 0; c < 8; c++) {
                if (estCoupValide(l, c, joueur)) {
                    coups.add(new int[] { l, c });
                }
            }
        }
        return coups;
    }

    public int evaluerPlateau(int[][] plateau){
        int score = 0;
        for (int l = 0; l < 8; l++) {
            for (int c = 0; c < 8; c++) {
                if (plateau[l][c] == joueurIA) {
                    score += POSITION_WEIGHTS[l][c];
                } else if (plateau[l][c] != 0) {
                    score -= POSITION_WEIGHTS[l][c];
                }
            }
        }
        return score;
    }

    private int[][] copierPlateau(int[][] original) {
        int[][] copie = new int[8][8];
        for (int i = 0; i < 8; i++) {
            copie[i] = original[i].clone();
        }
        return copie;
    }

    private int[][] simulerCoup(int[][] p, int[] coup, int joueur) {
        int[][] copie = copierPlateau(p);
        int adversaire = getAdversaire(joueur);
        copie[coup[0]][coup[1]] = joueur;
        for (int[] dir : DIRECTIONS) {
            int l = coup[0] + dir[0];
            int c = coup[1] + dir[1];
            List<int[]> aRetourner = new ArrayList<>();
            while (l >= 0 && l < 8 && c >= 0 && c < 8 && copie[l][c] == adversaire) {
                aRetourner.add(new int[]{l, c});
                l += dir[0];
                c += dir[1];
            }
            if (l >= 0 && l < 8 && c >= 0 && c < 8 && copie[l][c] == joueur) {
                for (int[] pos : aRetourner) {
                    copie[pos[0]][pos[1]] = joueur;
                }
            }
        }
        return copie;
    }

    private List<int[]> getCoupsValides(int[][] p, int joueur) {
        int adversaire = getAdversaire(joueur);
        List<int[]> coups = new ArrayList<>();
        for (int l = 0; l < 8; l++) {
            for (int c = 0; c < 8; c++) {
                if (p[l][c] != 0) continue;
                for (int[] dir : DIRECTIONS) {
                    int nl = l + dir[0];
                    int nc = c + dir[1];
                    boolean aPionAdverse = false;
                    while (nl >= 0 && nl < 8 && nc >= 0 && nc < 8 && p[nl][nc] == adversaire) {
                        aPionAdverse = true;
                        nl += dir[0];
                        nc += dir[1];
                    }
                    if (aPionAdverse && nl >= 0 && nl < 8 && nc >= 0 && nc < 8 && p[nl][nc] == joueur) {
                        coups.add(new int[]{l, c});
                        break;
                    }
                }
            }
        }
        return coups;
    }

    private boolean estPartieTerminee(int[][] p) {
        return getCoupsValides(p, 1).isEmpty() && getCoupsValides(p, 2).isEmpty();
    }

    public int minimax(int[][] p, int profondeur, int alpha, int beta, boolean maximise) {
        if (profondeur == 0 || estPartieTerminee(p)) {
            return evaluerPlateau(p);
        }

        if (maximise) {
            int maxEval = Integer.MIN_VALUE;
            List<int[]> coups = getCoupsValides(p, joueurIA);
            if (coups.isEmpty()) return minimax(p, profondeur - 1, alpha, beta, false);
            for (int[] coup : coups) {
                int eval = minimax(simulerCoup(p, coup, joueurIA), profondeur - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            int minEval = Integer.MAX_VALUE;
            int adversaire = getAdversaire(joueurIA);
            List<int[]> coups = getCoupsValides(p, adversaire);
            if (coups.isEmpty()) return minimax(p, profondeur - 1, alpha, beta, true);
            for (int[] coup : coups) {
                int eval = minimax(simulerCoup(p, coup, adversaire), profondeur - 1, alpha, beta, true);
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    // Joue un coup et retourne les pions adverses
    public boolean jouerCoup(int ligne, int colonne, int joueur) {
        // Pas possible si le coup n'est pas valide
        if (!estCoupValide(ligne, colonne, joueur))
            return false;

        int adversaire = (joueur == 1) ? 2 : 1;
        plateau[ligne][colonne] = joueur;

        for (int[] dir : DIRECTIONS) {
            int l = ligne + dir[0];
            int c = colonne + dir[1];
            List<int[]> aRetourner = new ArrayList<>();

            while (l >= 0 && l < 8 && c >= 0 && c < 8 && plateau[l][c] == adversaire) {
                aRetourner.add(new int[] { l, c });
                l += dir[0];
                c += dir[1];
            }

            if (l >= 0 && l < 8 && c >= 0 && c < 8 && plateau[l][c] == joueur) {
                for (int[] pos : aRetourner) {
                    plateau[pos[0]][pos[1]] = joueur;
                }
            }
        }
        return true;
    }

    // Détecte la fin de partie
    public boolean estPartieTerminee() {
        return getCoupsValides(1).isEmpty() && getCoupsValides(2).isEmpty();
    }

    // Compte les pions d'un joueur
    public int compterPions(int joueur) {
        int count = 0;
        for (int[] row : plateau) {
            for (int cell : row) {
                if (cell == joueur)
                    count++;
            }
        }
        return count;
    }

    // Retourne le vainqueur (1 ou 2), 0 si égalité
    public int getVainqueur() {
        int noir = compterPions(1);
        int blanc = compterPions(2);
        if (noir > blanc)
            return 1;
        if (blanc > noir)
            return 2;
        return 0;
    }

    public int getJoueurCourant() {
        return joueurCourant;
    }

    public boolean isContreIA() {
        return contreIA;
    }

    public String getDifficulteIA() {
        return difficulteIA;
    }

    private int getAdversaire(int joueur) {
        return (joueur == 1) ? 2 : 1;
    }

    // Joue le coup du joueur courant et gère le passage de tour
    public boolean jouerCoupEtPasserTour(int ligne, int colonne) {
        if (!jouerCoup(ligne, colonne, joueurCourant))
            return false;

        // Passe au joueur suivant
        int suivant = getAdversaire(joueurCourant);

        // Si le suivant n'a aucun coup valide, il passe son tour
        if (getCoupsValides(suivant).isEmpty()) {
            // Le joueur courant rejoue (sauf si lui aussi est bloqué → fin de partie)
        } else {
            joueurCourant = suivant;
        }
        return true;
    }

    public boolean jouerCoupEtCompleterTour(int ligne, int colonne) {
        boolean ok = jouerCoupEtPasserTour(ligne, colonne);
        if (!ok)
            return false;
        jouerToursIA();
        enregistrerPartieSiTerminee();
        return true;
    }

    private void jouerToursIA() {
        if (!contreIA)
            return;

        while (!estPartieTerminee() && joueurCourant == joueurIA) {
            List<int[]> coupsIA = getCoupsValides(joueurIA);
            if (coupsIA.isEmpty()) {
                joueurCourant = getAdversaire(joueurIA);
                return;
            }

            int[] meilleurCoup = choisirMeilleurCoupIA(coupsIA);
            jouerCoupEtPasserTour(meilleurCoup[0], meilleurCoup[1]);
        }
    }

    private int[] choisirMeilleurCoupIA(List<int[]> coupsPossibles) {
        if ("easy".equals(difficulteIA)) {
            return coupsPossibles.get(random.nextInt(coupsPossibles.size()));
        }

        if ("hard".equals(difficulteIA)) {
            return choisirMeilleurCoupHard(coupsPossibles);
        }

        // medium: choix glouton sur le nombre immédiat de pions retournés
        int[] meilleur = coupsPossibles.get(0);
        int meilleurScore = -1;

        for (int[] coup : coupsPossibles) {
            int score = compterPionsRetournes(coup[0], coup[1], joueurIA);
            if (score > meilleurScore) {
                meilleurScore = score;
                meilleur = coup;
            }
        }
        return meilleur;
    }

    private int[] choisirMeilleurCoupHard(List<int[]> coupsPossibles) {
        int[] meilleur = coupsPossibles.get(0);
        int meilleurScore = Integer.MIN_VALUE;

        for (int[] coup : coupsPossibles) {
            int[][] apres = simulerCoup(plateau, coup, joueurIA);
            int score = minimax(apres, 3, Integer.MIN_VALUE, Integer.MAX_VALUE, false);
            if (score > meilleurScore) {
                meilleurScore = score;
                meilleur = coup;
            }
        }

        return meilleur;
    }

    private String normaliserDifficulte(String difficulte) {
        if (difficulte == null)
            return "medium";
        String d = difficulte.toLowerCase(Locale.ROOT).trim();
        if (!"easy".equals(d) && !"medium".equals(d) && !"hard".equals(d)) {
            return "medium";
        }
        return d;
    }

    private int compterPionsRetournes(int ligne, int colonne, int joueur) {
        int adversaire = getAdversaire(joueur);
        int total = 0;

        for (int[] dir : DIRECTIONS) {
            int l = ligne + dir[0];
            int c = colonne + dir[1];
            int capturesDirection = 0;

            while (l >= 0 && l < 8 && c >= 0 && c < 8 && plateau[l][c] == adversaire) {
                capturesDirection++;
                l += dir[0];
                c += dir[1];
            }

            if (capturesDirection > 0 && l >= 0 && l < 8 && c >= 0 && c < 8 && plateau[l][c] == joueur) {
                total += capturesDirection;
            }
        }

        return total;
    }

    public void startGame(boolean contreIA, String difficulteIA, Integer joueurId, Integer joueurBlancId) {
        initialiserPlateau();
        joueurCourant = 1;
        this.contreIA = contreIA;
        this.difficulteIA = normaliserDifficulte(difficulteIA);
        this.joueurNoir = joueurId != null ? joueursRepository.findById(joueurId).orElse(null) : null;
        this.joueurBlanc = joueurNoir != null ? resoudreJoueurBlanc(contreIA, joueurBlancId) : null;
        this.debutPartie = Instant.now();
        this.partieSauvegardee = false;
    }

    private Joueurs resoudreJoueurBlanc(boolean contreIA, Integer joueurBlancId) {
        if (!contreIA && joueurBlancId != null && joueurNoir != null && joueurBlancId != joueurNoir.getId_joueurs()) {
            return joueursRepository.findById(joueurBlancId).orElseGet(() -> resoudreAdversairePersistant(false));
        }
        return resoudreAdversairePersistant(contreIA);
    }

    private Joueurs resoudreAdversairePersistant(boolean contreIA) {
        if (contreIA) {
            return findOrCreateSystemPlayer(SYSTEM_AI_PSEUDO, SYSTEM_AI_MAIL);
        }
        return findOrCreateSystemPlayer(SYSTEM_LOCAL_PSEUDO, SYSTEM_LOCAL_MAIL);
    }

    private Joueurs findOrCreateSystemPlayer(String pseudo, String mail) {
        return joueursRepository.findByPseudo(pseudo)
                .orElseGet(() -> joueursRepository.save(
                        new Joueurs(pseudo, mail, passwordEncoder.encode("system-account"), new Date())));
    }

    private void enregistrerPartieSiTerminee() {
        if (partieSauvegardee || !estPartieTerminee() || joueurNoir == null || debutPartie == null) {
            return;
        }

        Parties partie = new Parties(
                Date.from(debutPartie),
                Parties.StatutPartie.terminee,
                mapperDifficulte(),
                calculerTempsJeu(),
                joueurNoir,
                joueurBlanc);

        int vainqueur = getVainqueur();
        if (vainqueur == 1) {
            partie.setVainqueur(joueurNoir);
        } else if (vainqueur == 2) {
            partie.setVainqueur(joueurBlanc);
        }

        Parties partieSauvegardeeEntity = partiesRepository.save(partie);
        scoresRepository
                .save(new Scores(joueurNoir, partieSauvegardeeEntity, Scores.CouleurPion.noir, compterPions(1)));

        if (joueurBlanc != null) {
            scoresRepository
                    .save(new Scores(joueurBlanc, partieSauvegardeeEntity, Scores.CouleurPion.blanc, compterPions(2)));
        }

        partieSauvegardee = true;
    }

    private int mapperDifficulte() {
        if (!contreIA) {
            return 0;
        }
        return switch (difficulteIA) {
            case "easy" -> 1;
            case "hard" -> 3;
            default -> 2;
        };
    }

    private Time calculerTempsJeu() {
        long secondes = Duration.between(debutPartie, Instant.now()).getSeconds();
        long bornees = Math.max(0, Math.min(secondes, 86399));
        return Time.valueOf(LocalTime.ofSecondOfDay(bornees));
    }
}
