package com.booth.rental.controller;

import com.booth.rental.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class StatsController {
    private final StatsService service;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(service.getDashboardSummary());
    }

    @GetMapping("/revenue-chart")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getRevenueChart(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") int year) {
        return ResponseEntity.ok(service.getRevenueChart(year));
    }
}
