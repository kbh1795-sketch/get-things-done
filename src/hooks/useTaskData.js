import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export function useAllTasks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => base44.entities.Task.filter({ created_by_id: user.id }, '-created_date', 500),
    enabled: !!user,
  });
}

export function useAllProjects() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => base44.entities.Project.filter({ created_by_id: user.id }, '-created_date', 200),
    enabled: !!user,
  });
}

export function useTaskMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['tasks'] });
    qc.invalidateQueries({ queryKey: ['projects'] });
  };
  return {
    createTask: useMutation({ mutationFn: (data) => base44.entities.Task.create(data), onSuccess: invalidate }),
    updateTask: useMutation({ mutationFn: ({ id, data }) => base44.entities.Task.update(id, data), onSuccess: invalidate }),
    deleteTask: useMutation({ mutationFn: (id) => base44.entities.Task.delete(id), onSuccess: invalidate }),
    bulkCreateTasks: useMutation({ mutationFn: (data) => base44.entities.Task.bulkCreate(data), onSuccess: invalidate }),
    deleteCompleted: useMutation({ mutationFn: (userId) => base44.entities.Task.deleteMany({ completed: true, created_by_id: userId }), onSuccess: invalidate }),
  };
}

export function useProjectMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['projects'] });
  return {
    createProject: useMutation({ mutationFn: (data) => base44.entities.Project.create(data), onSuccess: invalidate }),
    updateProject: useMutation({ mutationFn: ({ id, data }) => base44.entities.Project.update(id, data), onSuccess: invalidate }),
    deleteProject: useMutation({ mutationFn: (id) => base44.entities.Project.delete(id), onSuccess: invalidate }),
  };
}