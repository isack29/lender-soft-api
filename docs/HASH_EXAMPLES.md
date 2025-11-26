# Ejemplos Prácticos - Servicio de Hash

## Ejemplo 1: Registro de Usuario con Postman/cURL

### Request
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maria_garcia",
    "document": "87654321",
    "password": "MiPassword123!",
    "firstname": "María",
    "lastName": "García",
    "phone": "+34612345678",
    "email": "maria.garcia@example.com",
    "address": "Calle Principal 123, Madrid"
  }'
```

### Response
```json
{
  "success": true,
  "info": "User created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "maria_garcia",
    "document": "87654321",
    "firstname": "María",
    "lastname": "García",
    "phone": "+34612345678",
    "email": "maria.garcia@example.com",
    "address": "Calle Principal 123, Madrid",
    "role": "LENDER",
    "deleted": false,
    "createdAt": "2025-10-12T10:30:00.000Z",
    "updatedAt": "2025-10-12T10:30:00.000Z"
  }
}
```

**Nota:** La contraseña NO aparece en la respuesta por seguridad.

## Ejemplo 2: Login de Usuario

### Request
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.garcia@example.com",
    "password": "MiPassword123!"
  }'
```

### Response Exitosa
```json
{
  "success": true,
  "info": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6Im1hcmlhLmdhcmNpYUBleGFtcGxlLmNvbSIsInJvbGUiOiJMRU5ERVIiLCJpYXQiOjE3Mjg3MzU4MDAsImV4cCI6MTcyODczOTQwMH0.xxx",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "maria_garcia",
      "email": "maria.garcia@example.com",
      "firstname": "María",
      "lastname": "García",
      "phone": "+34612345678",
      "address": "Calle Principal 123, Madrid",
      "role": "LENDER"
    }
  }
}
```

### Response con Credenciales Inválidas
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

## Ejemplo 3: Cambiar Contraseña

### Request
```bash
curl -X PATCH http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "password": "NuevaPassword456!"
  }'
```

### Response
```json
{
  "success": true,
  "info": "User updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "maria_garcia",
    "document": "87654321",
    "firstname": "María",
    "lastname": "García",
    "phone": "+34612345678",
    "email": "maria.garcia@example.com",
    "address": "Calle Principal 123, Madrid",
    "role": "LENDER",
    "deleted": false,
    "createdAt": "2025-10-12T10:30:00.000Z",
    "updatedAt": "2025-10-12T11:15:00.000Z"
  }
}
```

## Ejemplo 4: Usar el Servicio en un Nuevo Caso de Uso

### Caso de Uso: Recuperación de Contraseña

```typescript
// src/modules/auth/application/use-cases/reset-password.use-case.ts
import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { IUserRepository } from '../../../user/domain/user.repository';
import { IHashService } from '../../../../common/interfaces/hash-service.interface';

interface ResetPasswordDto {
  email: string;
  resetToken: string;
  newPassword: string;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async resetPassword(dto: ResetPasswordDto) {
    // 1. Verificar el token de reset (simplificado)
    // En producción, validarías el token contra una tabla de tokens
    const user = await this.userRepository.findUserByEmail(dto.email);
    
    if (!user) {
      throw new BadRequestException('Invalid reset request');
    }

    // 2. Hashear la nueva contraseña
    const hashedPassword = await this.hashService.hashPassword(dto.newPassword);

    // 3. Actualizar la contraseña
    await this.userRepository.updateUser(user.id, {
      password: hashedPassword,
    });

    return {
      message: 'Password reset successfully',
    };
  }
}
```

## Ejemplo 5: Validación de Contraseña Fuerte

### DTO con Validaciones

```typescript
// src/modules/user/application/dto/create-user.dto.ts
import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  Matches 
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  document: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    }
  )
  password: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}
```

### Request con Contraseña Débil
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "document": "12345678",
    "password": "123",
    "firstname": "Test",
    "lastName": "User",
    "phone": "+1234567890",
    "email": "test@example.com",
    "address": "Test Address"
  }'
