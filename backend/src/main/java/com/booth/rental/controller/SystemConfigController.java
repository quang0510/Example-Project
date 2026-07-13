package com.booth.rental.controller;

import com.booth.rental.domain.SystemConfig;
import com.booth.rental.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/configs")
@RequiredArgsConstructor
public class SystemConfigController {
    private final SystemConfigService service;

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<SystemConfig>> getAll() {
        return ResponseEntity.ok(service.getAllConfigs());
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SystemConfig> updateConfig(@PathVariable String key, @RequestBody SystemConfig config) {
        return ResponseEntity.ok(service.updateConfig(key, config.getValue(), config.getDescription()));
    }
}
