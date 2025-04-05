package org.example.cognoquest.survey;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SurveyAttemptRepository extends JpaRepository<SurveyAttempt, UUID> {
    Double findAverageScoreBySurveyId(UUID surveyId);
    Long countBySurveyIdAndCompletedAtNotNull(UUID surveyId);
    Optional<SurveyAttempt> findBySurveyIdAndUserId(UUID surveyId, UUID userId);
}
