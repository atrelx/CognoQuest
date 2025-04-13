package org.example.cognoquest.survey;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SurveyRepository extends JpaRepository<Survey, UUID> {
    List<Survey> findByCreatedById(UUID createdBy);

    @Query("SELECT s FROM Survey s LEFT JOIN FETCH s.createdBy WHERE " +
            "(:titleQuery IS NULL OR LOWER(CAST(s.title AS string)) LIKE LOWER(CONCAT('%', :titleQuery, '%')))")
    Page<Survey> findByTitleContainingIgnoreCaseWithCreator(
            @Param("titleQuery") String titleQuery,
            Pageable pageable
    );

    @Query("SELECT s FROM Survey s LEFT JOIN FETCH s.createdBy WHERE s.createdBy.id = :userId AND " +
            "(:titleQuery IS NULL OR LOWER(CAST(s.title AS string)) LIKE LOWER(CONCAT('%', :titleQuery, '%')))")
    Page<Survey> findByCreatedByIdAndTitleContainingIgnoreCaseWithCreator(
            @Param("userId") UUID userId,
            @Param("titleQuery") String titleQuery,
            Pageable pageable
    );
}


