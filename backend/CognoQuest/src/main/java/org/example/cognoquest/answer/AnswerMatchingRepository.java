package org.example.cognoquest.answer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AnswerMatchingRepository extends JpaRepository<AnswerMatching, UUID> {
    List<AnswerMatching> findByAnswerId(UUID id);
}
