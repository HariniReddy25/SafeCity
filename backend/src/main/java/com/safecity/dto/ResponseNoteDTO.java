package com.safecity.dto;

import com.safecity.entity.ResponseNote;
import java.time.LocalDateTime;

public class ResponseNoteDTO {

    private Long id;
    private Long reportId;
    private Long responderId;
    private String responderName;
    private String noteText;
    private LocalDateTime createdAt;

    public ResponseNoteDTO() {
    }

    public static ResponseNoteDTO fromEntity(ResponseNote note) {
        if (note == null) return null;
        ResponseNoteDTO dto = new ResponseNoteDTO();
        dto.setId(note.getId());
        if (note.getReport() != null) {
            dto.setReportId(note.getReport().getId());
        }
        if (note.getResponder() != null) {
            dto.setResponderId(note.getResponder().getId());
            dto.setResponderName(note.getResponder().getFullName());
        }
        dto.setNoteText(note.getNoteText());
        dto.setCreatedAt(note.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }

    public Long getResponderId() {
        return responderId;
    }

    public void setResponderId(Long responderId) {
        this.responderId = responderId;
    }

    public String getResponderName() {
        return responderName;
    }

    public void setResponderName(String responderName) {
        this.responderName = responderName;
    }

    public String getNoteText() {
        return noteText;
    }

    public void setNoteText(String noteText) {
        this.noteText = noteText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
