package com.example.backend.dto;

import java.util.UUID;

import com.example.backend.model.TipoMovimiento;

public class MovimientoRequest {
    private TipoMovimiento tipo;
    private int cantidad;
    private String observaciones;
    private UUID usuarioId;

    public TipoMovimiento getTipo() {
        return tipo;
    }
    public void setTipo(TipoMovimiento tipo) {
        this.tipo = tipo;
    }
    public int getCantidad() {
        return cantidad;
    }
    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }
    public String getObservaciones() {
        return observaciones;
    }
    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
    public UUID getUsuarioId() {
        return usuarioId;
    }
    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }
}
