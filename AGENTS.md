# AGENTS.md

Monorepo de un e-commerce/gestión de inventario musical (vinilos, CDs, indumentaria). Backend API + frontend React proyectado como portfolio técnico.

## Estructura y stack

- `backend/` — Spring Boot 3.5.6, Java 21, Maven (`./mvnw`). Paquetes: `configuration`, `controller`, `dto`, `exception`, `model`, `repository`, `service`.
- `frontend/` — React 19 + Vite 8. Solo scaffold (sin router/estado/consumo de API aún).
- Todas las entidades usan `UUID` con `@GeneratedValue(strategy = GenerationType.UUID)`.

## Comandos

- Backend: `./mvnw spring-boot:run`, `./mvnw test`, `./mvnw clean package`. No hay lint/formatter configurado.
- Frontend: `npm install`, `npm run dev` (puerto 5173), `npm run lint`, `npm run build`.
- Requiere un PostgreSQL local corriendo (`inventario_musica`; credenciales hardcodeadas en `backend/src/main/resources/application.properties`). Sin migraciones (Flyway/Liquibase): `ddl-auto=update` crea/ajusta el esquema por Hibernate. El único test (`contextLoads`) arranca la app, así que falla sin DB.

## Convenciones obligatorias al escribir código

- Arquitectura estricta Controller → Service → Repository. Los DTOs son `record` con nombres en español (`NewProductoRequest`, `ProductoResumenResponse`, `ErrorResponse`). Los controladores no deben retornar ni recibir `@Entity`.
- Inyección por constructor con `private final`; prohibido `@Autowired` en atributos (no hay Lombok).
- `@Transactional` en todo método de Service que modifique datos. Nota: métodos existentes como `ProductoService.updateProducto`/`deleteProducto` o `CategoriaService.createCategoria`/`deleteCategoria` lo omiten — es un defecto conocido, no el patrón a imitar.
- Validar existencia con `.orElseThrow(() -> new RuntimeException("... en español"))` y verificar stock antes de persistir (un `EGRESO` no puede dejar stock negativo).
- Identificadores, métodos y comentarios en español formal; mensajes de error en español.

## Reglas de negocio y datos

- Borrado lógico: `@SQLDelete` + `@SQLRestriction("activo = true")` en `Producto` y `Categoria`. `Producto` además tiene `@Version` y su `@SQLDelete` incluye `AND version = ?`, por lo que un borrado sobre una versión obsoleta lanza excepción de concurrencia.
- `MovimientoStock` es un historial inmutable (tipos `INGRESO`, `EGRESO`, `AJUSTE`; `AJUSTE` sobrescribe el stock).
- Categorías jerárquicas: `ProductoRepository.findProductosPorRamaCategoria` usa un CTE recursivo nativo (`WITH RECURSIVE`).
- Errores: lanzar `RuntimeException` para reglas de negocio. `GlobalExceptionHandler` las devuelve como `ErrorResponse` (timestamp, status, title, message, path): `RuntimeException`→400, `DataIntegrityViolationException`→409, `MethodArgumentTypeMismatchException`→400, resto→500.

## Seguridad y gotchas

- JWT (`jjwt` 0.12.5). Única ruta pública: `POST /api/auth/login`; todo lo demás exige `Authorization: Bearer <token>`. CORS solo para `http://localhost:5173`.
- Estado actual (conocido, no corregir sin pedirlo): el secret JWT está hardcodeado en `JwtService`; las contraseñas se comparan en texto plano (sin BCrypt); `AuthController` y `UsuarioController` usan la entidad `Usuario` como request/response (viola la regla de "sin entidades en controladores"). `AuthController` responde `Map.of("token", ...)`.
- Imágenes: **no** hay dependencia Cloudinary ni subida multipart aún. `ImagenProductoController` recibe `@RequestBody ImagenRequest` (JSON) con `urlImagen`. El objetivo declarado del proyecto es Cloudinary (`cloudinary-http5`) + `multipart/form-data` con `@RequestPart`; si se implementa, hay que agregar la dependencia al `pom.xml`.