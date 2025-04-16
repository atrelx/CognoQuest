package org.example.cognoquest.answer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AnswerRepository extends JpaRepository<Answer, UUID> {
    @Modifying
    @Query("DELETE FROM Answer a WHERE a.question.id IN :questionIds")
    void deleteByQuestionIdIn(@Param("questionIds") List<UUID> questionIds);

    @Modifying
    void deleteByQuestionId(UUID questionId);

    @Modifying
    @Query("DELETE FROM Answer a WHERE a.attempt.id IN (SELECT sa.id FROM SurveyAttempt sa WHERE sa.survey.id = :surveyId)")
    void deleteBySurveyId(@Param("surveyId") UUID surveyId);

    List<Answer> findByAttemptId(UUID id);
}
