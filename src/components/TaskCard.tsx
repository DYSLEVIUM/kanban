import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FC, useCallback, useState } from 'react';
import TrashIcon from '../icons/TrashIcon';
import { ID, Task } from '../types';

interface TaskCardProps {
    task: Task;
    deleteTask: (id: ID) => void;
    updateTask: (id: ID, content: string) => void;
}

const TaskCard: FC<TaskCardProps> = ({ task, deleteTask, updateTask }) => {
    const [isMouseOver, setIsMouseOver] = useState(false);

    const [editMode, setEditMode] = useState(false);

    const toggleEditMode = useCallback(() => {
        setEditMode((prev) => !prev);
        setIsMouseOver(false);
    }, []);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
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
                className='bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 border-rose-500 cursor-grab relative opacity-30'
            />
        );
    }

    if (editMode) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className='bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative'
            >
                <textarea
                    className='h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none'
                    value={task.content}
                    autoFocus
                    placeholder='Task content here'
                    onBlur={toggleEditMode}
                    onKeyDown={(e) => {
                        if (e.key !== 'Enter' || e.shiftKey) {
                            return;
                        }
                        toggleEditMode();
                    }}
                    onChange={(e) => updateTask(task.id, e.target.value)}
                />
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={toggleEditMode}
            className='bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task'
            onMouseEnter={() => setIsMouseOver(true)}
            onMouseLeave={() => setIsMouseOver(false)}
        >
            <p className='my-auto w-full h-[90%] overflow-y-auto overflow-x-hidden whitespace-pre-wrap'>
                {task.content}
            </p>
            {isMouseOver && (
                <button
                    onClick={() => deleteTask(task.id)}
                    className='stroke-white absolute right-4 top-1/2 -translate-y-1/2 bg-columnBackgroundColor p-2 rounded opacity-60 hover:opacity-100'
                >
                    <TrashIcon />
                </button>
            )}
        </div>
    );
};

export default TaskCard;
