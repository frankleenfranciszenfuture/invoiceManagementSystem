package com.ims.service.impl.fileStorage;


import com.ims.exception.FileStorageException;
import com.ims.service.serviceInterface.fileStorage.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${app.base-url}")
    private String baseUrl;

    @Override
    public String upload(MultipartFile file, String folder) {

        if (file == null || file.isEmpty()) {
            return null;
        }

        try {

            Path folderPath = Paths.get(uploadDir, folder);

            if (!Files.exists(folderPath)) {
                Files.createDirectories(folderPath);
            }

            String extension =
                    StringUtils.getFilenameExtension(
                            file.getOriginalFilename());

            String fileName =
                    UUID.randomUUID() + "." + extension;

            Path filePath =
                    folderPath.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return folder + "/" + fileName;

        } catch (IOException e) {

            throw new FileStorageException(
                    "Unable to upload image."
            );
        }
    }

    @Override
    public void delete(String filePath) {

        if (filePath == null || filePath.isBlank()) {
            return;
        }

        try {

            if (filePath.startsWith("http://")
                    || filePath.startsWith("https://")) {

                String prefix =
                        baseUrl + "/" + uploadDir + "/";

                if (filePath.startsWith(prefix)) {
                    filePath =
                            filePath.substring(prefix.length());
                }
            }

            Path path =
                    Paths.get(uploadDir)
                            .resolve(filePath);

            Files.deleteIfExists(path);

        } catch (IOException e) {

            throw new FileStorageException(
                    "Unable to delete image."
            );
        }
    }

    @Override
    public String getFileUrl(String filePath) {

        if (filePath == null || filePath.isBlank()) {
            return null;
        }

        if (filePath.startsWith("http://")
                || filePath.startsWith("https://")) {
            return filePath;
        }

        return baseUrl + "/" + uploadDir + "/" + filePath;
    }
}