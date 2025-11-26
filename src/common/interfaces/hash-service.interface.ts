/**
 * Interfaz para el servicio de hashing de contraseñas
 * Sigue el principio de inversión de dependencias (DIP)
 */
export interface IHashService {
  hashPassword(plainPassword: string): Promise<string>;

  comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
