package com.booth.rental.dto.response;

import com.booth.rental.domain.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private String id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String role;
    private Boolean active;
    private String avatarUrl;
    private LocalDateTime createdAt;

    public static UserResponse from(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .address(u.getAddress())
                .role(u.getRole().name())
                .active(u.getActive())
                .avatarUrl(u.getAvatarUrl())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
