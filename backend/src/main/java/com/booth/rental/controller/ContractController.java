package com.booth.rental.controller;

import com.booth.rental.dto.response.ContractResponse;
import com.booth.rental.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/contracts")
@RequiredArgsConstructor
public class ContractController {
    private final ContractService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<List<ContractResponse>> getAll(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(service.getAllContracts(status));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ContractResponse>> getMyContracts() {
        return ResponseEntity.ok(service.getMyContracts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getContractById(id));
    }

    @PostMapping("/from-request/{requestId}")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<ContractResponse> createFromRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> body) {
        BigDecimal totalAmount = body.containsKey("totalAmount") ? new BigDecimal(body.get("totalAmount").toString()) : BigDecimal.ZERO;
        BigDecimal deposit = body.containsKey("deposit") ? new BigDecimal(body.get("deposit").toString()) : BigDecimal.ZERO;
        return new ResponseEntity<>(service.createContractFromRequest(requestId, totalAmount, deposit), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<ContractResponse> updateDraft(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        BigDecimal totalAmount = body.containsKey("totalAmount") ? new BigDecimal(body.get("totalAmount").toString()) : null;
        BigDecimal deposit = body.containsKey("deposit") ? new BigDecimal(body.get("deposit").toString()) : null;
        String note = body.containsKey("note") ? body.get("note").toString() : null;
        return ResponseEntity.ok(service.updateDraftContract(id, totalAmount, deposit, note));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<ContractResponse> activate(@PathVariable String id) {
        return ResponseEntity.ok(service.activateContract(id));
    }

    @PutMapping("/{id}/terminate")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, String>> terminate(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        service.terminateContract(id, body != null ? body.get("note") : null);
        return ResponseEntity.ok(Map.of("message", "Da thanh ly hop dong"));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, String>> cancel(@PathVariable String id) {
        service.cancelContract(id);
        return ResponseEntity.ok(Map.of("message", "Da huy hop dong"));
    }

    @PostMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<ContractResponse> renew(@PathVariable String id, @RequestBody Map<String, Object> body) {
        LocalDate newEndDate = LocalDate.parse(body.get("newEndDate").toString());
        BigDecimal newPrice = body.containsKey("newPrice") ? new BigDecimal(body.get("newPrice").toString()) : null;
        String note = body.containsKey("note") ? body.get("note").toString() : null;
        return ResponseEntity.ok(service.renewContract(id, newEndDate, newPrice, note));
    }
}
