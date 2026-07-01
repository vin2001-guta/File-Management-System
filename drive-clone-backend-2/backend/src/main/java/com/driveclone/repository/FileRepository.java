package com.driveclone.repository;

import com.driveclone.model.FileItem;
import com.driveclone.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileItem, Long> {

    List<FileItem> findByOwnerAndFolderIsNullAndTrashedFalse(User owner);
    List<FileItem> findByOwnerAndFolder_IdAndTrashedFalse(User owner, Long folderId);
    List<FileItem> findByOwnerAndStarredTrueAndTrashedFalse(User owner);
    List<FileItem> findByOwnerAndTrashedTrue(User owner);

    @Query("SELECT f FROM FileItem f WHERE f.owner = :owner AND LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) AND f.trashed = false")
    List<FileItem> searchByName(@Param("owner") User owner, @Param("query") String query);

    @Query("SELECT f FROM FileItem f WHERE f.shareToken = :token AND f.trashed = false")
    Optional<FileItem> findByShareToken(@Param("token") String token);

    @Query("SELECT SUM(f.fileSize) FROM FileItem f WHERE f.owner = :owner AND f.trashed = false")
    Long sumFileSizeByOwner(@Param("owner") User owner);

    @Query("SELECT f FROM FileItem f WHERE f.owner = :owner AND f.mimeType LIKE :type AND f.trashed = false")
    List<FileItem> findByOwnerAndMimeTypeContaining(@Param("owner") User owner, @Param("type") String type);

    List<FileItem> findByOwnerOrderByCreatedAtDesc(User owner);

    @Query("SELECT f FROM FileItem f WHERE f.owner = :owner AND f.trashed = false ORDER BY f.updatedAt DESC")
    List<FileItem> findRecentByOwner(@Param("owner") User owner, org.springframework.data.domain.Pageable pageable);
}
