// viaa\src\components\dashboard\common\Avatar.tsx

import { useState } from "react";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

const Avatar = ({
  src,
  alt,
  size = "md",
  className = "",
  onClick,
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const baseClasses = `
    ${sizeClasses[size]}
    rounded-full 
    flex 
    items-center 
    justify-center 
    font-semibold 
    bg-gradient-to-br 
    from-blue-500 
    to-purple-600 
    text-white
    flex-shrink-0
    ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
    ${className}
  `;

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${baseClasses} object-cover`}
        onError={() => setImageError(true)}
        onClick={onClick}
      />
    );
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {getInitials(alt)}
    </div>
  );
};

export default Avatar;
