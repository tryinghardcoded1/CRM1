import { useEffect, useState } from 'react';
import { subscribeToLeads, updateLeadStage } from '@/lib/db';
import { useAuth } from '@/lib/AuthContext';
import { Lead, PipelineStage } from '@/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/common/app-card';
import { Badge } from '@/components/common/app-badge';
import { format } from 'date-fns';

const STAGES: PipelineStage[] = [
  "New Lead", 
  "Contacted", 
  "Qualified", 
  "Appointment Set", 
  "Hot Lead", 
  "Closed / Won", 
  "Lost"
];

export default function Pipeline() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToLeads(
      user.uid,
      (data) => {
        setLeads(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching leads:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStage = destination.droppableId as PipelineStage;
    const lead = leads.find(l => l.id === draggableId);
    if (!lead || !user) return;

    // Optimistic update
    const previousStage = lead.pipeline_stage;
    setLeads(prev => prev.map(l => l.id === draggableId ? { ...l, pipeline_stage: newStage } : l));

    try {
      await updateLeadStage(draggableId, newStage, user);
    } catch (err) {
      console.error(err);
      // Revert on error
      setLeads(prev => prev.map(l => l.id === draggableId ? { ...l, pipeline_stage: previousStage } : l));
    }
  };

  if (loading) return <div>Loading pipeline...</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full min-w-max items-start">
            {STAGES.map((stage) => {
              const stageLeads = leads.filter(l => l.pipeline_stage === stage);
              return (
                <div key={stage} className="bg-gray-100 rounded-lg w-[320px] flex flex-col max-h-full">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-700 flex justify-between items-center">
                      {stage}
                      <Badge variant="secondary" className="bg-gray-200 text-gray-700">{stageLeads.length}</Badge>
                    </h3>
                  </div>
                  
                  <Droppable droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto p-4 space-y-3 min-h-[150px] ${
                          snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        {stageLeads.map((lead, index) => (
                          // @ts-ignore
                          <Draggable key={lead.id} draggableId={lead.id!} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                              >
                                <Card className={`shadow-sm border border-gray-200 ${snapshot.isDragging ? 'shadow-md ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
                                  <CardContent className="p-4 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-medium text-gray-900">{lead.name}</h4>
                                      <Badge variant={lead.status === 'Hot' ? 'destructive' : lead.status === 'Warm' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                                        {lead.status}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <div className="flex justify-between truncate"><span className="text-gray-400">P:</span> {lead.phone}</div>
                                      <div className="flex justify-between truncate"><span className="text-gray-400">V:</span> {lead.vehicle_interest}</div>
                                      <div className="flex justify-between truncate"><span className="text-gray-400">B:</span> {lead.budget}</div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                      {format(new Date(lead.createdAt), 'MMM d, h:mm a')}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
