package org.example.cognoquest.option;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cognoquest.answer.Answer;
import org.example.cognoquest.answer.AnswerOption;
import org.example.cognoquest.question.Question;
import org.hibernate.annotations.ColumnDefault;

import java.util.List;
import java.util.UUID;

/*
    For SingleOption, MultipleOption
 */

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "option")
public class Option {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @ColumnDefault("gen_random_uuid()")
    @Column(name = "id", nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @NotNull
    @Column(name = "option_text", nullable = false, length = Integer.MAX_VALUE)
    private String optionText;

    @NotNull
    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect = false;

    @OneToMany(mappedBy = "option", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<AnswerOption> answerOptions;
}