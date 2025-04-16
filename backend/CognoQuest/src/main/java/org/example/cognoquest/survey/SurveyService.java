package org.example.cognoquest.survey;

import lombok.RequiredArgsConstructor;
import org.example.cognoquest.answer.*;
import org.example.cognoquest.answer.dto.AnswerCreateDto;
import org.example.cognoquest.answer.dto.AnswerResultDto;
import org.example.cognoquest.answer.dto.MatchingAnswerDto;
import org.example.cognoquest.option.MatchingPair;
import org.example.cognoquest.option.MatchingPairRepository;
import org.example.cognoquest.option.dto.MatchingPairData;
import org.example.cognoquest.option.dto.OptionData;
import org.example.cognoquest.option.dto.OptionEditDto;
import org.example.cognoquest.option.mapper.OptionMapper;
import org.example.cognoquest.option.dto.MatchingPairEditDto;
import org.example.cognoquest.question.dto.QuestionClientResponseDto;
import org.example.cognoquest.question.dto.QuestionData;
import org.example.cognoquest.question.dto.QuestionEditDto;
import org.example.cognoquest.option.mapper.MatchingPairMapper;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.function.Function;
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

        validateQuestions(dto.getQuestions());

        Survey survey = surveyMapper.toEntity(dto, user);
        survey = surveyRepository.save(survey);

        List<Question> questions = new ArrayList<>();
        for (var qDto : dto.getQuestions()) {
            Question question = new Question();
            question.setSurvey(survey);
            question.setQuestionText(qDto.getQuestionText());
            question.setType(qDto.getType());
            question.setCorrectTextAnswer(qDto.getCorrectTextAnswer());
            question = questionRepository.save(question);

            if (qDto.getOptions() != null) {
                for (var oDto : qDto.getOptions()) {
                    System.out.println("  Processing Option DTO: text=" + oDto.getOptionText() + ", isCorrect=" + oDto.getIsCorrect());
                    Option option = new Option();
                    option.setQuestion(question);
                    option.setOptionText(oDto.getOptionText());
                    option.setCorrect(oDto.getIsCorrect());
                    System.out.println("    Created/Mapped Option Entity: text=" + option.getOptionText() + ", isCorrect=" + option.isCorrect());
                    optionRepository.save(option);
                }
            }
            if (qDto.getMatchingPairs() != null) {
                for (var mpDto : qDto.getMatchingPairs()) {
                    MatchingPair matchingPair = new MatchingPair();
                    matchingPair.setQuestion(question);
                    matchingPair.setLeftSide(mpDto.getLeftSide());
                    matchingPair.setRightSide(mpDto.getRightSide());
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
    public UUID updateSurvey(UUID surveyId, SurveyEditDto dto, String userId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new NotFoundException("Survey not found"));
        if (!survey.getCreatedBy().getId().toString().equals(userId)) {
            throw new ForbiddenException("Only the creator can update the survey");
        }

        // Update survey metadata
        survey.setTitle(dto.getTitle());
        survey.setDescription(dto.getDescription());
        survey.setStartDate(dto.getStartDate());
        survey.setEndDate(dto.getEndDate());

        // Prepare map of existing questions
        Map<UUID, Question> existingQuestionsMap = questionRepository.findBySurveyId(surveyId).stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        // Process questions
        List<Question> finalQuestions = new ArrayList<>();
        Set<UUID> processedQuestionIds = new HashSet<>();

        for (QuestionEditDto qDto : dto.getQuestions()) {
            Question question;
            if (qDto.getId() != null && existingQuestionsMap.containsKey(qDto.getId())) {
                // Update existing question
                question = existingQuestionsMap.get(qDto.getId());
                System.out.println("Updating existing question ID: " + question.getId());
                question.setQuestionText(qDto.getQuestionText());
                question.setType(qDto.getType());
                question.setCorrectTextAnswer(qDto.getCorrectTextAnswer());

                // Update options and pairs (no preemptive deletion)
                saveOptionsAndPairsFromDto(qDto, question);

                processedQuestionIds.add(question.getId());
            } else {
                // Add new question
                System.out.println("Adding new question: " + qDto.getQuestionText());
                question = new Question();
                question.setSurvey(survey);
                question.setQuestionText(qDto.getQuestionText());
                question.setType(qDto.getType());
                question.setCorrectTextAnswer(qDto.getCorrectTextAnswer());
                question = questionRepository.save(question);

                // Save options and pairs for new question
                saveOptionsAndPairsFromDto(qDto, question);
            }
            finalQuestions.add(question);
        }

        // Delete questions not included in DTO
        List<UUID> idsToDelete = existingQuestionsMap.keySet().stream()
                .filter(id -> !processedQuestionIds.contains(id))
                .toList();
        if (!idsToDelete.isEmpty()) {
            System.out.println("Deleting questions not present in DTO: " + idsToDelete);
            answerRepository.deleteByQuestionIdIn(idsToDelete);
            answerRepository.flush();
            questionRepository.deleteAllById(idsToDelete);
            questionRepository.flush();
        }

        // Save survey
        surveyRepository.save(survey);
        System.out.println("Survey update finished for ID: " + survey.getId());

        return survey.getId();
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

        SurveyAttempt attempt = new SurveyAttempt();
        attempt.setSurvey(survey);
        attempt.setUser(user);
        attempt.setStartedAt(OffsetDateTime.now());
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
                            MatchingPair pair = matchingPairRepository.findById(maDto.getPairId())
                                    .orElseThrow(() -> new NotFoundException("MatchingPair " + maDto.getPairId() + " not found for question " + question.getId()));

                            if (!pair.getQuestion().getId().equals(question.getId())) {
                                throw new IllegalArgumentException("MatchingPair " + maDto.getPairId() + " does not belong to question " + question.getId());
                            }

                            AnswerMatching answerMatching = answerMapper.toMatchingEntity(maDto, answer, pair);
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

                    try {
                        answerTextRepository.save(answerText);
                    } catch (Exception e) {
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
        SurveyAttempt latestAttempt = userId != null ? attemptRepository.findLatestBySurveyIdAndUserId(surveyId, UUID.fromString(userId))
                .orElse(null) : null;

        SurveyAttemptResultDto attemptResult = latestAttempt != null ? getAttemptResult(latestAttempt) : null;
        return surveyMapper.toResultDto(survey, avgScore, completionCount, attemptResult);
    }

    @Transactional(readOnly = true)
    public Page<SurveyListDto> getAllSurveys(String titleQuery, Pageable pageable) {
        Page<Survey> surveyPage = surveyRepository.findByTitleContainingIgnoreCaseWithCreator(titleQuery, pageable);

        return surveyPage.map(surveyMapper::toListDto);
    }

    @Transactional(readOnly = true)
    public Page<SurveyListDto> getUserSurveys(String userId, String titleQuery, Pageable pageable) {
        Page<Survey> surveyPage = surveyRepository.findByCreatedByIdAndTitleContainingIgnoreCaseWithCreator(
                UUID.fromString(userId), titleQuery, pageable
        );
        return surveyPage.map(surveyMapper::toListDto);
    }

    @Transactional(readOnly = true)
    public SurveyClientResponseDto getSurvey(UUID surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new NotFoundException("Survey not found"));

        SurveyClientResponseDto surveyDto = surveyMapper.toClientResponseDto(survey);

        // Mapping questions to DTOs by hand
        List<Question> questions = questionRepository.findBySurveyId(surveyId);

        List<QuestionClientResponseDto> questionDtos = questions.stream().map(question -> {
            QuestionClientResponseDto questionDto = questionMapper.toClientResponseDto(question);
            List<Option> options = optionRepository.findByQuestionId(question.getId());
            questionDto.setOptions(optionMapper.toClientDtoList(options));
            List<MatchingPair> pairs = matchingPairRepository.findByQuestionId(question.getId());

            questionDto.setMatchingPairs(matchingPairMapper.toClientResponseDto(pairs));
            return questionDto;
        }).collect(Collectors.toList());

        surveyDto.setQuestions(questionDtos);

        return surveyDto;
    }

    @Transactional(readOnly = true)
    public SurveyEditDto getSurveyForEdit(UUID surveyId, String userId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new NotFoundException("Survey not found"));

        if (!survey.getCreatedBy().getId().toString().equals(userId)) {
            throw new ForbiddenException("You are not allowed to edit this survey.");
        }

        SurveyEditDto surveyDto = surveyMapper.toEditDto(survey);
        List<Question> questions = questionRepository.findBySurveyId(surveyId);

        System.out.println("--- SurveyService.getSurveyForEdit ---");
        // Mapping questions to DTOs by hand
        List<QuestionEditDto> questionDtos = questions.stream().map(question -> {
            QuestionEditDto questionDto = questionMapper.toEditDto(question);

            List<Option> options = optionRepository.findByQuestionId(question.getId());
            List<OptionEditDto> optionEditDtos = optionMapper.toEditDtoList(options);
            questionDto.setOptions(optionEditDtos);

            List<MatchingPair> pairs = matchingPairRepository.findByQuestionId(question.getId());
            List<MatchingPairEditDto> pairEditDtos = matchingPairMapper.toEditDtoList(pairs);
            questionDto.setMatchingPairs(pairEditDtos);
            return questionDto;
        }).collect(Collectors.toList());

        surveyDto.setQuestions(questionDtos);

        return surveyDto;
    }

    @Transactional(readOnly = true)
    public List<QuestionClientResponseDto> getSurveyQuestions(UUID surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new NotFoundException("Survey not found"));

        List<Question> questions = questionRepository.findBySurveyId(surveyId);
        return questions.stream()
                .map(questionMapper::toClientResponseDto)
                .collect(Collectors.toList());
    }

    private boolean checkAnswerCorrectness(AnswerCreateDto dto, Question question) {
        boolean isCorrect = false;

        try {
            switch (question.getType()) {
                case SingleChoice:
                    List<Option> correctSingleOptions = optionRepository.findByQuestionIdAndIsCorrect(question.getId(), true);

                    // Check if the question has a single correct option set
                    if (dto.getSelectedOptionIds() != null && dto.getSelectedOptionIds().size() == 1 &&
                            correctSingleOptions.size() == 1) {
                        UUID userAnswerId = dto.getSelectedOptionIds().get(0);
                        UUID correctAnswerId = correctSingleOptions.get(0).getId();
                        System.out.println("  Comparing User(Single): " + userAnswerId + " with Correct: " + correctAnswerId); // Loguj porównywane ID
                        isCorrect = userAnswerId.equals(correctAnswerId);
                    } else {
                        isCorrect = false;
                    }
                    break;
                case MultipleChoice:
                    // Check if the question has multiple correct options set
                    List<UUID> correctMultipleOptionIds = optionRepository.findByQuestionIdAndIsCorrect(question.getId(), true)
                            .stream().map(Option::getId).toList();
                    List<UUID> userSelectedIds = dto.getSelectedOptionIds() != null ? dto.getSelectedOptionIds() : List.of();

                    isCorrect = userSelectedIds.size() == correctMultipleOptionIds.size() &&
                            correctMultipleOptionIds.containsAll(userSelectedIds) &&
                            userSelectedIds.containsAll(correctMultipleOptionIds);
                    break;
                case TextInput:
                    // Check if the question has a correct text answer set
                    String correctAnswerText = question.getCorrectTextAnswer();
                    String userAnswerText = dto.getTextAnswer();
                    isCorrect = userAnswerText != null && correctAnswerText != null &&
                            userAnswerText.trim().equalsIgnoreCase(correctAnswerText.trim());
                    break;
                case Matching:
                    // Check if the question has matching pairs
                    List<MatchingPair> correctPairs = matchingPairRepository.findByQuestionId(question.getId());
                    List<MatchingAnswerDto> userMatchingAnswers = dto.getMatchingAnswers();

                    if (userMatchingAnswers != null && userMatchingAnswers.size() == correctPairs.size()) {
                        isCorrect = userMatchingAnswers.stream().allMatch(ma ->
                                correctPairs.stream().anyMatch(p ->
                                        p.getId().equals(ma.getPairId()) &&
                                                p.getRightSide() != null &&
                                                p.getRightSide().equals(ma.getSelectedRightSide())
                                )
                        );
                    } else {
                        isCorrect = false;
                    }
                    break;
                default:
                    isCorrect = false;
                    break;
            }
        } catch (Exception e) {
            e.printStackTrace();
            isCorrect = false;
        }

        return isCorrect;
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

    private void saveOptionsAndPairsFromDto(QuestionEditDto qDto, Question question) {
        // Handle Options
        if (!CollectionUtils.isEmpty(qDto.getOptions())) {
            // Fetch existing options for the question
            List<Option> existingOptions = optionRepository.findByQuestionId(question.getId());
            Map<UUID, Option> existingOptionsMap = existingOptions.stream()
                    .collect(Collectors.toMap(Option::getId, Function.identity()));

            // Track which options are processed to identify ones to delete
            Set<UUID> processedOptionIds = new HashSet<>();

            // Process each option from DTO
            for (OptionEditDto oDto : qDto.getOptions()) {
                Option option;
                if (oDto.getId() != null && existingOptionsMap.containsKey(oDto.getId())) {
                    // Update existing option
                    option = existingOptionsMap.get(oDto.getId());
                    option.setOptionText(oDto.getOptionText());
                    option.setCorrect(oDto.getIsCorrect());
                    processedOptionIds.add(oDto.getId());
                } else {
                    // Create new option
                    option = optionMapper.toEntity(oDto, question);
                }
                optionRepository.save(option);
            }

            // Delete options that were not included in the DTO
            List<UUID> optionsToDelete = existingOptionsMap.keySet().stream()
                    .filter(id -> !processedOptionIds.contains(id))
                    .toList();
            if (!optionsToDelete.isEmpty()) {
                optionRepository.deleteAllById(optionsToDelete);
            }
        } else {
            // If no options in DTO, delete all existing options
            optionRepository.deleteByQuestionId(question.getId());
        }

        // Handle Matching Pairs (unchanged, assuming no issues with pairs)
        if (!CollectionUtils.isEmpty(qDto.getMatchingPairs())) {
            qDto.getMatchingPairs().forEach(mpDto -> {
                MatchingPair matchingPair = matchingPairMapper.toEntity(mpDto, question);
                matchingPairRepository.save(matchingPair);
            });
        }
    }

    private <Q extends QuestionData> void validateQuestions(List<Q> questions) {
        if (CollectionUtils.isEmpty(questions)) {
            throw new IllegalArgumentException("Survey must contain at least one question.");
        }

        for (int i = 0; i < questions.size(); i++) {
            Q qDto = questions.get(i);
            int questionNumber = i + 1;

            if (qDto == null) throw new IllegalArgumentException("Question data cannot be null (at index " + i + ").");
            if (!StringUtils.hasText(qDto.getQuestionText())) throw new IllegalArgumentException("Question text cannot be empty (for question #" + questionNumber + ").");
            if (qDto.getType() == null) throw new IllegalArgumentException("Question type must be specified (for question #" + questionNumber + ").");

            switch (qDto.getType()) {
                case SingleChoice: case MultipleChoice:
                    List<? extends OptionData> options = qDto.getOptions();
                    if (CollectionUtils.isEmpty(options)) throw new IllegalArgumentException("Choice question #" + questionNumber + " must have at least one option.");
                    if (options.stream().noneMatch(opt -> opt != null && opt.getIsCorrect() != null && opt.getIsCorrect())) throw new IllegalArgumentException("Choice question #" + questionNumber + " must have at least one correct option marked.");
                    if (options.stream().anyMatch(opt -> opt == null || !StringUtils.hasText(opt.getOptionText()))) throw new IllegalArgumentException("All options for question #" + questionNumber + " must have text.");
                    break;
                case TextInput:
                    if (!StringUtils.hasText(qDto.getCorrectTextAnswer())) throw new IllegalArgumentException("Text input question #" + questionNumber + " must have a correct answer defined.");
                    break;
                case Matching:
                    List<? extends MatchingPairData> pairs = qDto.getMatchingPairs();
                    if (CollectionUtils.isEmpty(pairs)) throw new IllegalArgumentException("Matching question #" + questionNumber + " must have at least one pair.");
                    if (pairs.stream().anyMatch(p -> p == null || !StringUtils.hasText(p.getLeftSide()) || !StringUtils.hasText(p.getRightSide()))) throw new IllegalArgumentException("All matching pairs for question #" + questionNumber + " must have both left and right sides defined.");
                    break;
            }
        }
    }

}