package com.booth.rental.service;

import com.booth.rental.domain.SystemConfig;
import com.booth.rental.repository.SystemConfigRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemConfigService {

    private final SystemConfigRepository repository;
    private final AuditLogService auditLogService;

    @PostConstruct
    public void initDefaultConfigs() {
        if (!repository.existsById("PENALTY_RATE_PERCENT")) {
            repository.save(SystemConfig.builder().key("PENALTY_RATE_PERCENT").value("5").description("Tỷ lệ phạt trả chậm theo % giá trị hợp đồng").build());
        }
        if (!repository.existsById("AUTO_CANCEL_HOURS")) {
            repository.save(SystemConfig.builder().key("AUTO_CANCEL_HOURS").value("24").description("Thời gian tự hủy yêu cầu thuê chưa duyệt (giờ)").build());
        }
        if (!repository.existsById("VAT_TAX_PERCENT")) {
            repository.save(SystemConfig.builder().key("VAT_TAX_PERCENT").value("10").description("Thuế VAT (%)").build());
        }
        if (!repository.existsById("MAX_BOOKING_LIMIT")) {
            repository.save(SystemConfig.builder().key("MAX_BOOKING_LIMIT").value("3").description("Giới hạn số gian hàng tối đa một User được phép đặt").build());
        }
    }

    public List<SystemConfig> getAllConfigs() {
        return repository.findAll();
    }

    @Transactional
    public SystemConfig updateConfig(String key, String value, String description) {
        SystemConfig existing = repository.findById(key).orElse(new SystemConfig());
        String oldValue = existing.getValue();
        
        existing.setKey(key);
        existing.setValue(value);
        existing.setDescription(description);
        SystemConfig savedConfig = repository.save(existing);
        
        String logDetails = String.format("Cập nhật tham số [%s]: Giá trị %s -> %s", key, oldValue != null ? oldValue : "null", value);
        auditLogService.logAction("UPDATE", "SYSTEM_CONFIG", key, logDetails);
        
        return savedConfig;
    }
}
