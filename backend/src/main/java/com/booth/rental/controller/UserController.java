package com.booth.rental.controller;

import com.booth.rental.domain.User;
import com.booth.rental.dto.response.UserResponse;
import com.booth.rental.exception.BusinessException;
import com.booth.rental.repository.UserRepository;
import com.booth.rental.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.booth.rental.dto.request.UpdateProfileRequest;
import com.booth.rental.dto.request.ChangePasswordRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers(@RequestParam(required = false) String role) {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .filter(u -> role == null || role.isBlank() || u.getRole().name().equals(role))
                .map(UserResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new BusinessException("Khong tim thay user", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new BusinessException("Khong tim thay user", HttpStatus.NOT_FOUND));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        return ResponseEntity.ok(UserResponse.from(userRepository.save(user)));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new BusinessException("Khong tim thay user", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException("Mật khẩu cũ không chính xác", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }

    @PostMapping("/create-manager")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<UserResponse> createManager(@RequestBody Map<String, String> body) {
        if (userRepository.findByUsername(body.get("username")).isPresent())
            throw new BusinessException("Ten dang nhap da ton tai", HttpStatus.BAD_REQUEST);

        User manager = User.builder()
                .username(body.get("username"))
                .password(passwordEncoder.encode(body.getOrDefault("password", "123456")))
                .fullName(body.get("fullName"))
                .email(body.getOrDefault("email", body.get("username") + "@booth.local"))
                .phone(body.get("phone"))
                .role(User.Role.MANAGER).build();

        User savedManager = userRepository.save(manager);
        auditLogService.logAction("CREATE", "USER", savedManager.getId(), "Tạo tài khoản Quản lý: " + savedManager.getUsername());

        return new ResponseEntity<>(UserResponse.from(savedManager), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, String>> deactivate(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay user", HttpStatus.NOT_FOUND));
        user.setActive(false);
        userRepository.save(user);
        auditLogService.logAction("UPDATE", "USER", user.getId(), "Khóa tài khoản: " + user.getUsername());
        return ResponseEntity.ok(Map.of("message", "Da khoa tai khoan"));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, String>> activate(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay user", HttpStatus.NOT_FOUND));
        user.setActive(true);
        user.setFailCount(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        auditLogService.logAction("UPDATE", "USER", user.getId(), "Mở khóa tài khoản: " + user.getUsername());
        return ResponseEntity.ok(Map.of("message", "Da mo khoa tai khoan"));
    }
}
