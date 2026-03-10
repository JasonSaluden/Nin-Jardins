package com.hackathon.othello.repository;

import com.hackathon.othello.model.Coups;
import com.hackathon.othello.model.Joueurs;
import com.hackathon.othello.model.Parties;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CoupsRepository extends JpaRepository<Coups, Integer> {
    @Query("select c from Coups c where c.Id_parties = :partie order by c.numero_coup asc")
    List<Coups> findByPartieOrderByNumeroCoupAsc(@Param("partie") Parties partie);

    @Query("select c from Coups c where c.Id_joueurs = :joueur order by c.numero_coup asc")
    List<Coups> findByJoueurOrderByNumeroCoupAsc(@Param("joueur") Joueurs joueur);

    @Query("select c from Coups c where c.Id_parties = :partie and c.Id_joueurs = :joueur order by c.numero_coup asc")
    List<Coups> findByPartieAndJoueur(@Param("partie") Parties partie, @Param("joueur") Joueurs joueur);
}
