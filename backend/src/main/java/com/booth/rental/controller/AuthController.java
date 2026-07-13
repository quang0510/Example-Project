package com.booth.rental.controller;

import com.booth.rental.domain.User;
import com.booth.rental.dto.JwtResponse;
import com.booth.rental.dto.LoginRequest;
import com.booth.rental.dto.RegisterRequest;
import com.booth.rental.dto.request.ForgotPasswordRequest;
import com.booth.rental.dto.request.ResetPasswordRequest;
import com.booth.rental.repository.UserRepository;
import com.booth.rental.security.JwtTokenProvider;
import com.booth.rental.service.EmailService;
import com.booth.rental.service.OtpService;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;

    // Tự động tạo tài khoản admin mặc định khi khởi động
    @PostConstruct
    public void initDefaultAdmin() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User user = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("123456"))
                    .fullName("Quản trị viên")
                    .email("admin@boothrental.com")
                    .role(User.Role.SYSTEM_ADMIN)
                    .build();
            userRepository.save(user);
        } else {
            // Fix existing admin user if name is corrupted
            User admin = userRepository.findByUsername("admin").get();
            admin.setFullName("Quản trị viên");
            userRepository.save(admin);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User userDetails = (User) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getFullName(),
                userDetails.getRole().name(),
                userDetails.getEmail(),
                userDetails.getPhone(),
                userDetails.getAddress()
        ));
    }

    /**
     * API Đăng ký — nhận RegisterRequest DTO thay vì User entity trực tiếp.
     * Role luôn được set là CUSTOMER, tránh mass-assignment.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tên đăng nhập đã tồn tại"));
        }

        String email = (request.getEmail() == null || request.getEmail().isBlank())
                ? request.getUsername() + "@boothrental.local"
                : request.getEmail();

        User newUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(email)
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(User.Role.CUSTOMER) // Luôn là CUSTOMER, không tin client
                .build();

        userRepository.save(newUser);
        return ResponseEntity.ok(Map.of("message", "Đăng ký thành công!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new com.booth.rental.exception.BusinessException("Không tìm thấy người dùng với email này", org.springframework.http.HttpStatus.NOT_FOUND));

        String otp = otpService.generateOtp(user.getEmail());
        emailService.sendOtpEmail(user.getEmail(), otp);

        return ResponseEntity.ok(Map.of("message", "Mã xác nhận đã được gửi đến email của bạn"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new com.booth.rental.exception.BusinessException("Không tìm thấy người dùng với email này", org.springframework.http.HttpStatus.NOT_FOUND));

        if (!otpService.verifyOtp(request.getEmail(), request.getOtp())) {
            throw new com.booth.rental.exception.BusinessException("Mã xác nhận không hợp lệ hoặc đã hết hạn", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công"));
    }
}
