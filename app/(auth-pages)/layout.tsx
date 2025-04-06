"use client";
import "./auth.css";
import React from "react";

import Image from "next/image";
interface AuthLayoutProps {
  children: React.ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="hidden relative overflow-hidden  md:w-1/2 md:flex items-center border justify-center">
        <svg
          style={{ left: "20%", top: "-35%", width: "65%", height: "65%" }}
          className="background-circle"
          viewBox="0 0 1040 1040"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M520 808.889C679.549 808.889 808.889 679.549 808.889 520C808.889 360.451 679.549 231.111 520 231.111C360.451 231.111 231.111 360.451 231.111 520C231.111 679.549 360.451 808.889 520 808.889ZM520 1040C807.188 1040 1040 807.188 1040 520C1040 232.812 807.188 0 520 0C232.812 0 0 232.812 0 520C0 807.188 232.812 1040 520 1040Z"
          />
        </svg>
        <svg
          style={{ left: "-10%", top: "82%", width: "35%", height: "35%" }}
          className="background-circle"
          viewBox="0 0 1040 1040"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M520 808.889C679.549 808.889 808.889 679.549 808.889 520C808.889 360.451 679.549 231.111 520 231.111C360.451 231.111 231.111 360.451 231.111 520C231.111 679.549 360.451 808.889 520 808.889ZM520 1040C807.188 1040 1040 807.188 1040 520C1040 232.812 807.188 0 520 0C232.812 0 0 232.812 0 520C0 807.188 232.812 1040 520 1040Z"
          />
        </svg>

        <div className="image-row">
          <div className="image-logo">
            <Image
              src="/logo-lg.png"
              alt="Feedly logo"
              width={200}
              height={200}
              className="w-full h-full object-contain dark:invert"
            />
          </div>
        </div>
      </div>

      <div className="content-container">
        <div className="content">
          <img
            alt="Feedly logo"
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDEiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MSA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yMi44NzEzIDYuMTIxMTNDMjEuMzY2MiA0LjYyNjI5IDE4LjkwMyA0LjYyNjI5IDE3LjM5NzggNi4xMjExM0wzLjY0NDYgMTkuNzc4OEMyLjEzOTMgMjEuMjczOCAyLjEzOTMgMjMuNzE5NiAzLjY0NDYgMjUuMjE0NUwxMy40NTg0IDM0Ljk2MDNDMTQuMTQxOSAzNS41NTE0IDE1LjAzNSAzNS45MDk4IDE2LjAxMjYgMzUuOTA5OEgyNC4yNTcxQzI1LjMzMTQgMzUuOTA5OCAyNi4zMDM5IDM1LjQ3NzMgMjcuMDA3OCAzNC43Nzg0TDM2LjYzMTYgMjUuMjIxMkMzOC4xMzY5IDIzLjcyNjUgMzguMTM2OSAyMS4yODA0IDM2LjYzMTYgMTkuNzg1NkwyMi44NzEzIDYuMTIxMTNaIiBmaWxsPSIjMkJCMjRDIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjIuNDg5NyAzMS4wNjU5TDIxLjExNjcgMzIuNDI5NEMyMS4wMTYzIDMyLjUyOTIgMjAuODc3NiAzMi41OTA5IDIwLjcyNDUgMzIuNTkwOUgxOS41NDhDMTkuNDA4NCAzMi41OTA5IDE5LjI4MTQgMzIuNTM5NiAxOS4xODM1IDMyLjQ1NTRMMTcuNzgzNiAzMS4wNjQ4QzE3LjU2ODggMzAuODUxOCAxNy41Njg4IDMwLjUwMjYgMTcuNzgzNiAzMC4yODk2TDE5Ljc0NTYgMjguMzQwOUMxOS45NjA1IDI4LjEyNzkgMjAuMzEyIDI4LjEyNzkgMjAuNTI2NSAyOC4zNDA5TDIyLjQ4OTcgMzAuMjkwNEMyMi43MDQ2IDMwLjUwMzcgMjIuNzA0NiAzMC44NTI2IDIyLjQ4OTcgMzEuMDY1OVpNMjIuNDg5NyAyMi44OTE2TDE3LjAwMDcgMjguMzQyNEMxNi45MDA1IDI4LjQ0MjEgMTYuNzYxNiAyOC41MDM2IDE2LjYwODUgMjguNTAzOEgxNS40MzIxQzE1LjI5MyAyOC41MDM4IDE1LjE2NTMgMjguNDUyNiAxNS4wNjgxIDI4LjM2ODJMMTMuNjY3NyAyNi45Nzc5QzEzLjQ1MjcgMjYuNzY0NSAxMy40NTI3IDI2LjQxNTYgMTMuNjY3NyAyNi4yMDIzTDE5Ljc0NTYgMjAuMTY2NkMxOS45NjA1IDE5Ljk1MzIgMjAuMzEyIDE5Ljk1MzIgMjAuNTI2OCAyMC4xNjY2TDIyLjQ4OTcgMjIuMTE2MUMyMi43MDQ2IDIyLjMyOTQgMjIuNzA0NiAyMi42NzgzIDIyLjQ4OTcgMjIuODkxNlpNMjIuNDg5NyAxNC43MTY5TDEyLjg4NDkgMjQuMjU0N0MxMi43ODQ1IDI0LjM1NDUgMTIuNjQ1NSAyNC40MTYzIDEyLjQ5MjYgMjQuNDE2M0gxMS4zMTYzQzExLjE3NjkgMjQuNDE2MyAxMS4wNDkzIDI0LjM2NTIgMTAuOTUyIDI0LjI4MDhMOS41NTE3MiAyMi44OTA0QzkuMzM2OTMgMjIuNjc3MyA5LjMzNjkzIDIyLjMyODIgOS41NTE3MiAyMi4xMTQ5TDE5Ljc0NTYgMTEuOTkxOUMxOS45NjA1IDExLjc3ODcgMjAuMzExNiAxMS43Nzg3IDIwLjUyNjUgMTEuOTkxOUwyMi40ODk3IDEzLjk0MTZDMjIuNzA0NiAxNC4xNTQ3IDIyLjcwNDYgMTQuNTAzOCAyMi40ODk3IDE0LjcxNjlaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K"
            className="mobile-logo"
          />
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
