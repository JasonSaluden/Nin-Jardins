package com.hackathon.othello.repository;

import com.hackathon.othello.model.Joueurs;
import com.hackathon.othello.model.Parties;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PartiesRepository extends JpaRepository<Parties, Integer> {
    @Query("select p from Parties p where p.Id_joueur_Noir = :joueur or p.Id_joueur_Blanc = :joueur")
    List<Parties> findByJoueur(@Param("joueur") Joueurs joueur);

    List<Parties> findByStatut(Parties.StatutPartie statut);

    @Query("select p from Parties p where p.vainqueur = :joueur")
    List<Parties> findPartiesGagneesPar(@Param("joueur") Joueurs joueur);
}
