package com.realestate.duediligence.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.realestate.duediligence.entity.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationIdOrderBySentAtAsc(Long conversationId);

    @Modifying
    @Query("""
        update Message m
        set m.readAt = :now
        where m.conversationId = :conversationId
          and m.senderId <> :readerId
          and m.readAt is null
        """)
    void markReadForOthers(
            @Param("conversationId") Long conversationId,
            @Param("readerId") Long readerId,
            @Param("now") Instant now
    );
}