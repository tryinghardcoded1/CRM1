export type PipelineStage = "New Lead" | "Contacted" | "Qualified" | "Appointment Set" | "Hot Lead" | "Closed / Won" | "Lost";

export interface Lead {
  id?: string;
  userId: string;
  name: string;
  phone: string;
  vehicle_interest: string;
  budget: string;
  timeline: string;
  payment_type: string;
  status: string; // Hot, Warm, Cold
  pipeline_stage: PipelineStage;
  createdAt: number;
  updatedAt: number;
}

export type TaskStatus = "Pending" | "Completed";

export interface Task {
  id?: string;
  userId: string;
  leadId: string;
  text: string;
  status: TaskStatus;
  createdAt: number;
}

export interface Contact {
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export type AppointmentStatus = "Scheduled" | "Completed" | "Cancelled";

export interface Appointment {
  id?: string;
  userId: string;
  title: string;
  date: number; // timestamp
  contactId?: string; // Optional link to a contact
  leadId?: string; // Optional link to a lead
  status: AppointmentStatus;
  createdAt: number;
}
