import { z } from "zod";

export const PersonalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  location: z.string().min(1, "Location is required"),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
});

export const ExperienceEntrySchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company name is required"),
  title: z.string().min(1, "Job title is required"),
  location: z.string().optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  current: z.boolean().default(false),
  bullets: z.array(z.string()).min(1, "Add at least one bullet point"),
});

export const EducationEntrySchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  gpa: z.string().optional().or(z.literal("")),
});

export const SkillGroupSchema = z.object({
  id: z.string(),
  category: z.string().min(1, "Category name is required"),
  items: z.array(z.string()).min(1, "Add at least one skill"),
});

export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  date: z.string().optional().or(z.literal("")),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  technologies: z.array(z.string()),
});

export const ResumeSchema = z.object({
  personalInfo: PersonalInfoSchema,
  summary: z.string().optional().or(z.literal("")),
  experience: z.array(ExperienceEntrySchema),
  education: z.array(EducationEntrySchema),
  skills: z.array(SkillGroupSchema),
  certifications: z.array(CertificationSchema).optional().default([]),
  projects: z.array(ProjectSchema).optional().default([]),
});

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Resume = z.infer<typeof ResumeSchema>;

export const EMPTY_RESUME: Resume = {
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
};
