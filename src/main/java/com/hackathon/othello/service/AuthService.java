package com.hackathon.othello.service;

import com.hackathon.othello.dto.AuthResponse;
import com.hackathon.othello.dto.LoginRequest;
import com.hackathon.othello.dto.RegisterRequest;
import com.hackathon.othello.model.Joueur;
import com.hackathon.othello.repository.JoueurRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final JoueurRepository joueurRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(JoueurRepository joueurRepository, BCryptPasswordEncoder passwordEncoder) {
        this.joueurRepository = joueurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        if (joueurRepository.existsByPseudo(request.pseudo())) {
            throw new RuntimeException("Ce pseudo est déjà utilisé");
        }
        if (joueurRepository.existsByMail(request.mail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        Joueur joueur = new Joueur();
        joueur.setPseudo(request.pseudo());
        joueur.setMail(request.mail());
        joueur.setMotDePasse(passwordEncoder.encode(request.motDePasse()));

        joueurRepository.save(joueur);
        return new AuthResponse(joueur.getId(), joueur.getPseudo(), joueur.getMail());
    }

    public AuthResponse login(LoginRequest request) {
        Joueur joueur = joueurRepository.findByPseudo(request.pseudo())
                .orElseThrow(() -> new RuntimeException("Pseudo ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.motDePasse(), joueur.getMotDePasse())) {
            throw new RuntimeException("Pseudo ou mot de passe incorrect");
        }

        return new AuthResponse(joueur.getId(), joueur.getPseudo(), joueur.getMail());
    }
}
