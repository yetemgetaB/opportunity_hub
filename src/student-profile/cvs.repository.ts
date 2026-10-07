import { Injectable, NotFoundException } from '@nestjs/common';
import { CV } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CvsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Persist a new CV record associated with a student.
   */
  async create(data: {
    id?: string;
    studentProfileId: string;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    isDefault?: boolean;
  }): Promise<CV> {
    return this.prisma.cV.create({
      data: {
        id: data.id,
        studentProfileId: data.studentProfileId,
        fileName: data.fileName,
        filePath: data.filePath,
        fileType: data.fileType,
        fileSize: data.fileSize,
        isDefault: data.isDefault ?? false,
      },
    });
  }

  /**
   * List all CVs for a student, ordered by default flag first, then newest upload.
   */
  async findManyByStudentId(studentProfileId: string): Promise<CV[]> {
    return this.prisma.cV.findMany({
      where: {
        studentProfileId,
      },
      orderBy: [{ isDefault: 'desc' }, { uploadedAt: 'desc' }],
    });
  }

  /**
   * Find a specific CV by ID strictly scoped to the student profile.
   */
  async findByIdAndStudentId(
    id: string,
    studentProfileId: string,
  ): Promise<CV | null> {
    return this.prisma.cV.findFirst({
      where: {
        id,
        studentProfileId,
      },
    });
  }

  /**
   * Find the primary CV for a student (default first, then latest uploaded).
   */
  async findPrimaryCvForStudent(
    studentProfileId: string,
  ): Promise<CV | null> {
    return this.prisma.cV.findFirst({
      where: {
        studentProfileId,
      },
      orderBy: [{ isDefault: 'desc' }, { uploadedAt: 'desc' }],
    });
  }

  /**
   * Count total uploaded CVs for a student.
   */
  async countByStudentId(studentProfileId: string): Promise<number> {
    return this.prisma.cV.count({
      where: {
        studentProfileId,
      },
    });
  }

  /**
   * Delete a CV record strictly scoped to the student profile.
   */
  async deleteByIdAndStudentId(
    id: string,
    studentProfileId: string,
  ): Promise<CV> {
    const existing = await this.findByIdAndStudentId(id, studentProfileId);
    if (!existing) {
      throw new NotFoundException(
        `CV with ID ${id} not found for this student.`,
      );
    }

    return this.prisma.cV.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Mark a CV as default while clearing default on all other CVs for this student in a transaction.
   */
  async setDefault(
    id: string,
    studentProfileId: string,
  ): Promise<CV> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.cV.findFirst({
        where: {
          id,
          studentProfileId,
        },
      });

      if (!existing) {
        throw new NotFoundException(
          `CV with ID ${id} not found for this student.`,
        );
      }

      // Clear default flag on all CVs belonging to this student
      await tx.cV.updateMany({
        where: {
          studentProfileId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      // Set the target CV as default
      return tx.cV.update({
        where: {
          id,
        },
        data: {
          isDefault: true,
        },
      });
    });
  }
}
