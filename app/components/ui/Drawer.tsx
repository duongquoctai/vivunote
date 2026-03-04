"use client";

import { Icon } from "@iconify/react";
import React, { useEffect } from "react";
import Button from "./Button";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: string;
  iconClassName?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  side?: "left" | "right";
  size?: string;
  className?: string;
}

const Drawer = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  iconClassName = "bg-blue-50 dark:bg-blue-900/20",
  footer,
  children,
  side = "right",
  size = "w-full md:w-96",
  className = "",
}: DrawerProps) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const sideClasses = {
    right: `top-0 right-0 h-full ${isOpen ? "translate-x-0" : "translate-x-full"}`,
    left: `top-0 left-0 h-full ${isOpen ? "translate-x-0" : "-translate-x-full"}`,
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 transition-opacity pointer-events-auto"
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed z-60 bg-white dark:bg-zinc-900 shadow-2xl transform transition-transform duration-300 ease-in-out pointer-events-auto ${sideClasses[side]} ${size} ${className}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 z-10">
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className={`p-2 rounded-xl shrink-0 ${iconClassName}`}>
                  <Icon icon={icon} className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              icon="mdi:close"
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {children}
            </div>
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dark:shadow-none">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Drawer;
