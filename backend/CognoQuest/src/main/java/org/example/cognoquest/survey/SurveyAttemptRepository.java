package org.example.cognoquest.survey;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SurveyAttemptRepository extends JpaRepository<SurveyAttempt, UUID> {

    @Query("SELECT AVG(sa.score) FROM SurveyAttempt sa WHERE sa.survey.id = :surveyId AND sa.completedAt IS NOT NULL")
    Optional<Double> findAverageScoreBySurveyId(UUID surveyId);

    Long countBySurveyIdAndCompletedAtNotNull(UUID surveyId);
    Optional<SurveyAttempt> findBySurveyIdAndUserId(UUID surveyId, UUID userId);

    @Modifying
    void deleteBySurveyId(UUID surveyId);

    // Select the latest attempt for a given survey and user
    @Query("SELECT sa FROM SurveyAttempt sa WHERE sa.survey.id = :surveyId AND sa.user.id = :userId ORDER BY sa.completedAt DESC LIMIT 1")
    Optional<SurveyAttempt> findLatestBySurveyIdAndUserId(@Param("surveyId") UUID surveyId, @Param("userId") UUID userId);
}
