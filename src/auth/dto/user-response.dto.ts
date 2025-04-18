export class UserResponseDto {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'buyer' | 'seller';
    country?: string;
    createdAt: string;
    updatedAt: string;
  }
  