```

### Response con Error de Validación
```json
{
  "statusCode": 400,
  "message": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
  ],
  "error": "Bad Request"
}
```

## Ejemplo 6: Middleware de Verificación de Contraseña Antigua

### Caso de Uso: No Permitir Reutilizar la Contraseña Actual

```typescript
// src/modules/user/application/use-cases/change-password.use-case.ts
import { 
  Inject, 
  Injectable, 
  BadRequestException,
  NotFoundException 
} from '@nestjs/common';
import { IUserRepository } from '../../domain/user.repository';
import { IHashService } from '../../../../common/interfaces/hash-service.interface';

interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async changePassword(userId: string, dto: ChangePasswordDto) {
    // 1. Buscar el usuario
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Verificar la contraseña actual
    const isCurrentPasswordValid = await this.hashService.comparePassword(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // 3. Verificar que la nueva contraseña sea diferente
    const isSamePassword = await this.hashService.comparePassword(
      dto.newPassword,
      user.password,
    );

    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // 4. Hashear y actualizar la nueva contraseña
    const hashedPassword = await this.hashService.hashPassword(dto.newPassword);
    
    await this.userRepository.updateUser(user.id, {
      password: hashedPassword,
    });

    return {
      message: 'Password changed successfully',
    };
  }
}
```

### Request
```bash
curl -X POST http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "currentPassword": "MiPassword123!",
    "newPassword": "NuevaPassword456!"
  }'
```

## Ejemplo 7: Verificación en el Frontend

### JavaScript/TypeScript (React/Angular/Vue)

```typescript
// Ejemplo con fetch
async function loginUser(email: string, password: string) {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const result = await response.json();
    
    // Guardar el token
    localStorage.setItem('accessToken', result.data.accessToken);
    
    // Guardar información del usuario
    localStorage.setItem('user', JSON.stringify(result.data.user));
    
    return result.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Uso
loginUser('maria.garcia@example.com', 'MiPassword123!')
  .then(data => {
    console.log('Login exitoso:', data.user);
    // Redirigir al dashboard, etc.
  })
  .catch(error => {
    console.error('Error:', error.message);
    // Mostrar mensaje de error al usuario
  });
```

## Ejemplo 8: Prueba Manual de Hashing

### Desde el Terminal de Node.js

```bash
# Iniciar el modo desarrollo
pnpm start:dev
```

### Desde NestJS CLI

```typescript
// Crear un script temporal en src/test-hash.ts
import { BcryptService } from './infraestructure/hash/bcrypt.service';

async function testHash() {
  const hashService = new BcryptService();
  
  const password = 'TestPassword123!';
  console.log('Contraseña original:', password);
  
  // Hash
  const hash = await hashService.hashPassword(password);
  console.log('Hash generado:', hash);
  
  // Verificar correcta
  const isValid = await hashService.comparePassword(password, hash);
  console.log('¿Es válida?:', isValid); // true
  
  // Verificar incorrecta
  const isInvalid = await hashService.comparePassword('WrongPassword', hash);
  console.log('¿Es válida (incorrecta)?:', isInvalid); // false
}

testHash();
```

Ejecutar:
```bash
npx ts-node src/test-hash.ts
```

## Notas de Seguridad

### ✅ Buenas Prácticas
- Siempre hashear contraseñas antes de almacenar
- Nunca exponer contraseñas hasheadas en respuestas HTTP
- Usar mensajes de error genéricos en login
- Implementar rate limiting en endpoints de autenticación
- Validar la fortaleza de contraseñas en el frontend y backend

### ❌ Prácticas a Evitar
- Nunca almacenar contraseñas en texto plano
- Nunca loggear contraseñas (ni siquiera hasheadas)
- No usar MD5 o SHA1 para passwords (usar bcrypt, argon2, etc.)
- No implementar tu propio algoritmo de hashing
- No enviar contraseñas por email

## Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Password Strength Calculator](https://www.passwordmonster.com/)
- [Have I Been Pwned](https://haveibeenpwned.com/) - Verificar contraseñas comprometidas

