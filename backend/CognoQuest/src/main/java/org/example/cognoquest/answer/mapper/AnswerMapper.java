package org.example.cognoquest.answer.mapper;

import org.example.cognoquest.answer.*;
import org.example.cognoquest.answer.dto.*;
import org.example.cognoquest.option.Option;
import org.example.cognoquest.option.MatchingPair;
import org.example.cognoquest.question.Question;
import org.example.cognoquest.survey.SurveyAttempt;
import org.example.cognoquest.survey.dto.SurveyAttemptResultDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AnswerMapper {
    @Mapping(target = "attempt", source = "attempt")
    @Mapping(target = "question", source = "question")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isCorrect", ignore = true) // Being set in the service
    Answer toEntity(AnswerCreateDto dto, SurveyAttempt attempt, Question question);

    @Mapping(target = "option", source = "option")
    @Mapping(target = "answer", source = "answer")
    @Mapping(target = "id", ignore = true)
    AnswerOption toOptionEntity(Option option, Answer answer);

    @Mapping(target = "pair", source = "pair")
    @Mapping(target = "answer", source = "answer")
    @Mapping(target = "selectedRightSide", source = "dto.selectedRightSide")
    @Mapping(target = "id", ignore = true)
    AnswerMatching toMatchingEntity(MatchingAnswerDto dto, Answer answer, MatchingPair pair);

    @Mapping(target = "answer", source = "answer")
    @Mapping(target = "textValue", source = "dto.textAnswer")
    @Mapping(target = "id", ignore = true)
    AnswerText toTextEntity(AnswerCreateDto dto, Answer answer);

    @Mapping(target = "questionId", source = "answer.question.id")
    @Mapping(target = "questionText", source = "answer.question.questionText")
    @Mapping(target = "userAnswers", source = "userAnswers")
    @Mapping(target = "correctAnswers", source = "correctAnswers")
    AnswerResultDto toResultDto(Answer answer, List<String> userAnswers, List<String> correctAnswers);

    SurveyAttemptResultDto toAttemptResultDto(SurveyAttempt attempt, List<AnswerResultDto> answers);
}