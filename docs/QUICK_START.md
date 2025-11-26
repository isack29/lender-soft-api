# 🚀 Inicio Rápido - Servicio de Hash

## ⚡ Configuración en 3 Pasos

### 1️⃣ Instalar Dependencias
```bash
pnpm install
```

### 2️⃣ Iniciar el Servidor
```bash
# Desarrollo
pnpm start:dev

# Producción
pnpm build
pnpm start:prod
```

### 3️⃣ Probar la API

#### Crear Usuario (Password se hashea automáticamente)
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "document": "12345678",
    "password": "SecurePass123!",
    "firstname": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "address": "123 Main St"
  }'
```

#### Login (Password se compara con el hash)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

## ✨ ¿Qué Está Implementado?

✅ **Hashing Automático** - Las contraseñas se hashean con bcrypt antes de guardar  
✅ **Login Seguro** - Comparación de contraseñas usando bcrypt.compare  
✅ **Sin Exposición** - Las contraseñas nunca aparecen en respuestas HTTP  
✅ **JWT Tokens** - Login devuelve un token de acceso  
✅ **Clean Architecture** - Código organizado y mantenible  
✅ **TypeScript Estricto** - Sin tipos 'any'  

## 🔐 Seguridad

- **Bcrypt** con 10 rounds de salt
- **Salt automático** único por contraseña
- **Hash asíncrono** no bloquea el servidor
- **Contraseñas ocultas** en todas las respuestas

## 📖 Documentación Completa

- 📘 [Guía Técnica Completa](./HASH_SERVICE.md)
- 📗 [Ejemplos Prácticos](./HASH_EXAMPLES.md)
- 📙 [Resumen de Implementación](./IMPLEMENTATION_SUMMARY.md)

## 🎯 Endpoints Disponibles

### Usuarios
- `POST /users` - Crear usuario (hashea password)
- `GET /users/:id` - Obtener usuario (sin password)
- `PATCH /users/:id` - Actualizar usuario (hashea password si se proporciona)
- `DELETE /users/:id` - Eliminar usuario (soft delete)

### Autenticación
- `POST /auth/login` - Login (devuelve token JWT)

## 🔧 Uso en Código

### Inyectar el Servicio
```typescript
import { IHashService } from '@/common/interfaces/hash-service.interface';

@Injectable()
export class MiServicio {
  constructor(
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async miMetodo() {
    // Hashear
    const hash = await this.hashService.hashPassword('miPassword');
    
    // Comparar
    const isValid = await this.hashService.comparePassword('miPassword', hash);
  }
}
```

## 🧪 Verificar Instalación

```bash
# Compilar
pnpm build

# Verificar errores
pnpm lint

# Formatear código
pnpm format
```

## ❓ Preguntas Frecuentes

### ¿Dónde se hashea la contraseña?
En `CreateUserUseCase` y `UpdateUserUseCase` antes de guardar en BD.

### ¿Puedo cambiar el algoritmo?
Sí, solo implementa `IHashService` con otro algoritmo (Argon2, scrypt, etc.)

### ¿Es seguro bcrypt?
Sí, bcrypt es el estándar de la industria y recomendado por OWASP.

### ¿Qué son los "salt rounds"?
Son iteraciones del algoritmo. 10 rounds = 2^10 = 1024 iteraciones.

### ¿Puedo aumentar la seguridad?
Sí, aumenta `saltRounds` en `BcryptService` (12 o 14 para mayor seguridad).

## 🐛 Troubleshooting

### Error: "Cannot find module 'bcrypt'"
```bash
pnpm install bcrypt @types/bcrypt
```

### Error: Contraseña no se hashea
Verifica que `HashModule` esté en `AppModule.imports`

### Error: Usuario no puede hacer login
Verifica que la contraseña se haya creado DESPUÉS de implementar el hash

## 🎉 ¡Listo!

Tu API ahora tiene hashing de contraseñas seguro y profesional. 

**Siguiente paso recomendado:** Implementar validación de contraseña fuerte en el DTO.

