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
