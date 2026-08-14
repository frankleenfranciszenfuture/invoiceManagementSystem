package com.ims.utils.validation;



import com.ims.dtos.user.UserRequest;
import com.ims.entity.RoleEntity;
import com.ims.entity.UserEntity;
import com.ims.exception.ValidationException;
import com.ims.repository.RoleRepository;
import com.ims.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserValidation {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public void validateCreate(UserRequest request,
                               UserEntity currentUser) {

        validateName(request.getName());

        validateEmail(request.getEmail());

        validatePassword(request.getPassword());

        RoleEntity selectedRole = roleRepository.findById(request.getRoleId())
                .orElseThrow(() ->
                        new ValidationException("role not found."));

        //  validateRolePermission(currentUser, selectedRole);

        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ValidationException("Email already exists.");
        }


    }

    public void validateUpdate(Long id,
                               UserRequest request,
                               UserEntity currentUser) {

        validateName(request.getName());

        validateEmail(request.getEmail());

        RoleEntity selectedRole = roleRepository.findById(request.getRoleId())
                .orElseThrow(() ->
                        new ValidationException("role not found."));

        //   validateRolePermission(currentUser, selectedRole);


        if (userRepository.existsByEmailIgnoreCaseAndIdNot(
                request.getEmail(), id)) {

            throw new ValidationException("Email already exists.");
        }


    }

//    private void validateRolePermission(UserEntity currentUser,
//                                        RoleEntity selectedRole) {
//
//        String currentRole = currentUser.getRole().getRoleName();
//
//        String newRole = selectedRole.getRoleName();
//
//        if ("SUPER_ADMIN".equals(currentRole)) {
//
//            if (!"BRANCH_ADMIN".equals(newRole)) {
//
//                throw new ValidationException(
//                        "Super Admin can create only Branch Admin users.");
//            }
//
//            return;
//        }
//
//        if ("BRANCH_ADMIN".equals(currentRole)) {
//
//            if ("SUPER_ADMIN".equals(newRole)
//                    || "BRANCH_ADMIN".equals(newRole)) {
//
//                throw new ValidationException(
//                        "Branch Admin cannot create Super Admin or Branch Admin.");
//            }
//
//            return;
//        }
//
//        throw new ValidationException(
//                "You are not authorized to create users.");
//    }
//
//

    private void validateRolePermission(UserEntity currentUser,
                                        RoleEntity selectedRole) {

        String currentRole =
                currentUser.getRole().getRoleName();

        String newRole =
                selectedRole.getRoleName();

        if ("SUPER_ADMIN".equals(currentRole)) {

            if (!"BRANCH_ADMIN".equals(newRole)) {

                throw new ValidationException(
                        "Super Admin can create only Branch Admin users.");
            }

            return;
        }

        if ("BRANCH_ADMIN".equals(currentRole)) {

            if ("SUPER_ADMIN".equals(newRole)
                    || "BRANCH_ADMIN".equals(newRole)) {

                throw new ValidationException(
                        "Branch Admin cannot create Super Admin or Branch Admin.");
            }

            return;
        }

        throw new ValidationException(
                "You are not authorized.");
    }

    private void validateBranch(UserEntity currentUser,
                                Long branchId) {

        String currentRole =
                currentUser.getRole().getRoleName();

        if ("SUPER_ADMIN".equals(currentRole)) {

            if (branchId == null) {
                throw new ValidationException(
                        "Branch is required.");
            }

        }
    }

    private void validateName(String name) {

        if (name == null || name.trim().isEmpty()) {
            throw new ValidationException("Name is required.");
        }

        if (name.length() < 3) {
            throw new ValidationException(
                    "Name must be at least 3 characters.");
        }
    }

    private void validateEmail(String email) {

        if (email == null || email.trim().isEmpty()) {
            throw new ValidationException("Email is required.");
        }

        if (!email.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

            throw new ValidationException(
                    "Invalid email format.");
        }
    }

    private void validatePassword(String password) {

        if (password == null || password.length() < 6) {

            throw new ValidationException(
                    "Password must be at least 6 characters.");
        }
    }
}
