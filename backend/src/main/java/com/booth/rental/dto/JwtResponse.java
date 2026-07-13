package com.booth.rental.dto;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String username;
    private String role;
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String address;

    public JwtResponse(String token, String id, String username, String fullName, String role, String email, String phone, String address) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }
}
