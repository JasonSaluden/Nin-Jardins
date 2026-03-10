package com.hackathon.othello.service;

import com.hackathon.othello.dto.AuthResponse;
import com.hackathon.othello.dto.LoginRequest;
import com.hackathon.othello.dto.RegisterRequest;
import com.hackathon.othello.model.Joueurs;
import com.hackathon.othello.repository.JoueursRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class AuthService {

    private final JoueursRepository joueursRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(JoueursRepository joueursRepository, BCryptPasswordEncoder passwordEncoder) {
        this.joueursRepository = joueursRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        if (joueursRepository.existsByPseudo(request.pseudo())) {
            throw new RuntimeException("Ce pseudo est déjà utilisé");
        }
        if (joueursRepository.existsByMail(request.mail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        Joueurs joueur = new Joueurs(
            request.pseudo(),
            request.mail(),
            passwordEncoder.encode(request.motDePasse()),
            new Date()
        );

        joueursRepository.save(joueur);
        return new AuthResponse(joueur.getId_joueurs(), joueur.getPseudo(), joueur.getMail());
    }

    public AuthResponse login(LoginRequest request) {
        Joueurs joueur = joueursRepository.findByPseudo(request.pseudo())
                .orElseThrow(() -> new RuntimeException("Pseudo ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.motDePasse(), joueur.getMot_de_passe())) {
            throw new RuntimeException("Pseudo ou mot de passe incorrect");
        }

        return new AuthResponse(joueur.getId_joueurs(), joueur.getPseudo(), joueur.getMail());
    }
}
