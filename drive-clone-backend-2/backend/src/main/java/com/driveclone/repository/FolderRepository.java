package com.driveclone.repository;

import com.driveclone.model.Folder;
import com.driveclone.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {

    List<Folder> findByOwnerAndParentIsNullAndTrashedFalse(User owner);
    List<Folder> findByOwnerAndParent_IdAndTrashedFalse(User owner, Long parentId);
    List<Folder> findByOwnerAndStarredTrueAndTrashedFalse(User owner);
    List<Folder> findByOwnerAndTrashedTrue(User owner);

    @Query("SELECT f FROM Folder f WHERE f.owner = :owner AND LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) AND f.trashed = false")
    List<Folder> searchByName(@Param("owner") User owner, @Param("query") String query);

    boolean existsByNameAndParentAndOwnerAndTrashedFalse(String name, Folder parent, User owner);
    boolean existsByNameAndParentIsNullAndOwnerAndTrashedFalse(String name, User owner);
}
