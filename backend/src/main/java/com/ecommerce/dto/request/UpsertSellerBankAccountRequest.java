package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpsertSellerBankAccountRequest {

    @NotBlank(message = "Tên ngân hàng không được để trống")
    @Size(max = 100, message = "Tên ngân hàng tối đa 100 ký tự")
    private String bankName;

    @NotBlank(message = "Mã ngân hàng không được để trống")
    @Size(max = 50, message = "Mã ngân hàng tối đa 50 ký tự")
    private String bankCode;

    @NotBlank(message = "BIN ngân hàng không được để trống")
    @Size(max = 20, message = "BIN ngân hàng tối đa 20 ký tự")
    private String bankBin;

    @Size(max = 500, message = "Logo ngân hàng tối đa 500 ký tự")
    private String bankLogo;

    @NotBlank(message = "Tên chủ tài khoản không được để trống")
    @Size(max = 100, message = "Tên chủ tài khoản tối đa 100 ký tự")
    private String accountHolder;

    @NotBlank(message = "Số tài khoản không được để trống")
    @Size(max = 50, message = "Số tài khoản tối đa 50 ký tự")
    private String accountNumber;
}
