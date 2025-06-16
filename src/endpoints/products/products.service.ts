import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    if (!data.name || typeof data.price !== 'number' || isNaN(data.price)) {
      throw new BadRequestException({
        message: 'Datos inválidos: El nombre es requerido y el precio debe ser un número.',
        details: {
          name: !data.name ? 'El nombre es requerido.' : undefined,
          price: (typeof data.price !== 'number' || isNaN(data.price)) ? 'El precio debe ser un número válido.' : undefined,
        }
      });
    }
    try {
      return await this.prisma.product.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('El nombre del producto ya existe');
      }
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async update(id: number, data: UpdateProductDto) {
    try {
      const updated = await this.prisma.product.update({ where: { id }, data });
      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Producto no encontrado');
        }
        if (error.code === 'P2002') {
          throw new ConflictException('El nombre del producto ya existe');
        }
      }
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.product.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Producto no encontrado');
      }
      throw new BadRequestException(error.message);
    }
  }
}
