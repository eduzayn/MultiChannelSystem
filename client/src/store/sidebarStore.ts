import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarState = {
  isMobileOpen: boolean;
  isCollapsed: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

// Usar persist para salvar a preferência do usuário sobre o menu estar recolhido ou expandido
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isMobileOpen: false,
      isCollapsed: false, // Estado para controlar se o menu está recolhido (true) ou expandido (false)
      toggleMobileSidebar: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      closeMobileSidebar: () => set({ isMobileOpen: false }),
      toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    {
      name: 'sidebar-storage', // Nome para o localStorage
      partialize: (state) => ({ isCollapsed: state.isCollapsed }), // Salvar apenas o estado de colapso
    }
  )
);
