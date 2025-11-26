# AWS S3 Storage Service

Servicio robusto para gestionar archivos en AWS S3 con las mejores prácticas.

## 🚀 Características

- ✅ Subida de archivos individuales y múltiples
- ✅ Generación de URLs firmadas para acceso temporal
- ✅ Validación de tipos de archivo
- ✅ Nombres de archivo únicos con UUID
- ✅ Eliminación de archivos individuales y múltiples
- ✅ Verificación de existencia de archivos
- ✅ Logging completo de operaciones
- ✅ Manejo robusto de errores
- ✅ Fuertemente tipado (TypeScript)

## 📋 Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env.development` o `.env.production`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

### Importar el Módulo

```typescript
import { StorageModule } from 'src/infraestructure/storage/storage.module';

@Module({
  imports: [StorageModule],
  // ...
})
export class YourModule {}
```

## 💡 Uso

### 1. Subir un Archivo

```typescript
import { S3Service } from 'src/infraestructure/storage/s3.service';

@Injectable()
export class YourService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadProofOfPayment(file: Express.Multer.File) {
    const result = await this.s3Service.uploadFile(
      {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
        folder: 'proofs-of-payment', // Opcional: organizar en carpetas
      },
      ['image/*', 'application/pdf'], // Tipos permitidos
    );

    // result = { key: 'proofs-of-payment/file-123.jpg', url: 'https://...', bucket: 'my-bucket' }
    return result;
  }
}
```

### 2. Generar URL Firmada (Acceso Temporal)

```typescript
// URL válida por 1 hora (3600 segundos)
const signedUrl = await this.s3Service.getSignedUrl(
  'proofs-of-payment/file-123.jpg',
  3600,
);

// El usuario puede acceder al archivo temporalmente
// https://my-bucket.s3.amazonaws.com/file-123.jpg?X-Amz-Algorithm=...
```

### 3. Eliminar un Archivo

```typescript
await this.s3Service.deleteFile('proofs-of-payment/file-123.jpg');
```

### 4. Verificar si un Archivo Existe

```typescript
const exists = await this.s3Service.fileExists('proofs-of-payment/file-123.jpg');
if (exists) {
  console.log('El archivo existe');
}
```

### 5. Subir Múltiples Archivos

```typescript
const files = [
  {
    buffer: file1.buffer,
    mimetype: file1.mimetype,
    originalname: file1.originalname,
    folder: 'documents',
  },
  {
    buffer: file2.buffer,
    mimetype: file2.mimetype,
    originalname: file2.originalname,
    folder: 'documents',
  },
];

const results = await this.s3Service.uploadMultipleFiles(files);
// results = [{ key: '...', url: '...', bucket: '...' }, { key: '...', url: '...', bucket: '...' }]
```

### 6. Eliminar Múltiples Archivos

```typescript
await this.s3Service.deleteMultipleFiles([
  'documents/file1.pdf',
  'documents/file2.pdf',
]);
```

## 🎯 Ejemplo Completo: Subir Comprobante de Pago

### Controller

```typescript
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('payments')
export class PaymentController {
  constructor(private readonly uploadProofUseCase: UploadProofUseCase) {}

  @Post(':paymentId/proof')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProof(
    @Param('paymentId') paymentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.uploadProofUseCase.execute(paymentId, file);
  }
}
```

### Use Case

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from 'src/infraestructure/storage/s3.service';

@Injectable()
export class UploadProofUseCase {
  constructor(
    private readonly s3Service: S3Service,
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(paymentId: string, file: Express.Multer.File) {
    // 1. Verificar que el pago existe
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // 2. Subir archivo a S3
    const uploadResult = await this.s3Service.uploadFile(
      {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
        folder: 'proofs-of-payment',
      },
      ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    );

    // 3. Guardar referencia en la base de datos
    await this.paymentRepository.updateProof(paymentId, {
      key: uploadResult.key,
      url: uploadResult.url,
    });

    return uploadResult;
  }
}
```

## 🔒 Seguridad

### Tipos de Archivo Permitidos

Por defecto, el servicio permite:
- `image/*` (todas las imágenes)
- `application/pdf`

Puedes personalizar los tipos permitidos:

```typescript
await this.s3Service.uploadFile(file, [
  'image/jpeg',
  'image/png',
  'application/pdf',
]);
```

### URLs Firmadas

Las URLs firmadas expiran automáticamente después del tiempo especificado:

```typescript
// URL válida por 5 minutos
const url = await this.s3Service.getSignedUrl('file.jpg', 300);
```

## 📊 Estructura de Keys

Los archivos se guardan con la siguiente estructura:

```
folder/filename-timestamp-uuid.extension

Ejemplo:
proofs-of-payment/comprobante-1234567890-a1b2c3d4-e5f6.jpg
```

Esto garantiza:
- ✅ Nombres únicos (no hay colisiones)
- ✅ Organización por carpetas
- ✅ Trazabilidad con timestamp
- ✅ Identificación única con UUID

## 🛠️ Mejores Prácticas

1. **Siempre valida el tipo de archivo** antes de subirlo
2. **Usa carpetas** para organizar archivos por tipo o módulo
3. **Genera URLs firmadas** para archivos privados
4. **Elimina archivos antiguos** cuando ya no se necesiten
5. **Maneja errores** apropiadamente en tu aplicación
6. **Usa logging** para auditoría y debugging

## 🔧 Configuración de Bucket S3

### Permisos IAM Requeridos

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:HeadObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### CORS (si accedes desde frontend)

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

