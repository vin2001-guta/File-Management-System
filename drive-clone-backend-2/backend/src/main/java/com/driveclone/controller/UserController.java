package com.driveclone.controller;

import com.driveclone.dto.DTOs.*;
import com.driveclone.model.Activity;
import com.driveclone.model.User;
import com.driveclone.repository.ActivityRepository;
import com.driveclone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(UserDTO.from(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateProfile(
            @RequestBody UserDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        userRepository.save(user);
        return ResponseEntity.ok(UserDTO.from(user));
    }

    @GetMapping("/activity")
    public ResponseEntity<List<Activity>> getActivity(
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(activityRepository.findByUserOrderByCreatedAtDesc(user, PageRequest.of(0, limit)));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
