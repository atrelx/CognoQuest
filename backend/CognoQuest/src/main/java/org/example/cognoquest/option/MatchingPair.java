package org.example.cognoquest.option;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cognoquest.answer.AnswerMatching;
import org.example.cognoquest.question.Question;
import org.hibernate.annotations.ColumnDefault;

import java.util.List;
import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "matching_pair")
public class MatchingPair {
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
    @Column(name = "left_side", nullable = false, length = Integer.MAX_VALUE)
    private String leftSide;

    @NotNull
    @Column(name = "right_side", nullable = false, length = Integer.MAX_VALUE)
    private String rightSide;

    @OneToMany(mappedBy = "pair", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<AnswerMatching> answers;
}