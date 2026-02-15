import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchColumnsByProject, createColumn } from '../../redux/slices/boardSlice';
import { fetchTasksByProject, moveTask } from '../../redux/slices/taskSlice';
import { fetchProjectById } from '../../redux/slices/projectSlice';

import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { AddColumnButton } from './AddColumnButton';
import { AddMemberModal } from '../projects/AddMemberModal';
import { FilterBar } from './FilterBar';
import { TaskDetailModal } from './TaskDetailModal';

interface ActiveDragItem {
  id: string;
  type: 'task' | 'column';
  data: any;
}

export const KanbanBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const { columns, isLoading: columnsLoading } = useAppSelector((state) => state.board);
  const { tasks, isLoading: tasksLoading } = useAppSelector((state) => state.tasks);
  const { currentProject } = useAppSelector((state) => state.projects);

  // Local state for drag and drop
  const [activeItem, setActiveItem] = useState<ActiveDragItem | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced for better responsiveness
        delay: 0,
        tolerance: 5,
      },
    })
  );

  // Fetch data on mount
  useEffect(() => {
    if (!projectId) {
      navigate('/projects');
      return;
    }

    const loadBoardData = async () => {
      try {
        await Promise.all([
          dispatch(fetchProjectById(projectId)),
          dispatch(fetchColumnsByProject(projectId)),
          dispatch(fetchTasksByProject(projectId)),
        ]);
      } catch {
        toast.error('Failed to load board data');
        navigate('/projects');
      }
    };

    loadBoardData();
  }, [dispatch, projectId, navigate]);

  // Filter tasks based on active filters
  const getFilteredTasks = () => {
    let filteredTasks = [...tasks];

    // Text search
    if (filters.text) {
      const searchTerm = filters.text.toLowerCase();
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm) ||
          task.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status) {
      filteredTasks = filteredTasks.filter(
        (task) => task.status === filters.status
      );
    }

    // Priority filter
    if (filters.priority) {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === filters.priority
      );
    }

    // Assigned user filter
    if (filters.assignedTo) {
      filteredTasks = filteredTasks.filter(
        (task) => task.assignedTo?.some(user =>
          typeof user === 'string' ? user === filters.assignedTo : user._id === filters.assignedTo
        )
      );
    }

    // Due date filters
    if (filters.dueDateFrom) {
      filteredTasks = filteredTasks.filter(
        (task) => task.dueDate && new Date(task.dueDate) >= new Date(filters.dueDateFrom)
      );
    }
    if (filters.dueDateTo) {
      filteredTasks = filteredTasks.filter(
        (task) => task.dueDate && new Date(task.dueDate) <= new Date(filters.dueDateTo)
      );
    }

    // Labels filter
    if (filters.labels) {
      const labelArray = filters.labels.split(',').map((l: string) => l.trim());
      filteredTasks = filteredTasks.filter(
        (task) => task.labels?.some(label => labelArray.includes(label))
      );
    }

    return filteredTasks;
  };

  // Group tasks by column
  const getTasksByColumn = (columnId: string) => {
    const filteredTasks = getFilteredTasks();
    return filteredTasks
      .filter((task) => task.column === columnId)
      .sort((a, b) => a.order - b.order);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeType = active.data.current?.type as 'task' | 'column';

    setActiveItem({
      id: String(active.id),
      type: activeType,
      data: active.data.current?.data,
    });
  };

  // Handle drag over (for live sorting preview)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // Only handle task over column or task over task
    if (activeType !== 'task') return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    // Find the task being dragged
    const activeTask = tasks.find((t) => t._id === activeTaskId);
    if (!activeTask) return;

    // Determine target column
    let targetColumnId: string | null = null;

    if (overType === 'column') {
      targetColumnId = overId;
    } else if (overType === 'task') {
      const overTask = tasks.find((t) => t._id === overId);
      targetColumnId = overTask?.column || null;
    }

    if (targetColumnId && activeTask.column !== targetColumnId) {
      // Task is being moved to a different column
      // We'll handle the actual move in handleDragEnd
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveItem(null);

    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;
    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeType === 'task') {
      // Handle task movement
      const activeTask = tasks.find((t) => t._id === activeId);
      if (!activeTask) return;

      let targetColumnId = activeTask.column;
      let targetPosition = activeTask.order;

      if (overType === 'column') {
        // Dropped on a column - add to end
        targetColumnId = overId;
        const columnTasks = getTasksByColumn(targetColumnId);
        targetPosition = columnTasks.length;
      } else if (overType === 'task') {
        // Dropped on another task
        const overTask = tasks.find((t) => t._id === overId);
        if (!overTask) return;

        targetColumnId = overTask.column;
        targetPosition = overTask.order;

        // Adjust position based on direction
        const oldIndex = tasks.findIndex((t) => t._id === activeId);
        const newIndex = tasks.findIndex((t) => t._id === overId);

        if (oldIndex < newIndex && activeTask.column === targetColumnId) {
          targetPosition = overTask.order;
        }
      }

      // Only move if position or column changed
      if (activeTask.column !== targetColumnId || activeTask.order !== targetPosition) {
        try {
          await dispatch(moveTask({
            taskId: activeId,
            targetColumnId,
            targetPosition,
          })).unwrap();

          // Refresh tasks to ensure all orders are correct
          if (projectId) {
            dispatch(fetchTasksByProject(projectId));
          }
        } catch {
          toast.error('Failed to move task');
        }
      }
    } else if (activeType === 'column' && overType === 'column') {
      // Handle column reordering
      // TODO: Implement column reordering if needed
    }
  };

  // Handle adding new column
  const handleAddColumn = async (name: string) => {
    if (!projectId) return;

    try {
      await dispatch(createColumn({
        name,
        project: projectId,
      })).unwrap();
      toast.success('Column created successfully');
    } catch {
      toast.error('Failed to create column');
    }
  };

  if (columnsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/projects')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Projects
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentProject?.name || 'Loading...'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Members avatars */}
            {currentProject?.members && (
              <div className="flex -space-x-2">
                {currentProject.members.slice(0, 5).map((member, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                    title={`Member ${index + 1}`}
                  >
                    {index + 1}
                  </div>
                ))}
                {currentProject.members.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
                    +{currentProject.members.length - 5}
                  </div>
                )}
              </div>
            )}

            {/* Add member button */}
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      {projectId && (
        <FilterBar
          projectId={projectId}
          onFiltersChange={setFilters}
        />
      )}

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            <SortableContext
              items={columns.map((col) => col._id)}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column) => (
                <KanbanColumn
                  key={column._id}
                  column={column}
                  tasks={getTasksByColumn(column._id)}
                  onTaskSelect={setSelectedTaskId}
                />
              ))}
            </SortableContext>

            {/* Add Column Button */}
            <AddColumnButton onAdd={handleAddColumn} />
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeItem?.type === 'task' && activeItem.data && (
              <TaskCard task={activeItem.data} isDragging />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && projectId && (
        <AddMemberModal
          projectId={projectId}
          projectName={currentProject?.name || 'Project'}
          onClose={() => setShowAddMemberModal(false)}
        />
      )}

      {/* Task Detail Modal - AT ROOT LEVEL */}
      {selectedTaskId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ zIndex: 99999 }}
        >
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setSelectedTaskId(null)}
          />
          <div className="relative bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto z-10">
            <TaskDetailModal
              taskId={selectedTaskId}
              onClose={() => setSelectedTaskId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};