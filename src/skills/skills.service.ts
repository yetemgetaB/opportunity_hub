import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll(category?: string) {
    const where = category ? { category } : {};
    return this.prisma.skill.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async listCategories(): Promise<string[]> {
    const skills = await this.prisma.skill.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return skills.map((s) => s.category);
  }

  async getById(id: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found.`);
    }
    return skill;
  }

  async create(dto: CreateSkillDto) {
    const existing = await this.prisma.skill.findUnique({
      where: { name: dto.name.trim() },
    });
    if (existing) {
      throw new ConflictException(`Skill with name "${dto.name}" already exists.`);
    }
    return this.prisma.skill.create({
      data: {
        name: dto.name.trim(),
        category: dto.category.trim(),
        description: dto.description?.trim(),
      },
    });
  }

  async delete(id: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found.`);
    }
    return this.prisma.skill.delete({
      where: { id },
    });
  }
}
