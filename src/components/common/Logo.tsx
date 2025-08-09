interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="text-blue-600 mr-2 text-2xl">🏥</div>
      <span className={`font-bold text-blue-600 ${sizeClasses[size]}`}>
        ObDoc MVP
      </span>
    </div>
  );
}
