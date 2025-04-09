package org.example.cognoquest.survey;

import lombok.RequiredArgsConstructor;
import org.example.cognoquest.answer.*;
import org.example.cognoquest.answer.dto.AnswerCreateDto;
import org.example.cognoquest.answer.dto.AnswerResultDto;
import org.example.cognoquest.option.mapper.OptionMapper;
import org.example.cognoquest.question.dto.QuestionClientResponseDto;
import org.example.cognoquest.question.mapper.MatchingPairMapper;
import org.example.cognoquest.survey.dto.*;
import org.example.cognoquest.answer.mapper.AnswerMapper;
import org.example.cognoquest.exception.ForbiddenException;
import org.example.cognoquest.exception.NotFoundException;
import org.example.cognoquest.option.Option;
import org.example.cognoquest.option.OptionRepository;
import org.example.cognoquest.question.*;
import org.example.cognoquest.question.mapper.QuestionMapper;
import org.example.cognoquest.survey.mapper.SurveyMapper;
import org.example.cognoquest.user.User;
import org.example.cognoquest.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SurveyService {
    private final SurveyRepository surveyRepository;
    private final SurveyAttemptRepository attemptRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final MatchingPairRepository matchingPairRepository;
    private final AnswerRepository answerRepository;
    private final AnswerOptionRepository answerOptionRepository;
    private final AnswerMatchingRepository answerMatchingRepository;
    private final AnswerTextRepository answerTextRepository;
    private final UserRepository userRepository;
    private final SurveyMapper surveyMapper;
    private final AnswerMapper answerMapper;
    private final QuestionMapper questionMapper;
    private final OptionMapper optionMapper;
    private final MatchingPairMapper matchingPairMapper;

    @Transactional
    public UUID createSurvey(SurveyCreateDto dto, String userId) {
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new NotFoundException("User not found"));

        Survey survey = surveyMapper.toEntity(dto, user);
        survey = surveyRepository.save(survey);

        List<Question> questions = new ArrayList<>();
        for (var qDto : dto.getQuestions()) {
            Question question = new Question(null, survey, qDto.getQuestionText(), qDto.getType(), qDto.getCorrectTextAnswer());
            question = questionRepository.save(question);

            if (qDto.getOptions() != null) {
                for (var oDto : qDto.getOptions()) {
                    Option option = new Option(null, question, oDto.getOptionText(), oDto.getIsCorrect());
                    optionRepository.save(option);
                }
            }
            if (qDto.getMatchingPairs() != null) {
                for (var mpDto : qDto.getMatchingPairs()) {
                    MatchingPair matchingPair = new MatchingPair(null, question, mpDto.getLeftSide(), mpDto.getRightSide());
                    matchingPairRepository.save(matchingPair);
                }
            }
            questions.add(question);
        }
        survey.setQuestions(questions);
        surveyRepository.save(survey);

        return survey.getId();
    }

    @Transactional
    public UUID updateSurvey(UUID surveyId, SurveyUpdateDto dto, String userId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new NotFoundException("Survey not found"));
        if (!survey.getCreatedBy().getId().toString().equals(userId)) {
            throw new ForbiddenException("Only the creator can update the survey");
        }

        survey.setTitle(dto.getTitle());
        survey.setDescription(dto.getDescription());
        survey.setStartDate(dto.getStartDate());
        survey.setEndDate(dto.getEndDate());
        return surveyRepository.save(survey).getId();
    }

    @Transactional
    public void deleteSurvey(UUID surveyId, String userId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new NotFoundException("Survey not found"));
        if (!survey.getCreatedBy().getId().toString().equals(userId)) {
            throw new ForbiddenException("Only the creator can delete the survey");
        }
        surveyRepository.delete(survey);
    }

    @Transactional
    public UUID submitAttempt(SurveyAttemptCreateDto dto, String userId) {
        User user = userId != null ? userRepository.findById(UUID.fromString(userId)).orElse(null) : null;

        Survey survey = surveyRepository.findById(dto.getSurveyId())
                .orElseThrow(() -> new NotFoundException("Survey not found"));

        System.out.println("User taking the survey: " + user);

        int totalSurveyQuestions = survey.getQuestions().size();
        if (dto.getAnswers().size() != totalSurveyQuestions) {
            throw new IllegalArgumentException(
                    "Incomplete submission: expected " + totalSurveyQuestions + " answers, but received " + dto.getAnswers().size()
            );
        }

        Set<UUID> surveyQuestionIds = survey.getQuestions().stream()
                .map(Question::getId)
                .collect(Collectors.toSet());
        Set<UUID> submittedQuestionIds = dto.getAnswers().stream()
                .map(AnswerCreateDto::getQuestionId)
                .collect(Collectors.toSet());

        if (!surveyQuestionIds.equals(submittedQuestionIds)) {
            throw new IllegalArgumentException(
                    "Submitted answers do not match survey questions. Expected question IDs: " + surveyQuestionIds +
                            ", but received: " + submittedQuestionIds
            );
        }

        SurveyAttempt attempt = new SurveyAttempt(null, survey, user, OffsetDateTime.now(), null, null);
        attempt = attemptRepository.save(attempt);

        int correctAnswers = 0;
        int totalQuestions = dto.getAnswers().size();

        for (AnswerCreateDto answerDto : dto.getAnswers()) {
            System.out.println("Processing answer for question ID: " + answerDto.getQuestionId());
            Question question = questionRepository.findById(answerDto.getQuestionId())
                    .orElseThrow(() -> new NotFoundException("Question not found"));

            Answer answer = answerMapper.toEntity(answerDto, attempt, question);
            boolean isCorrect = checkAnswerCorrectness(answerDto, question);
            answer.setIsCorrect(isCorrect);
            System.out.println("Saving Answer entity...");
            answer = answerRepository.save(answer);
            System.out.println("Saved Answer entity with ID: " + answer.getId());

            if (isCorrect) correctAnswers++;

            switch (question.getType()) {
                case SingleChoice:
                case MultipleChoice:
                    if (answerDto.getSelectedOptionIds() != null) {
                        for (UUID optionId : answerDto.getSelectedOptionIds()) {
                            Option option = optionRepository.findById(optionId)
                                    .orElseThrow(() -> new NotFoundException("Option " + optionId + " not found"));

                            if (!option.getQuestion().getId().equals(question.getId())) {
                                throw new IllegalArgumentException("Option " + optionId + " does not belong to question " + question.getId());
                            }
                            AnswerOption answerOption = answerMapper.toOptionEntity(option, answer);
                            answerOptionRepository.save(answerOption);
                        }
                    }
                    break;
                case Matching:
                    if (answerDto.getMatchingAnswers() != null) {
                        for (var maDto : answerDto.getMatchingAnswers()) {
                            AnswerMatching answerMatching = answerMapper.toMatchingEntity(maDto, answer);
                            answerMatchingRepository.save(answerMatching);
                        }
                    }
                    break;
                case TextInput:
                    System.out.println("Handling TextInput for Answer ID: " + answer.getId());

                    //TODO: currently creating answerText entity here, but it should be created in the mapper - bug
                    AnswerText answerText = new AnswerText();
                    answerText.setAnswer(answer);
                    answerText.setTextValue(answerDto.getTextAnswer());

                    //AnswerText answerText = answerMapper.toTextEntity(answerDto, answer);
                    System.out.println("Manually Creating AnswerText: [Value: '" + answerText.getTextValue() + "', Answer ID: " + (answerText.getAnswer() != null ? answerText.getAnswer().getId() : "null") + "]");
                    //answerTextRepository.save(answerText);
                    try {
                        System.out.println("Attempting to save AnswerText...");
                        answerTextRepository.save(answerText);
                        System.out.println("Successfully saved AnswerText with ID: " + answerText.getId() + " for Answer ID: " + answer.getId());
                    } catch (Exception e) {
                        System.err.println("!!! ERROR saving AnswerText for Answer ID: " + answer.getId() + " !!!");
                        e.printStackTrace();
                        throw e;
                    }
                    break;
            }
        }

        double score = (double) correctAnswers / totalQuestions * 100;
        attempt.setScore(score);
        attempt.setCompletedAt(OffsetDateTime.now());
        attemptRepository.save(attempt);

        System.out.println("Survey attempt saved: " + attempt);
        return attempt.getId();
    }

    public SurveyResultDto getSurveyResults(UUID surveyId, String userId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new NotFoundException("Survey not found"));

        Double avgScore = attemptRepository.findAverageScoreBySurveyId(surveyId)
                .orElse(null);
        Long completionCount = attemptRepository.countBySurveyIdAndCompletedAtNotNull(surveyId);
        SurveyAttempt attempt = userId != null ? attemptRepository.findBySurveyIdAndUserId(surveyId, UUID.fromString(userId))
                .orElse(null) : null;

        SurveyAttemptResultDto attemptResult = attempt != null ? getAttemptResult(attempt) : null;
        return surveyMapper.toResultDto(survey, avgScore, completionCount, attemptResult);
    }

    public List<SurveyClientResponseDto> getAllSurveys() {
        List<Survey> surveys = surveyRepository.findAll();
        return surveys.stream()
                .map(survey -> {
                    SurveyClientResponseDto dto = surveyMapper.toClientResponseDto(survey);
                    dto.getQuestions().forEach(q -> {
                        q.setOptions(optionMapper.toClientResponseDto(
                                optionRepository.findByQuestionId(q.getId())));
                        q.setMatchingPairs(matchingPairMapper.toClientResponseDto(
                                matchingPairRepository.findByQuestionId(q.getId())));
                    });
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<SurveyClientResponseDto> getUserSurveys(String userId) {
        List<Survey> surveys = surveyRepository.findByCreatedById(UUID.fromString(userId));
        return surveys.stream()
                .map(survey -> {
                    SurveyClientResponseDto dto = surveyMapper.toClientResponseDto(survey);
                    dto.getQuestions().forEach(q -> {
                        q.setOptions(optionMapper.toClientResponseDto(
                                optionRepository.findByQuestionId(q.getId())));
                        q.setMatchingPairs(matchingPairMapper.toClientResponseDto(
                                matchingPairRepository.findByQuestionId(q.getId())));
                    });
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public SurveyClientResponseDto getSurvey(UUID surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new NotFoundException("Survey not found"));

        SurveyClientResponseDto dto = surveyMapper.toClientResponseDto(survey);
        dto.getQuestions().forEach(q -> {
            q.setOptions(optionMapper.toClientResponseDto(
                    optionRepository.findByQuestionId(q.getId())));
            q.setMatchingPairs(matchingPairMapper.toClientResponseDto(
                    matchingPairRepository.findByQuestionId(q.getId())));
        });
        return dto;
    }

    public List<QuestionClientResponseDto> getSurveyQuestions(UUID surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new NotFoundException("Survey not found"));

        List<Question> questions = questionRepository.findBySurveyId(surveyId);
        return questions.stream()
                .map(q -> {
                    QuestionClientResponseDto dto = questionMapper.toClientResponseDto(q);
                    dto.setOptions(optionMapper.toClientResponseDto(
                            optionRepository.findByQuestionId(q.getId())));
                    dto.setMatchingPairs(matchingPairMapper.toClientResponseDto(
                            matchingPairRepository.findByQuestionId(q.getId())));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private boolean checkAnswerCorrectness(AnswerCreateDto dto, Question question) {
        switch (question.getType()) {
            case SingleChoice:
                List<Option> correctOptions = optionRepository.findByQuestionIdAndIsCorrect(question.getId(), true);
                return dto.getSelectedOptionIds() != null && dto.getSelectedOptionIds().size() == 1 &&
                        correctOptions.size() == 1 &&
                        dto.getSelectedOptionIds().get(0).equals(correctOptions.get(0).getId());
            case MultipleChoice:
                List<UUID> correctOptionIds = optionRepository.findByQuestionIdAndIsCorrect(question.getId(), true)
                        .stream().map(Option::getId).toList();
                return dto.getSelectedOptionIds() != null && dto.getSelectedOptionIds().containsAll(correctOptionIds) &&
                        correctOptionIds.containsAll(dto.getSelectedOptionIds());
            case TextInput:
                return dto.getTextAnswer() != null && dto.getTextAnswer().equalsIgnoreCase(question.getCorrectTextAnswer());
            case Matching:
                List<MatchingPair> pairs = matchingPairRepository.findByQuestionId(question.getId());
                return dto.getMatchingAnswers() != null && dto.getMatchingAnswers().stream().allMatch(ma ->
                        pairs.stream().anyMatch(p -> p.getId().equals(ma.getPairId()) &&
                                p.getRightSide().equals(ma.getSelectedRightSide())));
            default:
                return false;
        }
    }

    private SurveyAttemptResultDto getAttemptResult(SurveyAttempt attempt) {
        List<Answer> answers = answerRepository.findByAttemptId(attempt.getId());
        List<AnswerResultDto> answerResults = answers.stream().map(answer -> {
            Question q = answer.getQuestion();
            List<String> userAnswers = getUserAnswers(answer);
            List<String> correctAnswers = getCorrectAnswers(q);
            return answerMapper.toResultDto(answer, userAnswers, correctAnswers);
        }).toList();
        return answerMapper.toAttemptResultDto(attempt, answerResults);
    }

    private List<String> getUserAnswers(Answer answer) {
        switch (answer.getQuestion().getType()) {
            case SingleChoice:
            case MultipleChoice:
                return answerOptionRepository.findByAnswerId(answer.getId())
                        .stream().map(ao -> ao.getOption().getOptionText()).toList();
            case TextInput:
                return answerTextRepository.findByAnswerId(answer.getId())
                        .stream().map(AnswerText::getTextValue).toList();
            case Matching:
                return answerMatchingRepository.findByAnswerId(answer.getId())
                        .stream().map(am -> am.getSelectedRightSide()).toList();
            default:
                return List.of();
        }
    }

    private List<String> getCorrectAnswers(Question question) {
        switch (question.getType()) {
            case SingleChoice:
            case MultipleChoice:
                return optionRepository.findByQuestionIdAndIsCorrect(question.getId(), true)
                        .stream().map(Option::getOptionText).toList();
            case TextInput:
                return List.of(question.getCorrectTextAnswer());
            case Matching:
                return matchingPairRepository.findByQuestionId(question.getId())
                        .stream().map(MatchingPair::getRightSide).toList();
            default:
                return List.of();
        }
    }

}