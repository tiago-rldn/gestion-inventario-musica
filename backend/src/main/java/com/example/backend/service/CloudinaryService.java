package com.example.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map subirImagen(MultipartFile file, String carpeta) {
        try {
            Map params = ObjectUtils.asMap(
                    "folder", carpeta,
                    "use_filename", true,
                    "unique_filename", true,
                    "resource_type", "image"
            );
            return cloudinary.uploader().upload(file.getBytes(), params);
        } catch (IOException e) {
            throw new RuntimeException("Error al subir la imagen a Cloudinary", e);
        }
    }

    public void eliminarImagen(String publicId) {
        try {
            Map resultado = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String result = (String) resultado.get("result");
            if (!"ok".equals(result)) {
                log.warn("Cloudinary destroy no retornó 'ok' para publicId={}: result={}", publicId, result);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar la imagen de Cloudinary: " + publicId, e);
        }
    }
}