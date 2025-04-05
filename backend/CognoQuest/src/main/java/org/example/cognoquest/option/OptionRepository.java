package org.example.cognoquest.option;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OptionRepository extends JpaRepository<Option, UUID> {
    List<Option> findByQuestionIdAndIsCorrect(UUID id, boolean b);
    List<Option> findByQuestionId(UUID id);
    void deleteByQuestionId(UUID questionId);
}
