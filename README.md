#Se crea este proyecto para gestión de libreria, basada en atender docentes, alumnos y además todo lo relacionado con venta de productor de libreria.

## Despliegue a producción

Activar el perfil `prod` (`SPRING_PROFILES_ACTIVE=prod`) y definir la variable `JWT_SECRET` con un valor propio y secreto — sin el perfil `prod`, el backend arranca igual pero con la variable seteada; con el perfil activo y `JWT_SECRET` sin definir, el arranque falla en vez de usar el secreto de desarrollo por defecto.

Definir también `APP_CORS_ALLOWED_ORIGINS` con la URL real del frontend en producción (por defecto solo permite `http://localhost:5173` y `http://localhost:5175`, los puertos de desarrollo).
