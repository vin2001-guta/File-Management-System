package com.driveclone.service;

import com.driveclone.dto.DTOs.*;
import com.driveclone.model.*;
import com.driveclone.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FileService {

    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final FileShareRepository fileShareRepository;

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    // ===== FILE UPLOAD =====
    public FileDTO uploadFile(MultipartFile file, Long folderId, User owner) throws IOException {
        // Validate storage
        validateStorageLimit(owner, file.getSize());

        // Create upload directory
        Path uploadPath = Paths.get(uploadDir, owner.getId().toString());
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(storedName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Get folder if provided
        Folder folder = null;
        if (folderId != null) {
            folder = folderRepository.findById(folderId)
                    .orElseThrow(() -> new RuntimeException("Folder not found"));
        }

        // Detect MIME type
        String mimeType = file.getContentType();
        if (mimeType == null) mimeType = "application/octet-stream";

        FileItem fileItem = FileItem.builder()
                .name(file.getOriginalFilename())
                .originalName(file.getOriginalFilename())
                .storedName(storedName)
                .mimeType(mimeType)
                .fileSize(file.getSize())
                .filePath(filePath.toString())
                .folder(folder)
                .owner(owner)
                .build();

        fileRepository.save(fileItem);

        // Update user storage
        owner.setStorageUsed(owner.getStorageUsed() + file.getSize());
        userRepository.save(owner);

        logActivity(owner, Activity.ActivityType.FILE_UPLOAD, "Uploaded file: " + file.getOriginalFilename(),
                fileItem.getId(), fileItem.getName(), null, null);

        return FileDTO.from(fileItem);
    }

    // ===== DOWNLOAD FILE =====
    @Transactional
    public Resource downloadFile(Long fileId, User owner) throws MalformedURLException {
        FileItem file = getFileById(fileId, owner);

        file.setDownloadCount(file.getDownloadCount() + 1);
        fileRepository.save(file);

        Path filePath = Paths.get(file.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("File not found or not readable");
        }

        logActivity(owner, Activity.ActivityType.FILE_DOWNLOAD, "Downloaded file: " + file.getName(),
                file.getId(), file.getName(), null, null);

        return resource;
    }

    // ===== GET FILES IN FOLDER =====
    public FolderContentsDTO getFolderContents(Long folderId, User owner) {
        List<Folder> folders;
        List<FileItem> files;
        FolderDTO currentFolderDTO = null;
        List<FolderDTO> breadcrumbs = new ArrayList<>();

        if (folderId == null) {
            // Root folder
            folders = folderRepository.findByOwnerAndParentIsNullAndTrashedFalse(owner);
            files = fileRepository.findByOwnerAndFolderIsNullAndTrashedFalse(owner);
        } else {
            Folder currentFolder = folderRepository.findById(folderId)
                    .orElseThrow(() -> new RuntimeException("Folder not found"));
            folders = folderRepository.findByOwnerAndParent_IdAndTrashedFalse(owner, folderId);
            files = fileRepository.findByOwnerAndFolder_IdAndTrashedFalse(owner, folderId);
            currentFolderDTO = FolderDTO.from(currentFolder);

            // Build breadcrumbs
            breadcrumbs = buildBreadcrumbs(currentFolder);
        }

        return FolderContentsDTO.builder()
                .currentFolder(currentFolderDTO)
                .folders(folders.stream().map(FolderDTO::from).collect(Collectors.toList()))
                .files(files.stream().map(FileDTO::from).collect(Collectors.toList()))
                .breadcrumbs(breadcrumbs)
                .build();
    }

    // ===== STARRED FILES =====
    public FolderContentsDTO getStarredItems(User owner) {
        List<Folder> folders = folderRepository.findByOwnerAndStarredTrueAndTrashedFalse(owner);
        List<FileItem> files = fileRepository.findByOwnerAndStarredTrueAndTrashedFalse(owner);

        return FolderContentsDTO.builder()
                .folders(folders.stream().map(FolderDTO::from).collect(Collectors.toList()))
                .files(files.stream().map(FileDTO::from).collect(Collectors.toList()))
                .breadcrumbs(new ArrayList<>())
                .build();
    }

    // ===== TRASH =====
    public FolderContentsDTO getTrash(User owner) {
        List<Folder> folders = folderRepository.findByOwnerAndTrashedTrue(owner);
        List<FileItem> files = fileRepository.findByOwnerAndTrashedTrue(owner);

        return FolderContentsDTO.builder()
                .folders(folders.stream().map(FolderDTO::from).collect(Collectors.toList()))
                .files(files.stream().map(FileDTO::from).collect(Collectors.toList()))
                .breadcrumbs(new ArrayList<>())
                .build();
    }

    // ===== SEARCH =====
    public SearchResultDTO search(String query, User owner) {
        List<FileItem> files = fileRepository.searchByName(owner, query);
        List<Folder> folders = folderRepository.searchByName(owner, query);

        return SearchResultDTO.builder()
                .files(files.stream().map(FileDTO::from).collect(Collectors.toList()))
                .folders(folders.stream().map(FolderDTO::from).collect(Collectors.toList()))
                .totalCount(files.size() + folders.size())
                .build();
    }

    // ===== RENAME FILE =====
    public FileDTO renameFile(Long fileId, String newName, User owner) {
        FileItem file = getFileById(fileId, owner);
        String oldName = file.getName();
        file.setName(newName);
        fileRepository.save(file);

        logActivity(owner, Activity.ActivityType.FILE_RENAME,
                "Renamed file from '" + oldName + "' to '" + newName + "'",
                file.getId(), newName, null, null);

        return FileDTO.from(file);
    }

    // ===== MOVE FILE =====
    public FileDTO moveFile(Long fileId, Long targetFolderId, User owner) {
        FileItem file = getFileById(fileId, owner);

        Folder targetFolder = null;
        if (targetFolderId != null) {
            targetFolder = folderRepository.findById(targetFolderId)
                    .orElseThrow(() -> new RuntimeException("Target folder not found"));
        }

        file.setFolder(targetFolder);
        fileRepository.save(file);

        logActivity(owner, Activity.ActivityType.FILE_MOVE,
                "Moved file: " + file.getName(),
                file.getId(), file.getName(), targetFolderId,
                targetFolder != null ? targetFolder.getName() : "Root");

        return FileDTO.from(file);
    }

    // ===== STAR FILE =====
    public FileDTO toggleStarFile(Long fileId, User owner) {
        FileItem file = getFileById(fileId, owner);
        file.setStarred(!file.isStarred());
        fileRepository.save(file);

        logActivity(owner, Activity.ActivityType.FILE_STAR,
                (file.isStarred() ? "Starred" : "Unstarred") + " file: " + file.getName(),
                file.getId(), file.getName(), null, null);

        return FileDTO.from(file);
    }

    // ===== TRASH/RESTORE FILE =====
    public FileDTO trashFile(Long fileId, User owner) {
        FileItem file = getFileById(fileId, owner);
        file.setTrashed(true);
        file.setTrashedAt(LocalDateTime.now());
        fileRepository.save(file);

        logActivity(owner, Activity.ActivityType.FILE_DELETE,
                "Moved to trash: " + file.getName(),
                file.getId(), file.getName(), null, null);

        return FileDTO.from(file);
    }

    public FileDTO restoreFile(Long fileId, User owner) {
        FileItem file = getFileById(fileId, owner);
        file.setTrashed(false);
        file.setTrashedAt(null);
        fileRepository.save(file);

        logActivity(owner, Activity.ActivityType.FILE_RESTORE,
                "Restored file: " + file.getName(),
                file.getId(), file.getName(), null, null);

        return FileDTO.from(file);
    }

    // ===== PERMANENT DELETE =====
    public void deleteFile(Long fileId, User owner) throws IOException {
        FileItem file = getFileById(fileId, owner);

        // Delete from disk
        Path filePath = Paths.get(file.getFilePath());
        Files.deleteIfExists(filePath);

        // Update storage usage
        owner.setStorageUsed(Math.max(0, owner.getStorageUsed() - file.getFileSize()));
        userRepository.save(owner);

        fileRepository.delete(file);
    }

    // ===== SHARE FILE =====
    public ShareDTO shareFile(Long fileId, ShareRequest request, User owner) {
        FileItem file = getFileById(fileId, owner);

        User sharedWith = userRepository.findByEmail(request.getEmail()).orElse(null);

        FileShare share = FileShare.builder()
                .file(file)
                .sharedWith(sharedWith)
                .sharedWithEmail(request.getEmail())
                .sharedBy(owner)
                .permission(request.getPermission())
                .build();

        fileShareRepository.save(share);

        file.setVisibility(FileItem.FileVisibility.SHARED);
        fileRepository.save(file);

        logActivity(owner, Activity.ActivityType.FILE_SHARE,
                "Shared file with " + request.getEmail(),
                file.getId(), file.getName(), null, null);

        return ShareDTO.from(share);
    }

    // ===== GET STORAGE INFO =====
    public StorageInfoDTO getStorageInfo(User owner) {
        Long used = fileRepository.sumFileSizeByOwner(owner);
        if (used == null) used = 0L;

        Long imageSize = sumByMimeType(owner, "image");
        Long videoSize = sumByMimeType(owner, "video");
        Long docSize = sumByMimeType(owner, "application");

        return StorageInfoDTO.builder()
                .storageUsed(used)
                .storageLimit(owner.getStorageLimit())
                .storageAvailable(owner.getStorageLimit() - used)
                .usagePercentage((double) used / owner.getStorageLimit() * 100)
                .imageSize(imageSize)
                .videoSize(videoSize)
                .documentSize(docSize)
                .otherSize(used - imageSize - videoSize - docSize)
                .build();
    }

    // ===== GENERATE SHARE LINK =====
    public String generateShareLink(Long fileId, User owner) {
        FileItem file = getFileById(fileId, owner);
        String token = UUID.randomUUID().toString();
        file.setShareToken(token);
        file.setVisibility(FileItem.FileVisibility.PUBLIC);
        fileRepository.save(file);
        return token;
    }

    // ===== RECENT FILES =====
    public List<FileDTO> getRecentFiles(User owner, int limit) {
        return fileRepository.findRecentByOwner(owner, PageRequest.of(0, limit))
                .stream()
                .map(FileDTO::from)
                .collect(Collectors.toList());
    }

    // ===== HELPERS =====
    private FileItem getFileById(Long fileId, User owner) {
        FileItem file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Access denied");
        }
        return file;
    }

    private void validateStorageLimit(User owner, long fileSize) {
        if (owner.getStorageUsed() + fileSize > owner.getStorageLimit()) {
            throw new RuntimeException("Storage limit exceeded");
        }
    }

    private Long sumByMimeType(User owner, String mimeType) {
        List<FileItem> files = fileRepository.findByOwnerAndMimeTypeContaining(owner, mimeType);
        return files.stream().mapToLong(FileItem::getFileSize).sum();
    }

    private List<FolderDTO> buildBreadcrumbs(Folder folder) {
        List<FolderDTO> breadcrumbs = new ArrayList<>();
        Folder current = folder;
        while (current != null) {
            breadcrumbs.add(0, FolderDTO.from(current));
            current = current.getParent();
        }
        return breadcrumbs;
    }

    private void logActivity(User user, Activity.ActivityType type, String description,
                              Long fileId, String fileName, Long folderId, String folderName) {
        Activity activity = Activity.builder()
                .user(user)
                .type(type)
                .description(description)
                .fileId(fileId)
                .fileName(fileName)
                .folderId(folderId)
                .folderName(folderName)
                .build();
        activityRepository.save(activity);
    }
}
