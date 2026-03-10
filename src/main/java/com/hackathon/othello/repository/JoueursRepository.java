package com.hackathon.othello.repository;

import com.hackathon.othello.model.Joueurs;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JoueursRepository extends JpaRepository<Joueurs, Integer> {
    Optional<Joueurs> findByPseudo(String pseudo);

    Optional<Joueurs> findByMail(String mail);

    List<Joueurs> findByPseudoContainingIgnoreCase(String pseudo);

    boolean existsByPseudo(String pseudo);

    boolean existsByMail(String mail);
}
