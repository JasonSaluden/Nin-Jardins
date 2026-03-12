package com.hackathon.othello.controller;

import com.hackathon.othello.dto.GameStateResponse;
import com.hackathon.othello.dto.MoveRequest;
import com.hackathon.othello.dto.StartGameRequest;
import com.hackathon.othello.service.GameService;
import com.hackathon.othello.service.HintService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
public class GameController {

    private final GameService gameService;
    private final HintService hintService;

    public GameController(GameService gameService, HintService hintService) {
        this.gameService = gameService;
        this.hintService = hintService;
    }

    /** Démarre une nouvelle partie et retourne l'état initial */
    @PostMapping("/start")
    public ResponseEntity<GameStateResponse> start(@RequestBody(required = false) StartGameRequest request) {
        boolean contreIA = request != null && Boolean.TRUE.equals(request.getContreIA());
        String difficulteIA = request != null ? request.getDifficulteIA() : null;
        Integer joueurId = request != null ? request.getJoueurId() : null;
        Integer joueurBlancId = request != null ? request.getJoueurBlancId() : null;
        gameService.startGame(contreIA, difficulteIA, joueurId, joueurBlancId);
        return ResponseEntity.ok(buildState());
    }

    /** Retourne l'état courant du plateau */
    @GetMapping("/state")
    public ResponseEntity<GameStateResponse> state() {
        return ResponseEntity.ok(buildState());
    }

    /** Joue un coup pour le joueur courant */
    @PostMapping("/move")
    public ResponseEntity<?> move(@RequestBody MoveRequest request) {
        boolean ok = gameService.jouerCoupEtCompleterTour(request.getLigne(), request.getColonne());
        if (!ok) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Coup invalide");
        }
        return ResponseEntity.ok(buildState());
    }

    /** Déclenche le tour de l'IA (appelé après la temporisation côté client) */
    @PostMapping("/ai-move")
    public ResponseEntity<?> aiMove() {
        boolean ok = gameService.jouerTourIAEtCompleterTour();
        if (!ok) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tour IA indisponible");
        }
        return ResponseEntity.ok(buildState());
    }

    /** Demande un conseil à l'IA pour le coup actuel */
    @GetMapping("/hint")
    public ResponseEntity<String> hint() {
        try {
            return ResponseEntity.ok(hintService.getHint());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("L'IA n'est pas disponible pour le moment.");
        }
    }

    // -------------------------------------------------------------------------

    private GameStateResponse buildState() {
        int joueur = gameService.getJoueurCourant();
        boolean termine = gameService.estPartieTerminee();
        return new GameStateResponse(
                gameService.getPlateau(),
                termine ? java.util.Collections.emptyList() : gameService.getCoupsValides(joueur),
                termine,
                termine ? gameService.getVainqueur() : 0,
                joueur,
                gameService.compterPions(1),
                gameService.compterPions(2),
                gameService.isContreIA(),
                gameService.getDifficulteIA());
    }
}
