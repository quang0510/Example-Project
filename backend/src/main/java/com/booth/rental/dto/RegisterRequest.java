package com.booth.rental.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO cho API Đăng ký tài khoản.
 * Chỉ nhận các field an toàn. Role KHÔNG được phép truyền từ client
 * để tránh lỗ hổng mass-assignment (user tự set role = ADMIN).
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải từ 6 ký tự trở lên")
    private String password;

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @Email(message = "Email không hợp lệ")
    private String email;

    private String phone;
    private String address;
}
