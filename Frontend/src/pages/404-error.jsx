import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-6 py-12 relative overflow-hidden selection:bg-primary/20">
      
      {/* AMBIENT BACKGROUND MATRIX */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* FLOATING GEOMETRIC SHAPES (PURE CSS/FRAMER MOTION EFFECTS) */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl opacity-60 animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full filter blur-3xl opacity-40 animate-pulse pointer-events-none" />

      {/* CORE GRAPHIC CANVAS FRAME */}
      <div className="relative w-full max-w-sm aspect-video flex flex-col items-center justify-center select-none">
        
        {/* Dynamic Animated "404" Array */}
        <div className="flex items-center justify-center font-sans font-black text-8xl md:text-9xl tracking-tighter text-foreground/10 select-none relative">
          
          <motion.span
            initial={{ y: 0 }}
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            4
          </motion.span>

          {/* Central Portal Element representing '0' */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 md:w-24 md:h-24 mx-2 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center relative bg-background/50 shadow-inner"
          >
            <div className="w-4 h-4 rounded-full bg-primary/40 animate-ping" />
            <div className="w-2 h-2 rounded-full bg-primary absolute" />
          </motion.div>

          <motion.span
            initial={{ y: 0 }}
            animate={{ y: [4, -4, 4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            4
          </motion.span>
        </div>

        {/* Floating Code String Overlay */}
        <motion.div 
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute font-mono text-[10px] tracking-widest text-muted-foreground/40 border border-border/40 bg-card/40 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-xs uppercase top-6"
        >
          STATUS_CODE // 404
        </motion.div>
      </div>

      {/* READOUT MESSAGING BLOCK */}
      <div className="max-w-md text-center mt-6 space-y-3 z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/10 bg-primary/5 text-[10px] font-mono uppercase tracking-wider text-primary">
          <AlertCircle size={12} className="stroke-[2.25]" />
          Page Not Found
        </div>
        
        <h1 className="text-xl md:text-2xl font-sans font-semibold tracking-tight text-foreground">
          Coordinates Misaligned
        </h1>
        
        <p className="text-xs md:text-sm font-light text-muted-foreground leading-relaxed max-w-xs mx-auto">
          The structural address link you referenced does not exist on this portfolio environment matrix.
        </p>
      </div>

      {/* INTERACTIVE NAVIGATION CONTROL CONTROLLER */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full max-w-xs sm:max-w-sm justify-center z-10">
        
        {/* Step Backward Track */}
        <button
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 h-10 px-5 rounded-xl border border-border/60 bg-card/80 backdrop-blur-xs text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all duration-200 group"
        >
          <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-0.5 stroke-[1.75]" />
          <span>Go Back</span>
        </button>

        {/* Home Base Coordinates */}
        <Link
          to="/"
          className="w-full sm:w-auto flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-foreground text-background text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-all duration-200 shadow-xs group"
        >
          <Home size={14} className="transition-transform duration-200 group-hover:scale-105 stroke-[1.75]" />
          <span>System Home</span>
        </Link>
        
      </div>

    </div>
  );
};

export default NotFound;