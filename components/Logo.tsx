import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 48 }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <rect width="100" height="100" rx="24" className="fill-slate-900 dark:fill-rose-600" />
        <path 
          d="M30 30C30 26.6863 32.6863 24 36 24H55C66.0457 24 75 32.9543 75 44C75 55.0457 66.0457 64 55 64H36V76H30V30ZM55 58C62.732 58 69 51.732 69 44C69 36.268 62.732 30 55 30H36V58H55Z" 
          fill="white" 
        />
        {/* Ícone de Tesoura Estilizado */}
        <circle cx="75" cy="70" r="8" stroke="white" strokeWidth="4" />
        <circle cx="85" cy="70" r="8" stroke="white" strokeWidth="4" />
        <path d="M70 60L50 40" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <path d="M80 60L60 40" stroke="white" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default Logo;