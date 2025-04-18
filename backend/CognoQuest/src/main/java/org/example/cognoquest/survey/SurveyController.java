package org.example.cognoquest.survey;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cognoquest.question.dto.QuestionClientResponseDto;
import org.example.cognoquest.survey.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
    public ResponseEntity<Page<SurveyListDto>> getSurveys(
            @RequestParam(required = false) String title,
            @PageableDefault(page = 0, size = 5, sort = "title", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        Page<SurveyListDto> surveysPage = surveyService.getAllSurveys(title, pageable);
        return ResponseEntity.ok(surveysPage);
    }

    @GetMapping("/user/surveys")
    public ResponseEntity<Page<SurveyListDto>> getUserSurveys(
            @RequestParam(required = false) String title,
            @PageableDefault(page = 0, size = 10, sort = "title", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        String userId = getCurrentUserId();
        Page<SurveyListDto> surveysPage = surveyService.getUserSurveys(userId, title, pageable);
        return ResponseEntity.ok(surveysPage);
    }

    @GetMapping("/{surveyId}")
    public ResponseEntity<SurveyClientResponseDto> getSurvey(@PathVariable UUID surveyId) {
        SurveyClientResponseDto survey = surveyService.getSurvey(surveyId);
        return ResponseEntity.ok(survey);
    }

    @GetMapping("/{surveyId}/edit")
    public ResponseEntity<SurveyEditDto> getSurveyForEdit(@PathVariable UUID surveyId) {
        String userId = getCurrentUserId();
        SurveyEditDto survey = surveyService.getSurveyForEdit(surveyId, userId);
        return ResponseEntity.ok(survey);
    }

    @GetMapping("/{surveyId}/questions")
    public ResponseEntity<List<QuestionClientResponseDto>> getSurveyQuestions(@PathVariable UUID surveyId) {
        List<QuestionClientResponseDto> questions = surveyService.getSurveyQuestions(surveyId);
        return ResponseEntity.ok(questions);
    }

    @PutMapping("/{surveyId}")
    public ResponseEntity<UUID> updateSurvey(
            @PathVariable UUID surveyId,
            @Valid @RequestBody SurveyEditDto dto
    ) {
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