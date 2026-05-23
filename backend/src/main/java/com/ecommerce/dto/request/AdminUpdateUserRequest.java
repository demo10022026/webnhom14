package com.ecommerce.dto.request;

import com.ecommerce.entity.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateUserRequest {

    private String fullName;

    private String email;

    private String phoneNumber;

    private User.Role role;

    private User.AccountStatus accountStatus;
}
