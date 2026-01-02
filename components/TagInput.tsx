"use client";

import { useState, useRef, useEffect } from "react";
import { FiX } from "react-icons/fi";

type TagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
};

export default function TagInput({
  tags,
  onChange,
  suggestions = [],
  placeholder = "Add tags...",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input and exclude already added tags
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion) &&
      inputValue.trim() !== ""
  );

  useEffect(() => {
    setShowSuggestions(filteredSuggestions.length > 0 && inputValue.trim() !== "");
  }, [inputValue, filteredSuggestions.length]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
      setInputValue("");
      setShowSuggestions(false);
      setSelectedIndex(0);
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelectedIndex(0);
  };

  return (
    <div className="relative">
      {/* Tags container */}
      <div className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-black px-3 py-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/60">
        {/* Tag chips */}
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="rounded-full p-0.5 transition-colors hover:bg-emerald-500/20"
            >
              <FiX className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
        />
      </div>

      {/* Autocomplete suggestions */}
      {showSuggestions && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-black shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addTag(suggestion)}
              className={`w-full px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                index === selectedIndex
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Helper text */}
      <p className="mt-1.5 text-xs text-slate-500">
        Press Enter or comma to add tags
      </p>
    </div>
  );
}
