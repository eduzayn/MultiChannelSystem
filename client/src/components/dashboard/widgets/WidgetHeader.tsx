import React from 'react';
import { ArrowPathIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WidgetHeaderProps {
  title: string;
  isEditing?: boolean;
  onRefresh?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  title,
  isEditing,
  onRefresh,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="flex items-center space-x-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Atualizar"
          >
            <ArrowPathIcon className="w-4 h-4 text-gray-500" />
          </button>
        )}
        {isEditing && (onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}; 