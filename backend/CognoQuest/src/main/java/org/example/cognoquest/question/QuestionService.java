package org.example.cognoquest.question;

import lombok.RequiredArgsConstructor;
import org.example.cognoquest.exception.ForbiddenException;
import org.example.cognoquest.exception.NotFoundException;
import org.example.cognoquest.option.Option;
import org.example.cognoquest.option.OptionRepository;
import org.example.cognoquest.question.dto.QuestionCreateDto;
import org.example.cognoquest.survey.Survey;
import org.example.cognoquest.survey.SurveyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final SurveyRepository surveyRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final MatchingPairRepository matchingPairRepository;

    @Transactional
    public UUID addQuestion(UUID surveyId, QuestionCreateDto dto, String userId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new NotFoundException("Survey not found"));
        if (!survey.getCreatedBy().getId().toString().equals(userId)) {
            throw new ForbiddenException("Only the creator can add questions");
        }

        Question question = new Question(null, survey, dto.getQuestionText(), dto.getType(), dto.getCorrectTextAnswer());
        question = questionRepository.save(question);

        if (dto.getOptions() != null) {
            for (var oDto : dto.getOptions()) {
                Option option = new Option(null, question, oDto.getOptionText(), oDto.getIsCorrect());
                optionRepository.save(option);
            }
        }
        if (dto.getMatchingPairs() != null) {
            for (var mpDto : dto.getMatchingPairs()) {
                MatchingPair matchingPair = new MatchingPair(null, question, mpDto.getLeftSide(), mpDto.getRightSide());
                matchingPairRepository.save(matchingPair);
            }
        }

        return question.getId();
    }

    @Transactional
    public UUID updateQuestion(UUID surveyId, UUID questionId, QuestionCreateDto dto, String userId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new NotFoundException("Survey not found"));
        if (!survey.getCreatedBy().getId().toString().equals(userId)) {
            throw new ForbiddenException("Only the creator can update questions");
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new NotFoundException("Question not found"));
        if (!question.getSurvey().getId().equals(surveyId)) {
            throw new NotFoundException("Question does not belong to this survey");
        }

        question.setQuestionText(dto.getQuestionText());
        question.setType(dto.getType());
        question.setCorrectTextAnswer(dto.getCorrectTextAnswer());

        optionRepository.deleteByQuestionId(questionId);
        matchingPairRepository.deleteByQuestionId(questionId);

        if (dto.getOptions() != null) {
            for (var oDto : dto.getOptions()) {
                Option option = new Option(null, question, oDto.getOptionText(), oDto.getIsCorrect());
                optionRepository.save(option);
            }
        }
        if (dto.getMatchingPairs() != null) {
            for (var mpDto : dto.getMatchingPairs()) {
                MatchingPair matchingPair = new MatchingPair(null, question, mpDto.getLeftSide(), mpDto.getRightSide());
                matchingPairRepository.save(matchingPair);
            }
        }

        return questionRepository.save(question).getId();
    }

    @Transactional
    public void deleteQuestion(UUID surveyId, UUID questionId, String userId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new NotFoundException("Survey not found"));
        if (!survey.getCreatedBy().getId().toString().equals(userId)) {
            throw new ForbiddenException("Only the creator can delete questions");
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new NotFoundException("Question not found"));
        if (!question.getSurvey().getId().equals(surveyId)) {
            throw new NotFoundException("Question does not belong to this survey");
        }

        questionRepository.delete(question);
    }
}