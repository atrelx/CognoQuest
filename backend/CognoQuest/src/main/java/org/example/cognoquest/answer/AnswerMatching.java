package org.example.cognoquest.answer;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cognoquest.question.MatchingPair;
import org.hibernate.annotations.ColumnDefault;

import java.util.UUID;

/**
 * For Matching questions
 */

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "answer_matching")
public class AnswerMatching {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @ColumnDefault("gen_random_uuid()")
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_id", nullable = false)
    private Answer answer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pair_id", nullable = false)
    private MatchingPair pair;

    @Column(name = "selected_right_side", length = Integer.MAX_VALUE)
    private String selectedRightSide; // Выбранный пользователем правый элемент
}