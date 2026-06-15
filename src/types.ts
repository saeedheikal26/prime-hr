export interface Candidate {
  id: string;
  fullName: string;
  phone: string;
  age: number;
  governorate: string;
  qualification: string;
  specialization: string;
  experience: string;
  desiredTitle: string;
  cvFile?: {
    name: string;
    type: string;
    size: number;
    data: string; // base64 representation or file path URL
  };
  submittedAt: string;
}

export interface CandidateFilters {
  searchTerm?: string;
  specialization?: string;
  governorate?: string;
  experience?: string;
  qualification?: string;
}

export const GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "القليوبية",
  "الإسكندرية",
  "الشرقية",
  "الدقهلية",
  "الغربية",
  "المنوفية",
  "البحيرة",
  "كفر الشيخ",
  "بني سويف",
  "الفيوم",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "أخرى"
];

export const QUALIFICATIONS = [
  "أقل من متوسط",
  "متوسط",
  "فوق متوسط",
  "بكالوريوس",
  "ليسانس",
  "دبلوم",
  "ماجستير",
  "دكتوراه"
];

export const EXPERIENCE_LEVELS = [
  "بدون خبرة",
  "أقل من سنة",
  "1-3 سنوات",
  "3-5 سنوات",
  "5-10 سنوات",
  "أكثر من 10 سنوات"
];
