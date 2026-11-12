
package com.ims.repository.notification;

import com.ims.entity.NotificationRecipientEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface NotificationRecipientRepository
        extends JpaRepository<NotificationRecipientEntity, Long>,
        JpaSpecificationExecutor<NotificationRecipientEntity> {

    // =========================================================
    // INBOX
    // =========================================================

    @Query(
            value = """
                    SELECT nr
                    FROM NotificationRecipientEntity nr
                    JOIN FETCH nr.notification n
                    WHERE nr.userId = :userId
                    AND nr.archived = false
                    AND n.active = true
                    ORDER BY nr.createdAt DESC, nr.id DESC
                    """,
            countQuery = """
                    SELECT COUNT(nr)
                    FROM NotificationRecipientEntity nr
                    JOIN nr.notification n
                    WHERE nr.userId = :userId
                    AND nr.archived = false
                    AND n.active = true
                    """
    )
    Page<NotificationRecipientEntity> findInboxByUserId(
            @Param("userId") Long userId,
            Pageable pageable
    );

    // =========================================================
    // ARCHIVED NOTIFICATIONS
    // =========================================================

    @Query(
            value = """
                    SELECT nr
                    FROM NotificationRecipientEntity nr
                    JOIN FETCH nr.notification n
                    WHERE nr.userId = :userId
                    AND nr.archived = true
                    AND n.active = true
                    ORDER BY nr.archivedAt DESC, nr.id DESC
                    """,
            countQuery = """
                    SELECT COUNT(nr)
                    FROM NotificationRecipientEntity nr
                    JOIN nr.notification n
                    WHERE nr.userId = :userId
                    AND nr.archived = true
                    AND n.active = true
                    """
    )
    Page<NotificationRecipientEntity> findArchivedByUserId(
            @Param("userId") Long userId,
            Pageable pageable
    );

    // =========================================================
    // FIND RECIPIENT NOTIFICATION
    // =========================================================

    @Query("""
            SELECT nr
            FROM NotificationRecipientEntity nr
            JOIN FETCH nr.notification n
            WHERE nr.id = :recipientId
            AND nr.userId = :userId
            AND n.active = true
            """)
    Optional<NotificationRecipientEntity> findRecipientNotification(
            @Param("recipientId") Long recipientId,
            @Param("userId") Long userId
    );

    // =========================================================
    // UNREAD COUNT
    // =========================================================

    long countByUserIdAndReadFalseAndArchivedFalse(Long userId);

    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Transactional
    @Query("""
            UPDATE NotificationRecipientEntity nr
            SET nr.read = true,
                nr.readAt = CURRENT_TIMESTAMP
            WHERE nr.id = :recipientId
            AND nr.userId = :userId
            AND nr.read = false
            AND nr.archived = false
            """)
    int markAsRead(
            @Param("recipientId") Long recipientId,
            @Param("userId") Long userId
    );

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Transactional
    @Query("""
            UPDATE NotificationRecipientEntity nr
            SET nr.read = true,
                nr.readAt = CURRENT_TIMESTAMP
            WHERE nr.userId = :userId
            AND nr.read = false
            AND nr.archived = false
            """)
    int markAllAsRead(
            @Param("userId") Long userId
    );

    // =========================================================
    // ARCHIVE
    // =========================================================

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Transactional
    @Query("""
            UPDATE NotificationRecipientEntity nr
            SET nr.archived = true,
                nr.archivedAt = CURRENT_TIMESTAMP
            WHERE nr.id = :recipientId
            AND nr.userId = :userId
            AND nr.archived = false
            """)
    int archiveNotification(
            @Param("recipientId") Long recipientId,
            @Param("userId") Long userId
    );

    // =========================================================
    // RESTORE
    // =========================================================

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Transactional
    @Query("""
            UPDATE NotificationRecipientEntity nr
            SET nr.archived = false,
                nr.archivedAt = null
            WHERE nr.id = :recipientId
            AND nr.userId = :userId
            AND nr.archived = true
            """)
    int restoreNotification(
            @Param("recipientId") Long recipientId,
            @Param("userId") Long userId
    );

    // =========================================================
    // DELETE USER'S NOTIFICATION
    // =========================================================

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Transactional
    @Query("""
            DELETE FROM NotificationRecipientEntity nr
            WHERE nr.id = :recipientId
            AND nr.userId = :userId
            """)
    int deleteRecipientNotification(
            @Param("recipientId") Long recipientId,
            @Param("userId") Long userId
    );
}
//package com.ims.repository.notification;
//
//import com.ims.entity.NotificationRecipientEntity;
//
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Modifying;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//
//import org.springframework.stereotype.Repository;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.Optional;
//
//@Repository
//public interface NotificationRecipientRepository
//        extends JpaRepository<NotificationRecipientEntity, Long> {
//
//    // =========================================================
//    // INBOX
//    // =========================================================
//
//    @Query(
//            value = """
//                    SELECT nr
//                    FROM NotificationRecipientEntity nr
//                    JOIN FETCH nr.notification n
//                    WHERE nr.userId = :userId
//                    AND nr.archived = false
//                    AND n.active = true
//                    ORDER BY nr.createdAt DESC, nr.id DESC
//                    """,
//            countQuery = """
//                    SELECT COUNT(nr)
//                    FROM NotificationRecipientEntity nr
//                    JOIN nr.notification n
//                    WHERE nr.userId = :userId
//                    AND nr.archived = false
//                    AND n.active = true
//                    """
//    )
//    Page<NotificationRecipientEntity> findInboxByUserId(
//            @Param("userId") Long userId,
//            Pageable pageable
//    );
//
//
//    // =========================================================
//    // ARCHIVED NOTIFICATIONS
//    // =========================================================
//
//    @Query(
//            value = """
//                    SELECT nr
//                    FROM NotificationRecipientEntity nr
//                    JOIN FETCH nr.notification n
//                    WHERE nr.userId = :userId
//                    AND nr.archived = true
//                    AND n.active = true
//                    ORDER BY nr.archivedAt DESC, nr.id DESC
//                    """,
//            countQuery = """
//                    SELECT COUNT(nr)
//                    FROM NotificationRecipientEntity nr
//                    JOIN nr.notification n
//                    WHERE nr.userId = :userId
//                    AND nr.archived = true
//                    AND n.active = true
//                    """
//    )
//    Page<NotificationRecipientEntity> findArchivedByUserId(
//            @Param("userId") Long userId,
//            Pageable pageable
//    );
//
//
//    // =========================================================
//    // FIND RECIPIENT NOTIFICATION
//    // =========================================================
//
//    @Query("""
//            SELECT nr
//            FROM NotificationRecipientEntity nr
//            JOIN FETCH nr.notification n
//            WHERE nr.id = :recipientId
//            AND nr.userId = :userId
//            AND n.active = true
//            """)
//    Optional<NotificationRecipientEntity> findRecipientNotification(
//            @Param("recipientId") Long recipientId,
//            @Param("userId") Long userId
//    );
//
//
//    // =========================================================
//    // UNREAD COUNT
//    // =========================================================
//
//    long countByUserIdAndReadFalseAndArchivedFalse(Long userId);
//
//
//    // =========================================================
//    // MARK ONE AS READ
//    // =========================================================
//
//    @Modifying(
//            clearAutomatically = true,
//            flushAutomatically = true
//    )
//    @Transactional
//    @Query("""
//            UPDATE NotificationRecipientEntity nr
//            SET nr.read = true,
//                nr.readAt = CURRENT_TIMESTAMP
//            WHERE nr.id = :recipientId
//            AND nr.userId = :userId
//            AND nr.read = false
//            AND nr.archived = false
//            """)
//    int markAsRead(
//            @Param("recipientId") Long recipientId,
//            @Param("userId") Long userId
//    );
//
//
//    // =========================================================
//    // MARK ALL AS READ
//    // =========================================================
//
//    @Modifying(
//            clearAutomatically = true,
//            flushAutomatically = true
//    )
//    @Transactional
//    @Query("""
//            UPDATE NotificationRecipientEntity nr
//            SET nr.read = true,
//                nr.readAt = CURRENT_TIMESTAMP
//            WHERE nr.userId = :userId
//            AND nr.read = false
//            AND nr.archived = false
//            """)
//    int markAllAsRead(
//            @Param("userId") Long userId
//    );
//
//
//    // =========================================================
//    // ARCHIVE
//    // =========================================================
//
//    @Modifying(
//            clearAutomatically = true,
//            flushAutomatically = true
//    )
//    @Transactional
//    @Query("""
//            UPDATE NotificationRecipientEntity nr
//            SET nr.archived = true,
//                nr.archivedAt = CURRENT_TIMESTAMP
//            WHERE nr.id = :recipientId
//            AND nr.userId = :userId
//            AND nr.archived = false
//            """)
//    int archiveNotification(
//            @Param("recipientId") Long recipientId,
//            @Param("userId") Long userId
//    );
//
//
//    // =========================================================
//    // RESTORE
//    // =========================================================
//
//    @Modifying(
//            clearAutomatically = true,
//            flushAutomatically = true
//    )
//    @Transactional
//    @Query("""
//            UPDATE NotificationRecipientEntity nr
//            SET nr.archived = false,
//                nr.archivedAt = null
//            WHERE nr.id = :recipientId
//            AND nr.userId = :userId
//            AND nr.archived = true
//            """)
//    int restoreNotification(
//            @Param("recipientId") Long recipientId,
//            @Param("userId") Long userId
//    );
//
//
//    // =========================================================
//    // DELETE USER'S NOTIFICATION
//    // =========================================================
//
//    @Modifying(
//            clearAutomatically = true,
//            flushAutomatically = true
//    )
//    @Transactional
//    @Query("""
//            DELETE FROM NotificationRecipientEntity nr
//            WHERE nr.id = :recipientId
//            AND nr.userId = :userId
//            """)
//    int deleteRecipientNotification(
//            @Param("recipientId") Long recipientId,
//            @Param("userId") Long userId
//    );
//}