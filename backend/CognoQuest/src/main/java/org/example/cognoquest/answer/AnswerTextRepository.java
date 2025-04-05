package org.example.cognoquest.answer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AnswerTextRepository extends JpaRepository<AnswerText, UUID> {
    List<AnswerText> findByAnswerId(UUID id);
}
