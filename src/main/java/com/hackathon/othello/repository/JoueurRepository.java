package com.hackathon.othello.repository;

import com.hackathon.othello.model.Joueur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JoueurRepository extends JpaRepository<Joueur, Long> {
    Optional<Joueur> findByPseudo(String pseudo);
    boolean existsByPseudo(String pseudo);
    boolean existsByMail(String mail);
}
