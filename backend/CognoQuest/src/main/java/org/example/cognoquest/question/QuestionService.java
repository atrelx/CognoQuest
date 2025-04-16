package org.example.cognoquest.question;

import lombok.RequiredArgsConstructor;
import org.example.cognoquest.exception.ForbiddenException;
import org.example.cognoquest.exception.NotFoundException;
import org.example.cognoquest.option.MatchingPair;
import org.example.cognoquest.option.MatchingPairRepository;
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

        Question question = new Question();
        question.setSurvey(survey);
        question.setQuestionText(dto.getQuestionText());
        question.setType(dto.getType());
        question.setCorrectTextAnswer(dto.getCorrectTextAnswer());
        question = questionRepository.save(question);

        updateQuestionOptions(dto, question);

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

        updateQuestionOptions(dto, question);

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

    private void updateQuestionOptions(QuestionCreateDto dto, Question question) {
        if (dto.getOptions() != null) {
            for (var oDto : dto.getOptions()) {
                Option option = new Option();
                option.setQuestion(question);
                option.setOptionText(oDto.getOptionText());
                option.setCorrect(oDto.getIsCorrect());

                optionRepository.save(option);
            }
        }
        if (dto.getMatchingPairs() != null) {
            for (var mpDto : dto.getMatchingPairs()) {
                MatchingPair matchingPair = new MatchingPair();
                matchingPair.setQuestion(question);
                matchingPair.setLeftSide(mpDto.getLeftSide());
                matchingPair.setRightSide(mpDto.getRightSide());
                matchingPairRepository.save(matchingPair);
            }
        }
    }
}