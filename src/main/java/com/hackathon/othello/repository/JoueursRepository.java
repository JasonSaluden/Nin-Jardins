package com.hackathon.othello.repository;

import com.hackathon.othello.model.Joueurs;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JoueursRepository extends JpaRepository<Joueurs, Integer> {
    Optional<Joueurs> findByPseudo(String pseudo);
    boolean existsByPseudo(String pseudo);
    boolean existsByMail(String mail);
}
