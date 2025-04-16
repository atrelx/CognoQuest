package org.example.cognoquest.question.dto;

import org.example.cognoquest.option.dto.MatchingPairData;
import org.example.cognoquest.option.dto.OptionData;
import org.example.cognoquest.question.QuestionType;

import java.util.List;

public interface QuestionData {
    String getQuestionText();
    QuestionType getType();
    String getCorrectTextAnswer();
    List<? extends OptionData> getOptions();
    List<? extends MatchingPairData> getMatchingPairs();
}
