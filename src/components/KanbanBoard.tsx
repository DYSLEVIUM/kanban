import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import PlusIcon from '../icons/PlusIcon';
import { Column, ID, Task } from '../types';
import ColumnContainer from './ColumnContainer';
import TaskCard from './TaskCard';

const KanbanBoard = () => {
    const [columns, setColumns] = useState<Column[]>([]);
    const columnIDs = useMemo(
        () => columns.map((column) => column.id),
        [columns]
    );

    const [tasks, setTasks] = useState<Task[]>([]);

    const [activeColumn, setActiveColumn] = useState<Column | null>();
    const [activeTask, setActiveTask] = useState<Task | null>();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // 3px
            },
        })
    );

    const generateTitle = useCallback(() => {
        return Math.floor(Math.random() * 1000);
    }, []);

    const generateID = useCallback(() => {
        return crypto.randomUUID();
    }, []);

    const createNewColumn = useCallback(() => {
        const columnToAdd: Column = {
            id: generateID(),
            title: `Column ${generateTitle()}`,
        };

        setColumns((prev) => [...prev, columnToAdd]);
    }, [generateID, generateTitle]);

    const deleteColumn = useCallback((id: ID) => {
        setColumns((prev) => prev.filter((column) => column.id !== id));
        setTasks((prev) => prev.filter((task) => task.columnID !== id));
    }, []);

    const updateColumn = useCallback((id: ID, title: string) => {
        setColumns((prev) =>
            prev.map((column) => {
                if (column.id === id) {
                    column.title = title;
                }
                return column;
            })
        );
    }, []);

    const createTask = useCallback(
        (columnID: ID) => {
            const newTask: Task = {
                id: generateID(),
                columnID,
                content: `Task ${generateTitle()}`,
            };

            setTasks((prev) => [...prev, newTask]);
        },
        [generateID, generateTitle]
    );

    const deleteTask = useCallback((taskID: ID) => {
        setTasks((prev) => prev.filter((task) => task.id !== taskID));
    }, []);

    const updateTask = useCallback((id: ID, content: string) => {
        setTasks((prev) =>
            prev.map((task) => {
                if (task.id === id) {
                    task.content = content;
                }
                return task;
            })
        );
    }, []);

    const onDragStart = (event: DragStartEvent) => {
        const el = event.active.data.current;
        if (!el) {
            return;
        }
        switch (el.type) {
            case 'Column':
                setActiveColumn(el.column);
                break;
            case 'Task':
                setActiveTask(el.task);
                break;

            default:
                break;
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over) {
            return;
        }

        const activeID = active.id;
        const overID = over.id;

        if (activeID === overID) {
            return;
        }

        setColumns((columns) => {
            const activeColumnIndex = columns.findIndex(
                (column) => column.id === activeID
            );
            const overColumnIndex = columns.findIndex(
                (column) => column.id === overID
            );

            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });

        const el = event.active.data.current;
        if (!el) {
            return;
        }
        switch (el.type) {
            case 'Column':
                setActiveColumn(el.column);
                break;
            case 'Task':
                setActiveTask(el.task);
                break;

            default:
                break;
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) {
            return;
        }

        const activeID = active.id;
        const overID = over.id;

        if (activeID === overID) {
            return;
        }

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';

        if (!isActiveTask) {
            return;
        }

        // scenario 1: dropping a task over another task
        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeTaskIndex = tasks.findIndex(
                    (task) => task.id === activeID
                );
                const overTaskIndex = tasks.findIndex(
                    (task) => task.id === overID
                );

                tasks[activeTaskIndex].columnID = tasks[overTaskIndex].columnID;

                return arrayMove(tasks, activeTaskIndex, overTaskIndex);
            });
        }

        const isOverColumn = over.data.current?.type === 'Column';
        // scenario 2: dropping a task over another column
        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeTaskIndex = tasks.findIndex(
                    (task) => task.id === activeID
                );

                tasks[activeTaskIndex].columnID = overID;

                return arrayMove(tasks, activeTaskIndex, activeTaskIndex); // doing to cause a re-render
            });
        }
    };

    return (
        <div className='m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]'>
            <DndContext
                sensors={sensors}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
            >
                <div className='m-auto flex gap-4'>
                    <div className='flex gap-4'>
                        <SortableContext items={columnIDs}>
                            {columns.map((column) => (
                                <ColumnContainer
                                    key={column.id}
                                    column={column}
                                    deleteColumn={deleteColumn}
                                    updateColumn={updateColumn}
                                    createTask={createTask}
                                    tasks={tasks.filter(
                                        (task) => task.columnID === column.id
                                    )}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                />
                            ))}
                        </SortableContext>
                    </div>
                    <button
                        className='h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex gap-2'
                        onClick={createNewColumn}
                    >
                        <PlusIcon />
                        Add Column
                    </button>
                </div>

                {createPortal(
                    <DragOverlay>
                        {activeColumn && (
                            <ColumnContainer
                                column={activeColumn}
                                deleteColumn={deleteColumn}
                                updateColumn={updateColumn}
                                createTask={createTask}
                                tasks={tasks.filter(
                                    (task) => task.columnID === activeColumn.id
                                )}
                                deleteTask={deleteTask}
                                updateTask={updateTask}
                            />
                        )}
                        {activeTask && (
                            <TaskCard
                                task={activeTask}
                                updateTask={updateTask}
                                deleteTask={deleteTask}
                            />
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
};

export default KanbanBoard;
