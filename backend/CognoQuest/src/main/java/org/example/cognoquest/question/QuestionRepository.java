package org.example.cognoquest.question;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {
    List<Question> findBySurveyId(UUID surveyId);

    @Modifying
    @Query("DELETE FROM Question q WHERE q.survey.id = :surveyId")
    void deleteBySurveyId(@Param("surveyId") UUID surveyId);
}
