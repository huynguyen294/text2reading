import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// const defaultFile = {
//   name: null,
//   bookmark: null,
// };

const useAppStore = create(
  persist(
    (set) => ({
      files: [],
      addFile: (file) => {
        set((state) => ({ files: [...state.files, file] }));
      },
      updateFile: (file) => {
        set((state) => ({
          files: state.files.map((f) => (f.name === file.name ? file : f)),
        }));
      },
      deleteFile: (file) => {
        set((state) => ({
          files: state.files.filter((f) => f.name !== file.name),
        }));
      },
    }),
    {
      name: "text2reading",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useAppStore;
