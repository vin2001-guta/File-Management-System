package com.driveclone.controller;

import com.driveclone.dto.DTOs.*;
import com.driveclone.model.User;
import com.driveclone.repository.UserRepository;
import com.driveclone.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<FileDTO> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.uploadFile(file, folderId, owner));
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long fileId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        User owner = getUser(userDetails);
        Resource resource = fileService.downloadFile(fileId, owner);
        String filename = URLEncoder.encode(resource.getFilename() != null ?
                resource.getFilename() : "download", StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + filename)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @GetMapping("/folder/{folderId}")
    public ResponseEntity<FolderContentsDTO> getFolderContents(
            @PathVariable(required = false) Long folderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.getFolderContents(folderId, owner));
    }

    @GetMapping("/root")
    public ResponseEntity<FolderContentsDTO> getRootContents(
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.getFolderContents(null, owner));
    }

    @GetMapping("/starred")
    public ResponseEntity<FolderContentsDTO> getStarredItems(
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.getStarredItems(owner));
    }

    @GetMapping("/trash")
    public ResponseEntity<FolderContentsDTO> getTrash(
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.getTrash(owner));
    }

    @GetMapping("/search")
    public ResponseEntity<SearchResultDTO> search(
            @RequestParam String q,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.search(q, owner));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<FileDTO>> getRecentFiles(
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.getRecentFiles(owner, limit));
    }

    @PutMapping("/{fileId}/rename")
    public ResponseEntity<FileDTO> renameFile(
            @PathVariable Long fileId,
            @RequestBody RenameRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.renameFile(fileId, request.getName(), owner));
    }

    @PutMapping("/{fileId}/move")
    public ResponseEntity<FileDTO> moveFile(
            @PathVariable Long fileId,
            @RequestBody MoveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.moveFile(fileId, request.getTargetFolderId(), owner));
    }

    @PutMapping("/{fileId}/star")
    public ResponseEntity<FileDTO> toggleStar(
            @PathVariable Long fileId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.toggleStarFile(fileId, owner));
    }

    @PutMapping("/{fileId}/trash")
    public ResponseEntity<FileDTO> trashFile(
            @PathVariable Long fileId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.trashFile(fileId, owner));
    }

    @PutMapping("/{fileId}/restore")
    public ResponseEntity<FileDTO> restoreFile(
            @PathVariable Long fileId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.restoreFile(fileId, owner));
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<ApiResponse> deleteFile(
            @PathVariable Long fileId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        User owner = getUser(userDetails);
        fileService.deleteFile(fileId, owner);
        return ResponseEntity.ok(ApiResponse.ok("File deleted permanently"));
    }

    @PostMapping("/{fileId}/share")
    public ResponseEntity<ShareDTO> shareFile(
            @PathVariable Long fileId,
            @RequestBody ShareRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.shareFile(fileId, request, owner));
    }

    @PostMapping("/{fileId}/share-link")
    public ResponseEntity<ApiResponse> generateShareLink(
            @PathVariable Long fileId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        String token = fileService.generateShareLink(fileId, owner);
        return ResponseEntity.ok(ApiResponse.ok("Share link generated", token));
    }

    @GetMapping("/storage")
    public ResponseEntity<StorageInfoDTO> getStorageInfo(
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = getUser(userDetails);
        return ResponseEntity.ok(fileService.getStorageInfo(owner));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
