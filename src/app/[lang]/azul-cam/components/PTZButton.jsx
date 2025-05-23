"use client";
import React from "react";

export default function PTZButton({ Icon, onDown, onUp, style = "" }) {
  return (
    <button
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      className={`absolute bg-black/50 p-2 rounded-full active:bg-black/70 text-white pointer-events-auto ${style}`}
    >
      <Icon className="w-6 h-6" />
    </button>
  );
}
