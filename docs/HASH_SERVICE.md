# Servicio de Hash de Contraseñas

## Descripción

Este proyecto implementa un servicio de hashing de contraseñas usando **bcrypt**, siguiendo los principios de Clean Architecture y las mejores prácticas de seguridad.

## Arquitectura

### 1. **Interfaz de Dominio** (`IHashService`)
Ubicación: `src/common/interfaces/hash-service.interface.ts`

Define el contrato para el servicio de hashing, siguiendo el principio de inversión de dependencias (DIP):

```typescript
export interface IHashService {
  hashPassword(plainPassword: string): Promise<string>;
  comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
```

### 2. **Implementación con Bcrypt** (`BcryptService`)
Ubicación: `src/infraestructure/hash/bcrypt.service.ts`

Implementa la interfaz usando bcrypt con:
- **Salt rounds: 10** (estándar recomendado por OWASP)
- Métodos async para no bloquear el event loop

### 3. **Módulo Global** (`HashModule`)
Ubicación: `src/infraestructure/hash/hash.module.ts`

Registra el servicio como módulo global usando el decorador `@Global()`, permitiendo su uso en toda la aplicación sin necesidad de importarlo explícitamente.

## Integración

### En los Casos de Uso

#### CreateUserUseCase
Hashea la contraseña antes de crear el usuario:

```typescript
const hashedPassword = await this.hashService.hashPassword(createUserDto.password);
const newUser = await this.iUserRepository.createUser({
  ...createUserDto,
  password: hashedPassword,
});
```

#### UpdateUserUseCase
Hashea la contraseña solo si se está actualizando:

```typescript
if (updateUserDto.password) {
  const hashedPassword = await this.hashService.hashPassword(updateUserDto.password);
  dataToUpdate = { ...updateUserDto, password: hashedPassword };
}
```

#### LoginUseCase
Compara la contraseña proporcionada con el hash almacenado:

```typescript
const isPasswordValid = await this.hashService.comparePassword(
  loginDto.password,
  user.password,
);

if (!isPasswordValid) {
  throw new UnauthorizedException('Invalid credentials');
}
```

## Seguridad Implementada

### 1. **Bcrypt**
- Algoritmo de hashing adaptativo diseñado específicamente para contraseñas
- Incluye salt automático único para cada contraseña
- Resistente a ataques de rainbow tables y fuerza bruta

### 2. **Salt Rounds**
- Configurado en 10 rondas (2^10 = 1024 iteraciones)
- Balance óptimo entre seguridad y rendimiento
- Puede ajustarse según necesidades específicas

### 3. **Contraseñas No Expuestas en Respuestas**
Se implementó `UserResponse` que omite el campo password:

```typescript
export type UserResponse = Omit<User, 'password'>;
```

Función helper `toUserResponse()` para transformar usuarios antes de devolverlos.

### 4. **Mensajes de Error Genéricos**
En el login se usan mensajes genéricos ("Invalid credentials") en lugar de especificar si el email o la contraseña son incorrectos, previniendo enumeración de usuarios.

## Respuestas HTTP Consistentes

Todas las respuestas siguen la estructura `ApiResponse`:

```typescript
interface ApiResponse<T> {
  success: boolean;
  info: string;
  data: T;
}
```

Ejemplo de respuesta de login:
```json
{
  "success": true,
  "info": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "firstname": "John",
      "lastname": "Doe",
      "phone": "+1234567890",
      "address": "123 Main St",
      "role": "LENDER"
    }
  }
}
```

## Endpoints

### Crear Usuario
```http
POST /users
Content-Type: application/json

{
  "username": "john_doe",
  "document": "12345678",
  "password": "SecurePassword123!",
  "firstname": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "address": "123 Main St"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

### Actualizar Contraseña
```http
PATCH /users/:userId
Content-Type: application/json

{
  "password": "NewSecurePassword456!"
}
```

## Mejores Prácticas Implementadas

### 1. **Clean Architecture**
- ✅ Separación clara entre capas
- ✅ Inversión de dependencias con interfaces
- ✅ Casos de uso independientes de frameworks

### 2. **Seguridad**
- ✅ Hashing con bcrypt (salt automático)
- ✅ Contraseñas nunca expuestas en respuestas
- ✅ Validación de contraseñas en login sin revelar información
- ✅ Tipado estricto (sin 'any')

### 3. **Código Limpio**
- ✅ Nombres descriptivos y semánticos
- ✅ Comentarios JSDoc en interfaces y métodos
- ✅ Manejo consistente de errores
- ✅ Principio de responsabilidad única

### 4. **TypeScript**
- ✅ Tipado estricto en todos los archivos
- ✅ Interfaces bien definidas
- ✅ Tipos genéricos para respuestas

## Consideraciones de Rendimiento

### Bcrypt es Costoso
Bcrypt está diseñado para ser computacionalmente costoso para prevenir ataques de fuerza bruta. Esto es intencional y deseable.

**Tiempos aproximados:**
- Hash: ~50-100ms
- Compare: ~50-100ms

Para aplicaciones de alto tráfico, considera:
- Usar un sistema de caché para tokens JWT
- Implementar rate limiting en el endpoint de login
- Monitorear el uso de CPU

### Aumentar Seguridad
Para aumentar la seguridad, puedes incrementar el número de salt rounds en `bcrypt.service.ts`:

```typescript
private readonly saltRounds = 12; // Más seguro, pero más lento
```

**Recomendaciones según uso:**
- 10 rounds: Uso general (recomendado)
- 12 rounds: Alta seguridad
- 14+ rounds: Máxima seguridad (puede impactar rendimiento)

## Testing

### Ejemplo de Test para el Servicio
```typescript
describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(() => {
    service = new BcryptService();
  });

  it('should hash a password', async () => {
    const password = 'TestPassword123!';
    const hash = await service.hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
  });

  it('should compare passwords correctly', async () => {
    const password = 'TestPassword123!';
    const hash = await service.hashPassword(password);
    
    const isValid = await service.comparePassword(password, hash);
    expect(isValid).toBe(true);
    
    const isInvalid = await service.comparePassword('WrongPassword', hash);
    expect(isInvalid).toBe(false);
  });
});
```

## Migración de Datos Existentes

Si tienes usuarios con contraseñas sin hashear:

### Opción 1: Migración Forzada
```typescript
// Script de migración
const users = await userRepository.findAll();
for (const user of users) {
  const hashedPassword = await hashService.hashPassword(user.password);
  await userRepository.update(user.id, { password: hashedPassword });
}
```

### Opción 2: Migración Gradual
```typescript
// En el login
if (!user.password.startsWith('$2')) { // bcrypt hashes empiezan con $2
  const hashedPassword = await hashService.hashPassword(user.password);
  await userRepository.update(user.id, { password: hashedPassword });
}
```

## Troubleshooting

### Error: "Cannot find module 'bcrypt'"
```bash
pnpm install bcrypt @types/bcrypt
```

### Error: "Module did not self-register"
Esto suele ocurrir después de actualizar Node.js. Reconstruye bcrypt:
```bash
pnpm rebuild bcrypt
```

### Passwords no se hashean
Verifica que:
1. `HashModule` esté importado en `AppModule`
2. El servicio esté inyectado correctamente con `@Inject('IHashService')`
3. No haya errores en la consola

## Referencias

- [Bcrypt NPM](https://www.npmjs.com/package/bcrypt)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/encryption-and-hashing)

