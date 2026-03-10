package com.hackathon.othello.repository;

import com.hackathon.othello.model.Joueurs;
import com.hackathon.othello.model.Parties;
import com.hackathon.othello.model.Scores;
import com.hackathon.othello.model.ScoresId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScoresRepository extends JpaRepository<Scores, ScoresId> {
    List<Scores> findByJoueur(Joueurs joueur);

    Optional<Scores> findByJoueurAndPartie(Joueurs joueur, Parties partie);

    List<Scores> findByPartie(Parties partie);

    List<Scores> findByCouleur_pion(Scores.CouleurPion couleurPion);
}
