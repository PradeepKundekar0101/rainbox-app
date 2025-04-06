"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import {
  Cog8ToothIcon,
  BookmarkIcon,
  UserCircleIcon,
  SquaresPlusIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Inbox from "./Inbox";
import { useAuth } from "@/context/authContext";
import { useMode } from "@/context/modeContext";
import { useSenders } from "@/context/sendersContext";
import { useMails } from "@/context/mailsContext";
import { ThemeSwitcher } from "../theme-switcher";
const Sidebar = () => {
  const { user, logout } = useAuth();
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [width, setWidth] = useState(320); // Default width in pixels
  const [showUserModal, setShowUserModal] = useState(false);
  const sidebarRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const { setMode } = useMode();
  const { setSelectedSender } = useSenders();
  const { setSelectedMail } = useMails();
  const MIN_WIDTH = 240; // Minimum width in pixels
  const MAX_WIDTH = 480; // Maximum width in pixels

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    let newWidth = e.clientX;

    if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
    if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;

    setWidth(newWidth);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  // Clean up event listeners if component unmounts while dragging
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  const handleCopyEmail = () => {
    if (
      user?.email &&
      typeof navigator !== "undefined" &&
      navigator.clipboard
    ) {
      navigator.clipboard.writeText(user.email);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 1000);
    }
  };

  return (
    <div
      ref={sidebarRef}
      className="h-screen  flex flex-col bg-background shadow-sm relative "
      style={{ width: `${width}px` }}
    >
      {/* Header */}
      <div className="px-md py-sm h-header flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-md">
          <Image
            src="/RainboxLogo.png"
            alt="Logo"
            className="w-8 h-8"
            width={32}
            height={32}
          />
          <span className="font-bold text-xl tracking-tight text-foreground">
            Rainbox
          </span>

        </div>

        <div className="flex items-center space-x-md">
          <ThemeSwitcher />
          <button
            className="text-muted-foreground hover:text-foreground rounded-full hover:bg-accent cursor-pointer transition-transform duration-300 ease-in-out hover:rotate-60"
            aria-label="Settings"
          >
            <Cog8ToothIcon className="w-5 h-5" />
          </button>
          <div className="relative">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt="User Avatar"
                width={50}
                height={50}
                className="rounded-full w-8 h-8 hover:cursor-pointer"
                aria-label="Account"
                onMouseEnter={() => setShowUserModal(true)}
                onMouseLeave={() => setShowUserModal(false)}
              />
            ) : (
              <UserCircleIcon className="w-6 h-6 text-muted-foreground" />
            )}

            <AnimatePresence>
              {showUserModal && (
                <motion.div
                  className="absolute right-0 mr-md top-8 -translate-y-1/2 bg-popover text-popover-foreground rounded-lg shadow-xl p-md w-40 z-50"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onMouseEnter={() => setShowUserModal(true)}
                  onMouseLeave={() => setShowUserModal(false)}
                >
                  <div className="flex flex-col items-center space-y-sm">
                    {user?.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt="User Avatar"
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="w-12 h-12 text-muted-foreground" />
                    )}

                    <div className="text-center">
                      <h2 className="text-sm font-semibold">
                        {user?.user_name || "User Profile"}
                      </h2>
                      <p className="text-xs text-muted-foreground truncate max-w-full">
                        {user?.email}
                      </p>
                    </div>

                    <button
                      onClick={logout}
                      className="w-full bg-destructive text-destructive-foreground rounded-md py-xs text-xs hover:bg-destructive/90 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-[10px]">
        {/* Email Info */}
        <div className="px-md py-sm pr-md flex items-center justify-between border-b border-border">
          <div className="flex items-center space-x-md overflow-hidden mr-md flex-shrink min-w-0">
            <span className="text-muted-foreground w-5 h-5 flex items-center justify-center flex-shrink-0">
              @
            </span>
            <span className="text-sm font-medium truncate text-foreground">
              {user?.email || "Not logged in"}
            </span>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              className="text-muted-foreground hover:text-foreground rounded-full hover:bg-accent relative"
              onMouseEnter={() => setShowInfoMessage(true)}
              onMouseLeave={() => setShowInfoMessage(false)}
            >
              <InformationCircleIcon className="w-5 h-5 text-muted-foreground" />
              <AnimatePresence>
                {showInfoMessage && (
                  <motion.div
                    className="absolute right-0 translate-x-1/2 top-full mt-md bg-popover text-popover-foreground px-md py-md-y rounded text-xs shadow-md z-10 w-40"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {`You are currently on the free plan. Upgrade anytime for more benefits!`}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            <button
              className="text-muted-foreground hover:text-foreground rounded-full hover:bg-accent cursor-pointer relative"
              onClick={handleCopyEmail}
              title="Copy email to clipboard"
              disabled={!user?.email}
            >
              <DocumentDuplicateIcon className="w-5 h-5" />
              <AnimatePresence>
                {showCopiedMessage && (
                  <motion.div
                    className="absolute right-0 top-full mt-md bg-popover text-popover-foreground px-md py-md-y rounded text-xs shadow-md z-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    Copied!
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-b border-border">
          <nav className="">
            <button
              onClick={() => {
                setMode("discover");
                setSelectedSender(null);
                setSelectedMail(null);
              }}
              className="flex items-center space-x-md px-md py-sm hover:bg-accent rounded text-sm text-foreground"
            >
              <SquaresPlusIcon className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Discover</span>
            </button>
            <button
              onClick={() => {
                setMode("bookmarks");
                setSelectedSender(null);
                setSelectedMail(null);
              }}
              className="flex items-center space-x-md px-md py-sm hover:bg-accent rounded text-sm text-foreground"
            >
              <BookmarkIcon className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Bookmarks</span>
            </button>
          </nav>
        </div>

        {/* Inbox */}
        <Inbox />
      </div>

      <div
        className={`absolute top-0 right-[-2px] w-[2px] h-full ${isDraggingRef.current ? 'bg-primary/50' : 'bg-primary/25'} cursor-col-resize transform translate-x-0`}
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      />
    </div>
  );
};

export default Sidebar;
