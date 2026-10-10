import { apiRequest } from './api';

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface StudentSkillItem {
  studentProfileId: string;
  skillId: string;
  proficiency: number;
  yearsOfExperience?: number | null;
  skill: SkillItem;
}

export const skillService = {
  async listAll(category?: string, signal?: AbortSignal): Promise<SkillItem[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiRequest<SkillItem[]>(`/skills${query}`, { signal });
  },

  async listCategories(signal?: AbortSignal): Promise<string[]> {
    return apiRequest<string[]>('/skills/categories', { signal });
  },

  async getMySkills(signal?: AbortSignal): Promise<StudentSkillItem[]> {
    return apiRequest<StudentSkillItem[]>('/students/profile/skills', { signal });
  },

  async addSkill(skillId: string, proficiency: number = 3, yearsOfExperience?: number): Promise<StudentSkillItem> {
    return apiRequest<StudentSkillItem>('/students/profile/skills', {
      method: 'POST',
      body: JSON.stringify({ skillId, proficiency, yearsOfExperience }),
    });
  },

  async setSkills(skillIds: string[]): Promise<StudentSkillItem[]> {
    return apiRequest<StudentSkillItem[]>('/students/profile/skills/bulk', {
      method: 'POST',
      body: JSON.stringify({ skillIds }),
    });
  },

  async removeSkill(skillId: string): Promise<void> {
    return apiRequest<void>(`/students/profile/skills/${encodeURIComponent(skillId)}`, {
      method: 'DELETE',
    });
  },
};
