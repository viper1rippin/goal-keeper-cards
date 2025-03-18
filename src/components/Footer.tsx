
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="py-6 px-6 sm:px-8 md:px-12 lg:px-16 border-t border-slate-800/80 select-none">
      <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
        <p>John's App © {new Date().getFullYear()} · Progress Tracker</p>
      </div>
    </footer>
  );
};

export default Footer;
