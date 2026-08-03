package com.realestate.duediligence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.AgentFollow;

public interface AgentFollowRepository extends JpaRepository<AgentFollow, Long> {

    Optional<AgentFollow> findByUser_UserIdAndAgent_UserId(Integer userId, Integer agentId);

    List<AgentFollow> findByAgent_UserId(Integer agentId);
}
