package com.realestate.duediligence.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Provides a Spring-managed ObjectMapper bean.
 *
 * The report engine serializes LocalDateTime fields (e.g. RiskSummaryResponse,
 * DocumentResponse) so the JavaTimeModule must be registered. Exporting this as
 * a bean also lets the JSON mapper be injected anywhere it is needed.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}
