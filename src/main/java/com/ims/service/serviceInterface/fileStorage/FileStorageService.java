package com.ims.service.serviceInterface.fileStorage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    String upload(MultipartFile file, String folder);

    void delete(String filePath);

    String getFileUrl(String filePath);
}