'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function BackButton({ href, className = '', children }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`btn btn-outline ${className}`}
    >
      ← {children || '뒤로가기'}
    </button>
  );
}
