package org.example.cognoquest.option;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface MatchingPairRepository extends JpaRepository<MatchingPair, UUID> {
    List<MatchingPair> findByQuestionId(UUID id);

    @Modifying
    void deleteByQuestionId(UUID questionId);

    @Modifying
    @Query("DELETE FROM MatchingPair mp WHERE mp.question.id IN :questionIds")
    void deleteByQuestionIdIn(List<UUID> questionIds);
}
