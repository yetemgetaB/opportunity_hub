import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StudentProfileRepository } from './student-profile.repository';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@Injectable()
export class StudentProfileService {
  constructor(
    private readonly studentProfileRepository: StudentProfileRepository,
  ) {}

  async getMyProfile(userId: string) {
    const profile =
      await this.studentProfileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Student profile not found.');
    }

    return profile;
  }

  async getStudentMatchingProfile(userId: string) {
    const profile =
      await this.studentProfileRepository.getStudentMatchingProfile(userId);

    if (!profile) {
      throw new NotFoundException('Student profile not found.');
    }

    return profile;
  }

  async createMyProfile(
    userId: string,
    data: CreateStudentProfileDto,
  ) {
    const existingProfile =
      await this.studentProfileRepository.findByUserId(userId);

    if (existingProfile) {
      throw new ConflictException(
        'Student profile already exists.',
      );
    }

    return this.studentProfileRepository.create(userId, data);
  }

  async updateMyProfile(
  userId: string,
  data: UpdateStudentProfileDto,
) {
  const existingProfile =
    await this.studentProfileRepository.findByUserId(userId);

  if (!existingProfile) {
    throw new NotFoundException(
      'Student profile not found.',
    );
  }

  return this.studentProfileRepository.update(
    userId,
    data,
  );
}

  async getMySkills(userId: string) {
    await this.getMyProfile(userId);
    return this.studentProfileRepository.getSkills(userId);
  }

  async addSkill(
    userId: string,
    data: {
      skillId: string;
      proficiency?: number;
      yearsOfExperience?: number;
    },
  ) {
    await this.getMyProfile(userId);
    return this.studentProfileRepository.addSkill(userId, data);
  }

  async removeSkill(userId: string, skillId: string) {
    await this.getMyProfile(userId);
    return this.studentProfileRepository.removeSkill(userId, skillId);
  }

  async setSkills(userId: string, skillIds: string[]) {
    await this.getMyProfile(userId);
    return this.studentProfileRepository.setSkills(userId, skillIds);
  }
}