package com.example.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

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
            if (!"ok".equals(resultado.get("result"))) {
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar la imagen de Cloudinary: " + publicId, e);
        }
    }
}