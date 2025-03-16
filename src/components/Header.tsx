
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";

const Header = () => {
  return (
    <header className="w-full py-8 px-6 sm:px-8 md:px-12 lg:px-16 border-b border-slate-800/80">
      <AnimatedContainer animation="slide-up" className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-gradient">John's App</span>
            </h1>
            <p className="text-slate-400 mt-1">Set, track, and accomplish your goals</p>
          </div>
          <div className="hidden sm:block">
            <div className="glass-card px-4 py-2 rounded-lg text-sm text-slate-300">
              Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </AnimatedContainer>
    </header>
  );
};

export default Header;
