import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FC, useMemo, useState } from 'react';
import PlusIcon from '../icons/PlusIcon';
import TrashIcon from '../icons/TrashIcon';
import { Column, ID, Task } from '../types';
import TaskCard from './TaskCard';

interface ColumnProps {
    column: Column;
    deleteColumn: (id: ID) => void;
    updateColumn: (id: ID, title: string) => void;
    createTask: (id: ID) => void;
    deleteTask: (id: ID) => void;
    tasks: Task[];
    updateTask: (id: ID, content: string) => void;
}

const ColumnContainer: FC<ColumnProps> = ({
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
}) => {
    const [editMode, setEditMode] = useState(false);
    const taskIDs = useMemo(() => tasks.map((task) => task.id), [tasks]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
        disabled: editMode,
    });
    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className='bg-columnBackgroundColor 
                opacity-40 border-2 border-rose-500
                w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col'
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className='bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col'
        >
            {/* Column title */}
            <div
                {...attributes}
                {...listeners}
                onClick={() => setEditMode(true)}
                className='bg-mainBackgroundColor text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor border-4 flex items-center justify-between'
            >
                <div className='flex gap-2'>
                    <div className='flex justify-center items-center bg-columnBackgroundColor px-2 py-1 text-sm rounded-full'>
                        0
                    </div>
                    {editMode ? (
                        <input
                            className='bg-black focus:border-rose-500 border rounded outline-none px-2'
                            value={column.title}
                            autoFocus
                            onBlur={() => setEditMode(false)}
                            onKeyDown={(e) => {
                                if (e.key !== 'Enter') {
                                    return;
                                }
                                setEditMode(false);
                            }}
                            onChange={(e) =>
                                updateColumn(column.id, e.target.value)
                            }
                        />
                    ) : (
                        <>{column.title}</>
                    )}
                </div>
                <button
                    className='stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor rounded px-1 py-2'
                    onClick={() => deleteColumn(column.id)}
                >
                    <TrashIcon />
                </button>
            </div>

            {/* Column task container */}
            <div className='flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto'>
                {tasks.map((task) => (
                    <SortableContext items={taskIDs} key={task.id}>
                        <TaskCard
                            task={task}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    </SortableContext>
                ))}
            </div>
            {/* Column footer */}
            <button
                className='flex gap-2 items-center border-columnBackgroundColor border-2 rounded-md p-4 border-x-columnBackgroundColor hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black'
                onClick={() => {
                    createTask(column.id);
                }}
            >
                <PlusIcon />
                Add Task
            </button>
        </div>
    );
};

export default ColumnContainer;
