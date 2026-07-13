package com.booth.rental.controller;

import com.booth.rental.dto.RentalRequestDto;
import com.booth.rental.dto.response.RentalRequestResponse;
import com.booth.rental.service.RentalRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rental-requests")
@RequiredArgsConstructor
public class RentalRequestController {
    private final RentalRequestService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<List<RentalRequestResponse>> getAll(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(service.getAllRequests(status));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<RentalRequestResponse>> getMyRequests() {
        return ResponseEntity.ok(service.getMyRequests());
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RentalRequestResponse> create(@Valid @RequestBody RentalRequestDto dto) {
        return new ResponseEntity<>(service.createBookingRequest(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<RentalRequestResponse> approve(@PathVariable String id) {
        return ResponseEntity.ok(service.approveRequest(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, String>> reject(@PathVariable String id, @RequestBody Map<String, String> body) {
        service.rejectRequest(id, body.getOrDefault("reason", ""));
        return ResponseEntity.ok(Map.of("message", "Da tu choi yeu cau"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> cancel(@PathVariable String id) {
        service.cancelRequest(id);
        return ResponseEntity.ok(Map.of("message", "Da huy yeu cau"));
    }
}
