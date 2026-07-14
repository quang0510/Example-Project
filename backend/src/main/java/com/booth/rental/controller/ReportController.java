package com.booth.rental.controller;

import com.booth.rental.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * Xuất báo cáo tài chính dạng Excel (.xlsx).
     * GET /api/v1/reports/financial-export?year=2026&month=7
     */
    @GetMapping("/financial-export")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<byte[]> exportFinancialReport(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") int year,
            @RequestParam(required = false) Integer month) throws IOException {

        byte[] excelData = reportService.generateFinancialReport(year, month);

        String filename = month != null
                ? "BaoCaoTaiChinh_" + month + "_" + year + ".xlsx"
                : "BaoCaoTaiChinh_" + year + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelData);
    }
}
