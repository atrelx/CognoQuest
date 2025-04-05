package org.example.cognoquest.survey;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cognoquest.question.dto.QuestionResponseDto;
import org.example.cognoquest.survey.dto.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
public class SurveyController {
    private final SurveyService surveyService;

    @PostMapping
    public ResponseEntity<UUID> createSurvey(@Valid @RequestBody SurveyCreateDto dto) {
        String userId = getCurrentUserId();
        UUID surveyId = surveyService.createSurvey(dto, userId);
        return ResponseEntity.ok(surveyId);
    }

    @GetMapping
    public ResponseEntity<List<SurveyResponseDto>> getSurveys() {
        List<SurveyResponseDto> surveys = surveyService.getAllSurveys();
        return ResponseEntity.ok(surveys);
    }

    @GetMapping("/user/surveys")
    public ResponseEntity<List<SurveyResponseDto>> getUserSurveys() {
        String userId = getCurrentUserId();
        List<SurveyResponseDto> surveys = surveyService.getUserSurveys(userId);
        return ResponseEntity.ok(surveys);
    }

    @PutMapping("/{surveyId}")
    public ResponseEntity<UUID> updateSurvey(@PathVariable UUID surveyId, @Valid @RequestBody SurveyUpdateDto dto) {
        String userId = getCurrentUserId();
        UUID updatedSurveyId = surveyService.updateSurvey(surveyId, dto, userId);
        return ResponseEntity.ok(updatedSurveyId);
    }

    @DeleteMapping("/{surveyId}")
    public ResponseEntity<Void> deleteSurvey(@PathVariable UUID surveyId) {
        String userId = getCurrentUserId();
        surveyService.deleteSurvey(surveyId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{surveyId}/questions")
    public ResponseEntity<List<QuestionResponseDto>> getSurveyQuestions(@PathVariable UUID surveyId) {
        List<QuestionResponseDto> questions = surveyService.getSurveyQuestions(surveyId);
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/attempt")
    public ResponseEntity<UUID> submitAttempt(@Valid @RequestBody SurveyAttemptCreateDto dto) {
        String userId = getCurrentUserId();
        UUID attemptId = surveyService.submitAttempt(dto, userId);
        return ResponseEntity.ok(attemptId);
    }

    @GetMapping("/{surveyId}/results")
    public ResponseEntity<SurveyResultDto> getResults(@PathVariable UUID surveyId) {
        String userId = getCurrentUserId();
        SurveyResultDto result = surveyService.getSurveyResults(surveyId, userId);
        return ResponseEntity.ok(result);
    }

    private String getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return authentication.getName();
    }
}