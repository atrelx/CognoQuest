package org.example.cognoquest.question;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cognoquest.question.dto.QuestionCreateDto;
import org.example.cognoquest.question.dto.QuestionResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/surveys/{surveyId}/questions")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;

    @PostMapping
    public ResponseEntity<UUID> addQuestion(@PathVariable UUID surveyId, @Valid @RequestBody QuestionCreateDto dto) {
        String userId = getCurrentUserId();
        UUID questionId = questionService.addQuestion(surveyId, dto, userId);
        return ResponseEntity.ok(questionId);
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<UUID> updateQuestion(@PathVariable UUID surveyId, @PathVariable UUID questionId,
                                               @Valid @RequestBody QuestionCreateDto dto) {
        String userId = getCurrentUserId();
        UUID updatedQuestionId = questionService.updateQuestion(surveyId, questionId, dto, userId);
        return ResponseEntity.ok(updatedQuestionId);
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID surveyId, @PathVariable UUID questionId) {
        String userId = getCurrentUserId();
        questionService.deleteQuestion(surveyId, questionId, userId);
        return ResponseEntity.ok().build();
    }

    private String getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return authentication.getName();
    }
}