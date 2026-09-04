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
  const { user } = useAuth();
  const tasksKey = ['tasks', user?.id];
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['tasks'] });
    qc.invalidateQueries({ queryKey: ['projects'] });
  };
  const getTasks = () => qc.getQueryData(tasksKey) || [];

  return {
    createTask: useMutation({
      mutationFn: (data) => base44.entities.Task.create(data),
      onMutate: async (data) => {
        await qc.cancelQueries({ queryKey: tasksKey });
        const prev = getTasks();
        const temp = { ...data, id: `temp-${Date.now()}`, created_date: new Date().toISOString() };
        qc.setQueryData(tasksKey, [temp, ...prev]);
        return { prev };
      },
      onError: (_e, _d, ctx) => ctx?.prev && qc.setQueryData(tasksKey, ctx.prev),
      onSuccess: invalidate,
    }),
    updateTask: useMutation({
      mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
      onMutate: async ({ id, data }) => {
        await qc.cancelQueries({ queryKey: tasksKey });
        const prev = getTasks();
        qc.setQueryData(tasksKey, prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
        return { prev };
      },
      onError: (_e, _d, ctx) => ctx?.prev && qc.setQueryData(tasksKey, ctx.prev),
      onSuccess: invalidate,
    }),
    deleteTask: useMutation({
      mutationFn: (id) => base44.entities.Task.delete(id),
      onMutate: async (id) => {
        await qc.cancelQueries({ queryKey: tasksKey });
        const prev = getTasks();
        qc.setQueryData(tasksKey, prev.filter((t) => t.id !== id));
        return { prev };
      },
      onError: (_e, _id, ctx) => ctx?.prev && qc.setQueryData(tasksKey, ctx.prev),
      onSuccess: invalidate,
    }),
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