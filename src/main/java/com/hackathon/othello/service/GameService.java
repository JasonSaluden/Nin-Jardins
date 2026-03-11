package com.hackathon.othello.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Locale;
import java.util.List;
import java.util.Random;

@Service
public class GameService {

    // Création du plateau de jeu
    private int[][] plateau = new int[8][8];

    // Joueur courant : 1 = noir, 2 = blanc
    private int joueurCourant = 1;
    private boolean contreIA = false;
    private final int joueurIA = 2;
    private String difficulteIA = "medium";
    private final Random random = new Random();

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
            int l = coup[0];
            int c = coup[1];
            int scorePosition = POSITION_WEIGHTS[l][c];
            int scoreRetournement = compterPionsRetournes(l, c, joueurIA) * 4;
            int score = scorePosition + scoreRetournement;

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

    public void startGame(boolean contreIA, String difficulteIA) {
        initialiserPlateau();
        joueurCourant = 1;
        this.contreIA = contreIA;
        this.difficulteIA = normaliserDifficulte(difficulteIA);
    }
}
