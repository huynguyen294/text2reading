/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import useAppStore from "./store/app";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import { Bookmark, BookOpenText, SplitSquareVertical } from "lucide-react";

const TOP_OFFSET_LINES = 100;
const BOTTOM_OFFSET_LINES = 3000;

export default function App() {
  const [data, setData] = useState(null);
  const [splitting, setSplitting] = useState(true);
  const { files, addFile, updateFile } = useAppStore();

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const name = file.name;
      const found = files.find((f) => f.name === name);
      const bookmark = found ? found.bookmark : null;

      const reader = new FileReader();
      reader.onload = () => {
        const textContent = reader.result;
        const content = textContent
          .split("\n")
          .map((line) => line.trim())
          .reduce((acc, line) => {
            const lastLine = acc[acc.length - 1];
            if (line === "" && lastLine === "") return acc;
            acc.push(line);
            return acc;
          }, []);

        setData({ name, content, bookmark });
        if (!found) {
          addFile({ name, bookmark: null });
        }
      };
      reader.onerror = () => {
        alert("Cannot load file.");
        setData(null);
      };
      reader.readAsText(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  useEffect(() => {
    const found = files.find((f) => f.name === data?.name);
    if (found) {
      setData({ ...data, bookmark: found.bookmark });
    }
  }, [files]);

  if (!data)
    return (
      <main className="bg-gray-400 h-[100dvh] w-[100dvw] flex items-center justify-center p-2 sm:p-6 select-none">
        <div
          {...getRootProps()}
          className={`w-full h-full border-4 border-dashed rounded-3xl flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-300 relative
          ${isDragActive ? "border-blue-500 bg-gray-200/20" : "border-gray-200 hover:border-white"}`}
        >
          <input {...getInputProps()} />
          <div className="space-y-6 flex flex-col items-center">
            <div className="w-32 h-40 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center relative">
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-gray-200 rounded-l-2xl"></div>
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            </div>
            <span className="bg-white text-gray-700 font-semibold px-6 py-2 rounded-full shadow-md text-sm border border-gray-100">
              Pass Me Your Text!
            </span>
            <div className="text-white space-y-2">
              <p className="text-lg font-bold">You Can Open Your Own Text.</p>
              <p className="text-sm opacity-80">Or Click Screen and Choose It.</p>
              <p className="text-sm opacity-80">
                Note: reading progress will store based on filename. So make sure filename is unique.
              </p>
            </div>
          </div>
        </div>
      </main>
    );

  const ToggleableLine = ({ line, index }) => {
    const [showButton, setShowButton] = useState(false);

    return (
      <p
        id={`line-${index}`}
        className={`relative group px-1 rounded-md hover:inset-shadow hover:shadow-[0px_0px_10px_rgba(0,0,0,0.15)] transition-all w-fit ${showButton ? "shadow-[0px_0px_10px_rgba(0,0,0,0.15)]" : ""}`}
        onClick={() => setShowButton(!showButton)}
        onMouseLeave={() => setShowButton(false)}
      >
        {line}
        <button
          className={`absolute left-0 top-0 -translate-y-[100%] opacity-0 transition-opacity text-sm px-2 py-1 rounded text-black/70 bg-gray-200 cursor-pointer ${showButton && "opacity-100"}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowButton(!showButton);
            updateFile({ name: data.name, bookmark: index });
            toast("Bookmarked!", {
              position: "top-center",
              description: "",
              action: {
                label: "Undo",
                onClick: () => {
                  updateFile({ name: data.name, bookmark: 0 });
                },
              },
            });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </p>
    );
  };

  return (
    <main className="h-[100dvh] w-fit container mx-auto max-w-7xl p-2 sm:p-6">
      <Toaster />
      <article lang="vi" role="article" aria-live="polite" aria-relevant="all">
        <div className="w-full flex justify-center my-10">
          <BookOpenText size={60} className="text-muted-foreground" />
        </div>
        {data.content.map((line, index) => {
          if (
            splitting &&
            data.bookmark &&
            (index < data.bookmark - TOP_OFFSET_LINES || index > data.bookmark + BOTTOM_OFFSET_LINES)
          ) {
            return null;
          }

          return !line ? <br key={index} /> : <ToggleableLine key={index} index={index} line={line} />;
        })}
        {data.bookmark && (
          <Button size="lg" className="fixed bottom-8 right-21 size-12 [&_svg]:size-6" asChild>
            <a href={`#line-${data.bookmark}`}>
              <Bookmark className="size-6" />
            </a>
          </Button>
        )}
        <Button
          variant={splitting ? "default" : "outline"}
          size="lg"
          className="fixed bottom-8 right-8 size-12 [&_svg]:size-6"
          onClick={() => setSplitting(!splitting)}
        >
          <SplitSquareVertical className="size-6" />
        </Button>
      </article>
    </main>
  );
}
