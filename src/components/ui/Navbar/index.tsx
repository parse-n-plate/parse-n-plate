import PPLogo from '@/components/ui/Navbar/pplogo';

export default function Navbar() {
  return (
    <div className="bg-white border-b border-[#d9d9d9] px-4 py-4">
      <div className="max-w-4xl mx-auto flex items-center space-x-3">
        <PPLogo />
        <h1 className="font-domine text-[16px] font-bold text-[#1e1e1e] leading-none">
          Parse and Plate
        </h1>
      </div>
    </div>
  );
}
