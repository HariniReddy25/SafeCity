package com.safecity.repository;

import com.safecity.entity.ResponseNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResponseNoteRepository extends JpaRepository<ResponseNote, Long> {

    List<ResponseNote> findByReportIdOrderByCreatedAtAsc(Long reportId);
}
