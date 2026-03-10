package com.hackathon.othello.repository;

import com.hackathon.othello.model.Joueurs;
import com.hackathon.othello.model.Parties;
import com.hackathon.othello.model.Scores;
import com.hackathon.othello.model.ScoresId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ScoresRepository extends JpaRepository<Scores, ScoresId> {
    List<Scores> findByJoueur(Joueurs joueur);

    Optional<Scores> findByJoueurAndPartie(Joueurs joueur, Parties partie);

    List<Scores> findByPartie(Parties partie);

    @Query("SELECT s FROM Scores s WHERE s.couleur_pion = :couleurPion")
    List<Scores> findByCouleurPion(@Param("couleurPion") Scores.CouleurPion couleurPion);
}
