package com.realestate.duediligence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.realestate.duediligence.entity.SupportTicket;

public interface SupportTicketRepository
        extends JpaRepository<SupportTicket, Long>,
                JpaSpecificationExecutor<SupportTicket> {
}