export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-holo-400 flex justify-center">
      <div className="min-h-full max-w-[480px] w-full flex flex-col gap-lg justify-center p-lg grow">
        <div className="bg-white p-xl rounded-[8px] flex flex-col gap-lg grow items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
