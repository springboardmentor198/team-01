package com.realestate.duediligence.repository;

import java.util.List;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {

    List<Document> findByProperty_PropertyId(Integer propertyId);
    long countByProperty_PropertyId(Integer propertyId);
    List<Document> findAllByOrderByUploadedAtDesc(Pageable pageable);

}
