package com.driveclone.controller;

import com.driveclone.dto.DTOs.*;
import com.driveclone.model.User;
import com.driveclone.repository.UserRepository;
import com.driveclone.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<FolderDTO> createFolder(
            @RequestBody CreateFolderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(folderService.createFolder(request, owner));
    }

    @PutMapping("/{folderId}/rename")
    public ResponseEntity<FolderDTO> renameFolder(
            @PathVariable Long folderId,
            @RequestBody RenameRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(folderService.renameFolder(folderId, request.getName(), owner));
    }

    @PutMapping("/{folderId}/move")
    public ResponseEntity<FolderDTO> moveFolder(
            @PathVariable Long folderId,
            @RequestBody MoveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(folderService.moveFolder(folderId, request.getTargetFolderId(), owner));
    }

    @PutMapping("/{folderId}/star")
    public ResponseEntity<FolderDTO> toggleStar(
            @PathVariable Long folderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(folderService.toggleStarFolder(folderId, owner));
    }

    @PutMapping("/{folderId}/trash")
    public ResponseEntity<FolderDTO> trashFolder(
            @PathVariable Long folderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(folderService.trashFolder(folderId, owner));
    }

    @PutMapping("/{folderId}/restore")
    public ResponseEntity<FolderDTO> restoreFolder(
            @PathVariable Long folderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(folderService.restoreFolder(folderId, owner));
    }

    @PutMapping("/{folderId}/color")
    public ResponseEntity<FolderDTO> updateColor(
            @PathVariable Long folderId,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(folderService.updateFolderColor(folderId, body.get("color"), owner));
    }

    @DeleteMapping("/{folderId}")
    public ResponseEntity<ApiResponse> deleteFolder(
            @PathVariable Long folderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        folderService.deleteFolder(folderId, owner);
        return ResponseEntity.ok(ApiResponse.ok("Folder deleted permanently"));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
