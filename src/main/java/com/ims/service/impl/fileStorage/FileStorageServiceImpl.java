
package com.ims.service.impl.fileStorage;

import com.ims.exception.FileStorageException;
import com.ims.service.serviceInterface.fileStorage.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
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

    /*
     * =========================================================
     * UPLOAD FILE
     * =========================================================
     */

    @Override
    public String upload(MultipartFile file, String folder) {

        if (file == null || file.isEmpty()) {
            return null;
        }

        try {

            Path folderPath = resolveSafePath(folder);

            Files.createDirectories(folderPath);

            String extension =
                    StringUtils.getFilenameExtension(
                            file.getOriginalFilename()
                    );

            String fileName = UUID.randomUUID().toString();

            if (extension != null && !extension.isBlank()) {
                fileName += "." + extension;
            }

            Path filePath = folderPath.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // Store only the relative path in the database.
            return folder.replace("\\", "/") + "/" + fileName;

        } catch (IOException e) {

            throw new FileStorageException(
                    "Unable to upload image."
            );
        }
    }

    /*
     * =========================================================
     * DELETE FILE
     * =========================================================
     */

    @Override
    public void delete(String filePath) {

        if (filePath == null || filePath.isBlank()) {
            return;
        }

        try {

            String relativePath = extractRelativePath(filePath);

            // External URLs are not files managed by this service.
            if (relativePath == null) {
                return;
            }

            Path path = resolveSafePath(relativePath);

            Files.deleteIfExists(path);

        } catch (IOException e) {

            throw new FileStorageException(
                    "Unable to delete image."
            );
        }
    }

    /*
     * =========================================================
     * GET PUBLIC FILE URL
     * =========================================================
     */

    @Override
    public String getFileUrl(String filePath) {

        if (filePath == null || filePath.isBlank()) {
            return null;
        }

        String relativePath = extractRelativePath(filePath);

        // Preserve external URLs.
        if (relativePath == null) {
            return filePath;
        }

        // Validate the relative path before exposing it.
        resolveSafePath(relativePath);

        String publicBaseUrl = baseUrl.replaceAll("/+$", "");

        return publicBaseUrl + "/uploads/" + relativePath;
    }

    /*
     * =========================================================
     * EXTRACT RELATIVE PATH
     * =========================================================
     *
     * Supports:
     *
     * products/image.png
     * /api/v1.0/uploads/products/image.png
     * https://ims.zenfuture.in/api/v1.0/uploads/products/image.png
     *
     * =========================================================
     */

    private String extractRelativePath(String filePath) {

        String value = filePath.trim();

        if (value.startsWith("http://")
                || value.startsWith("https://")) {

            URI uri = URI.create(value);

            String urlPath = uri.getPath();

            if (urlPath == null) {
                return null;
            }

            int uploadsIndex = urlPath.indexOf("/uploads/");

            if (uploadsIndex < 0) {
                return null;
            }

            value = urlPath.substring(
                    uploadsIndex + "/uploads/".length()
            );

        } else {

            int uploadsIndex = value.indexOf("/uploads/");

            if (uploadsIndex >= 0) {

                value = value.substring(
                        uploadsIndex + "/uploads/".length()
                );

            } else if (value.startsWith("uploads/")) {

                value = value.substring("uploads/".length());

            }
        }

        value = value.replace("\\", "/");

        while (value.startsWith("/")) {
            value = value.substring(1);
        }

        return value.isBlank() ? null : value;
    }

    /*
     * =========================================================
     * SAFE FILE PATH
     * =========================================================
     *
     * Prevents paths from escaping the upload directory.
     *
     * =========================================================
     */

    private Path resolveSafePath(String relativePath) {

        if (relativePath == null || relativePath.isBlank()) {

            throw new FileStorageException(
                    "Invalid file path."
            );
        }

        String cleanPath = relativePath
                .trim()
                .replace("\\", "/");

        Path relative = Paths.get(cleanPath).normalize();

        if (relative.isAbsolute() || relative.startsWith("..")) {

            throw new FileStorageException(
                    "Invalid file path."
            );
        }

        Path root = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        Path resolved = root.resolve(relative).normalize();

        if (!resolved.startsWith(root)) {

            throw new FileStorageException(
                    "Invalid file path."
            );
        }

        return resolved;
    }
}
