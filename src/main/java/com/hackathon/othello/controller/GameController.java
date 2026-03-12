package com.hackathon.othello.controller;

import com.hackathon.othello.dto.GameStateResponse;
import com.hackathon.othello.dto.MoveRequest;
import com.hackathon.othello.dto.StartGameRequest;
import com.hackathon.othello.service.GameService;
import com.hackathon.othello.service.HintService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

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
        String couleurJoueur = request != null ? request.getCouleurJoueur() : null;
        Integer joueurId = request != null ? request.getJoueurId() : null;
        Integer joueurBlancId = request != null ? request.getJoueurBlancId() : null;
        gameService.startGame(contreIA, difficulteIA, couleurJoueur, joueurId, joueurBlancId);
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

    /** Conseil IA en streaming (SSE) */
    @GetMapping(value = "/hint/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter hintStream() {
        SseEmitter emitter = new SseEmitter(60_000L);
        try {
            hintService.getHintStream().subscribe(
                chunk -> {
                    try {
                        // Préfixer d'un espace pour compenser le stripping SSE (spec retire 1 espace en tête de data:)
                        emitter.send(SseEmitter.event().data(" " + chunk));
                    } catch (IOException e) {
                        emitter.completeWithError(e);
                    }
                },
                e -> {
                    try {
                        emitter.send(SseEmitter.event().name("error").data("L'IA n'est pas disponible pour le moment."));
                    } catch (IOException ignored) {}
                    emitter.complete();
                },
                () -> {
                    try {
                        emitter.send(SseEmitter.event().name("done").data(""));
                    } catch (IOException ignored) {}
                    emitter.complete();
                }
            );
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
        return emitter;
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
