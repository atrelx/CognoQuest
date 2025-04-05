package org.example.cognoquest.question;

import com.fasterxml.jackson.annotation.JsonValue;

public enum QuestionType {
    SingleChoice,
    MultipleChoice,
    Matching,
    TextInput;

    @JsonValue
    public String getValue() {
        return name();
    }
}