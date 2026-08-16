package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.TicketMessage;

public interface TicketMessageRepository
        extends JpaRepository<TicketMessage, Long> {

    List<TicketMessage> findByTicketTicketIdOrderByCreatedAtAsc(Long ticketId);
}