package com.booth.rental.service;

import com.booth.rental.domain.AuditLog;
import com.booth.rental.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void logAction(String action, String entityName, String entityId, String details) {
        try {
            String performedBy = "SYSTEM";
            if (SecurityContextHolder.getContext().getAuthentication() != null &&
                SecurityContextHolder.getContext().getAuthentication().getName() != null) {
                performedBy = SecurityContextHolder.getContext().getAuthentication().getName();
            }

            AuditLog logEntry = AuditLog.builder()
                    .action(action)
                    .entityName(entityName)
                    .entityId(entityId)
                    .details(details)
                    .performedBy(performedBy)
                    .createdAt(LocalDateTime.now())
                    .build();

            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
        }
    }
}
