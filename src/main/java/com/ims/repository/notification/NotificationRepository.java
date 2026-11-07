package com.ims.repository.notification;

import com.ims.entity.NotificationEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface NotificationRepository
        extends JpaRepository<NotificationEntity, Long> {

    @EntityGraph(attributePaths = {"sender", "recipient"})
    Page<NotificationEntity>
    findByRecipient_IdAndActiveTrueOrderByCreatedAtDesc(
            Long recipientId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"sender", "recipient"})
    Optional<NotificationEntity>
    findByIdAndRecipient_IdAndActiveTrue(
            Long id,
            Long recipientId
    );

    long countByRecipient_IdAndActiveTrueAndIsReadFalse(Long recipientId);

    @Modifying
    @Query("""
        UPDATE NotificationEntity n
        SET n.isRead = true
        WHERE n.recipient.id = :recipientId
          AND n.active = true
          AND n.isRead = false
    """)
    int markAllAsRead(@Param("recipientId") Long recipientId);

    @Modifying
    @Query("""
        UPDATE NotificationEntity n
        SET n.isRead = true
        WHERE n.id = :notificationId
          AND n.recipient.id = :recipientId
          AND n.active = true
    """)
    int markAsRead(
            @Param("notificationId") Long notificationId,
            @Param("recipientId") Long recipientId
    );
}