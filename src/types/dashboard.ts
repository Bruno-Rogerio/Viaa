// viaa\src\types\dashboard.ts

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  type: "paciente" | "profissional" | "clinica" | "empresa";
}

export interface Professional {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  especialidades: string;
  foto_perfil_url?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  status_verificacao: "pendente" | "aprovado" | "rejeitado";
  verificado: boolean;
}

export interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  image?: string;
  video?: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  type: "text" | "image" | "video" | "article";
  tags?: string[];
}

export interface PostAuthor {
  id: string;
  name: string;
  specialization: string;
  avatar?: string;
  verified: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: PostAuthor;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

export interface Consultation {
  id: string;
  patient: {
    id: string;
    name: string;
    avatar?: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  type: "presencial" | "online";
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  firstConsultation: string;
  lastConsultation?: string;
  totalConsultations: number;
  status: "active" | "inactive";
  notes?: string;
}

export interface Notification {
  id: string;
  type:
    | "consultation"
    | "message"
    | "like"
    | "comment"
    | "share"
    | "connection";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface DashboardStats {
  consultationsThisWeek: number;
  newPatientsThisWeek: number;
  profileViews: number;
  postEngagement: number;
  totalPatients: number;
  totalPosts: number;
  totalConnections: number;
}
