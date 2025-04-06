package org.example.cognoquest.survey.mapper;

import org.example.cognoquest.answer.mapper.AnswerMapper;
import org.example.cognoquest.question.dto.QuestionClientResponseDto;
import org.example.cognoquest.question.dto.QuestionCreateDto;
import org.example.cognoquest.question.mapper.QuestionMapper;
import org.example.cognoquest.survey.Survey;
import org.example.cognoquest.survey.dto.*;
import org.example.cognoquest.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {QuestionMapper.class, AnswerMapper.class})
public interface SurveyMapper {
    @Mapping(target = "createdBy", source = "user")
    @Mapping(target = "id", ignore = true)
    Survey toEntity(SurveyCreateDto dto, User user);

    @Mapping(target = "averageScore", source = "averageScore")
    @Mapping(target = "completionCount", source = "completionCount")
    @Mapping(target = "userAttempt", source = "attempt")
    SurveyResultDto toResultDto(Survey survey, Double averageScore, Long completionCount, SurveyAttemptResultDto attempt);

    @Mapping(target = "id", source = "survey.id")
    @Mapping(target = "title", source = "survey.title")
    @Mapping(target = "description", source = "survey.description")
    @Mapping(target = "createdBy", source = "survey.createdBy.id")
    @Mapping(target = "createdByName", source = "survey.createdBy.name")
    @Mapping(target = "startDate", source = "survey.startDate")
    @Mapping(target = "endDate", source = "survey.endDate")
    @Mapping(target = "questions", source = "questions")
    SurveyResponseDto toResponseDto(Survey survey, List<QuestionCreateDto> questions);

    // automatically maps questions from survey
    @Mapping(target = "createdBy", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.name")
    @Mapping(target = "questions", source = "questions")
    SurveyResponseDto toResponseDto(Survey survey);

    @Mapping(target = "id", source = "survey.id")
    @Mapping(target = "title", source = "survey.title")
    @Mapping(target = "description", source = "survey.description")
    @Mapping(target = "createdBy", source = "survey.createdBy.id")
    @Mapping(target = "createdByName", source = "survey.createdBy.name")
    @Mapping(target = "startDate", source = "survey.startDate")
    @Mapping(target = "endDate", source = "survey.endDate")
    @Mapping(target = "questions", source = "questions")
    SurveyClientResponseDto toClientResponseDto(Survey survey, List<QuestionClientResponseDto> questions);

    @Mapping(target = "createdBy", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.name")
    @Mapping(target = "questions", expression = "java(survey.getQuestions().stream().map(questionMapper::toClientResponseDto).collect(java.util.stream.Collectors.toList()))")
    SurveyClientResponseDto toClientResponseDto(Survey survey);
}