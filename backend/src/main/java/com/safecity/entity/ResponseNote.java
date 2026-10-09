package com.safecity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "response_notes", indexes = {
    @Index(name = "idx_note_report_id", columnList = "report_id"),
    @Index(name = "idx_note_responder_id", columnList = "responder_id")
})
public class ResponseNote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private EmergencyReport report;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responder_id", nullable = false)
    private User responder;

    @Column(name = "note_text", nullable = false, columnDefinition = "TEXT")
    private String noteText;

    public ResponseNote() {
    }

    public ResponseNote(EmergencyReport report, User responder, String noteText) {
        this.report = report;
        this.responder = responder;
        this.noteText = noteText;
    }

    public EmergencyReport getReport() {
        return report;
    }

    public void setReport(EmergencyReport report) {
        this.report = report;
    }

    public User getResponder() {
        return responder;
    }

    public void setResponder(User responder) {
        this.responder = responder;
    }

    public String getNoteText() {
        return noteText;
    }

    public void setNoteText(String noteText) {
        this.noteText = noteText;
    }
}
