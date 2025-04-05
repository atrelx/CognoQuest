package org.example.cognoquest.question;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MatchingPairRepository extends JpaRepository<MatchingPair, UUID> {
    List<MatchingPair> findByQuestionId(UUID id);

    void deleteByQuestionId(UUID questionId);
}
