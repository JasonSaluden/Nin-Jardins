package com.hackathon.othello.dto;

public class StartGameRequest {
    private Boolean contreIA;
    private String difficulteIA;

    public Boolean getContreIA() {
        return contreIA;
    }

    public void setContreIA(Boolean contreIA) {
        this.contreIA = contreIA;
    }

    public String getDifficulteIA() {
        return difficulteIA;
    }

    public void setDifficulteIA(String difficulteIA) {
        this.difficulteIA = difficulteIA;
    }
}