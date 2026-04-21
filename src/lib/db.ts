import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Lead, PipelineStage, Task, TaskStatus, Contact, Appointment, AppointmentStatus } from '../types';
import { toast } from 'sonner';

interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: any;
}

export const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null, user: any) => {
  if (error?.message?.includes('Missing or insufficient permissions')) {
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: user ? {
        userId: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        isAnonymous: user.isAnonymous,
        providerInfo: user.providerData,
      } : null,
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};

// Send webhook
const sendToWebhook = async (lead: Lead) => {
  try {
    await fetch('https://your-vercel-api.vercel.app/api/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: lead.name,
        phone: lead.phone,
        vehicle_interest: lead.vehicle_interest,
        budget: lead.budget,
        timeline: lead.timeline,
        payment_type: lead.payment_type,
        status: lead.status,
        source: "CloseLine Demo CRM"
      }),
    });
  } catch (error) {
    console.error("Failed to send webhook:", error);
  }
};

export const createLead = async (leadData: Omit<Lead, 'id'>, user: any) => {
  try {
    const leadsRef = collection(db, 'leads');
    const docRef = await addDoc(leadsRef, leadData);
    
    // Trigger webhook asynchronously
    sendToWebhook(leadData as Lead);
    
    // Simulate email notification
    toast.success("Email Notification Sent", { 
      description: `Alert sent for new lead: ${leadData.name}` 
    });
    
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, 'create', 'leads', user);
  }
};

export const updateLeadStage = async (leadId: string, newStage: PipelineStage, user: any) => {
  try {
    const leadRef = doc(db, 'leads', leadId);
    
    await updateDoc(leadRef, {
      pipeline_stage: newStage,
      updatedAt: Date.now()
    });
    
    // Simulate email notification
    toast.info("Status Update Email Sent", { 
      description: `Notification sent for stage change to: ${newStage}` 
    });
    
    // Fetch updated lead data for webhook
    const updatedLeadSnap = await getDoc(leadRef);
    if (updatedLeadSnap.exists()) {
      sendToWebhook(updatedLeadSnap.data() as Lead);
    }

  } catch (error) {
    handleFirestoreError(error, 'update', `leads/${leadId}`, user);
  }
};

export const subscribeToLeads = (userId: string, callback: (leads: Lead[]) => void, errorCallback: (error: any) => void) => {
  const q = query(collection(db, 'leads'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
    // Sort by createdAt descending
    leads.sort((a, b) => b.createdAt - a.createdAt);
    callback(leads);
  }, errorCallback);
};

// Task Management functions
export const createTask = async (taskData: Omit<Task, 'id'>, user: any) => {
  try {
    const tasksRef = collection(db, 'tasks');
    const docRef = await addDoc(tasksRef, taskData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, 'create', 'tasks', user);
  }
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus, user: any) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status
    });
  } catch (error) {
    handleFirestoreError(error, 'update', `tasks/${taskId}`, user);
  }
};

export const deleteTask = async (taskId: string, user: any) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
     handleFirestoreError(error, 'delete', `tasks/${taskId}`, user);
  }
}

export const subscribeToTasks = (userId: string, callback: (tasks: Task[]) => void, errorCallback: (error: any) => void) => {
  const q = query(collection(db, 'tasks'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    tasks.sort((a, b) => b.createdAt - a.createdAt);
    callback(tasks);
  }, errorCallback);
};

// Contacts Management functions
export const createContact = async (contactData: Omit<Contact, 'id'>, user: any) => {
  try {
    const contactsRef = collection(db, 'contacts');
    const docRef = await addDoc(contactsRef, contactData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, 'create', 'contacts', user);
  }
};

export const subscribeToContacts = (userId: string, callback: (contacts: Contact[]) => void, errorCallback: (error: any) => void) => {
  const q = query(collection(db, 'contacts'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
    contacts.sort((a, b) => b.createdAt - a.createdAt);
    callback(contacts);
  }, errorCallback);
};

export const deleteContact = async (contactId: string, user: any) => {
  try {
    await deleteDoc(doc(db, 'contacts', contactId));
  } catch (error) {
     handleFirestoreError(error, 'delete', `contacts/${contactId}`, user);
  }
};

// Appointments Management functions
export const createAppointment = async (apptData: Omit<Appointment, 'id'>, user: any) => {
  try {
    const apptsRef = collection(db, 'appointments');
    const docRef = await addDoc(apptsRef, apptData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, 'create', 'appointments', user);
  }
};

export const updateAppointmentStatus = async (apptId: string, status: AppointmentStatus, user: any) => {
  try {
    const apptRef = doc(db, 'appointments', apptId);
    await updateDoc(apptRef, { status });
  } catch (error) {
    handleFirestoreError(error, 'update', `appointments/${apptId}`, user);
  }
};

export const subscribeToAppointments = (userId: string, callback: (appointments: Appointment[]) => void, errorCallback: (error: any) => void) => {
  const q = query(collection(db, 'appointments'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const appts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
    appts.sort((a, b) => b.date - a.date);
    callback(appts);
  }, errorCallback);
};

export const deleteAppointment = async (apptId: string, user: any) => {
  try {
    await deleteDoc(doc(db, 'appointments', apptId));
  } catch (error) {
     handleFirestoreError(error, 'delete', `appointments/${apptId}`, user);
  }
};
