package com.booth.rental.controller;

import com.booth.rental.domain.Booth;
import com.booth.rental.dto.BoothDto;
import com.booth.rental.dto.response.BoothResponse;
import com.booth.rental.service.BoothService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/booths")
@RequiredArgsConstructor
public class BoothController {
    private final BoothService boothService;

    @GetMapping
    public ResponseEntity<List<BoothResponse>> getAllBooths(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String zone,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(boothService.getAllBooths(status, zone, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoothResponse> getBoothById(@PathVariable String id) {
        return ResponseEntity.ok(boothService.getBoothById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<BoothResponse> createBooth(@Valid @RequestBody BoothDto dto) {
        return new ResponseEntity<>(boothService.createBooth(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<BoothResponse> updateBooth(@PathVariable String id, @Valid @RequestBody BoothDto dto) {
        return ResponseEntity.ok(boothService.updateBooth(id, dto));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, String>> changeStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        Booth.BoothStatus newStatus = Booth.BoothStatus.valueOf(body.get("status"));
        boothService.changeBoothStatus(id, newStatus);
        return ResponseEntity.ok(Map.of("message", "Cap nhat trang thai thanh cong"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteBooth(@PathVariable String id) {
        boothService.deleteBooth(id);
        return ResponseEntity.ok(Map.of("message", "Xoa gian hang thanh cong"));
    }
}
