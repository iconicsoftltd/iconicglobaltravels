"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { VscTriangleLeft } from "react-icons/vsc";
import useDropdown from "@/hooks/useDropdown";
import i18n from "@/utils/i18n";
import { useLocaleContext } from "@/hooks/useLocaleContext"; // optional if you use it

const LanguageSelector = () => {
  const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdown();
  const { locale } = useLocaleContext?.() || {}; // fallback in case context not used
  const [selectedLanguage, setSelectedLanguage] = useState(
    locale === "bn" ? "Bangla" : "English"
  );

  const handleLanguageChange = (lang: "en" | "bn") => {
    setSelectedLanguage(lang === "en" ? "English" : "Bangla");
    i18n.changeLanguage(lang);
    setDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 border rounded-full border-white hover:bg-white/20 transition duration-200 cursor-pointer"
      >
        <span className="w-6 h-6 flex items-center justify-center">
          <FcGoogle className="w-full h-full" />
        </span>
        <span className="text-sm font-medium">{selectedLanguage}</span>
        <VscTriangleLeft
          className={`w-3 h-3 transition-transform ${
            dropdownOpen ? "rotate-90" : "-rotate-90"
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute left-0 mt-2 w-36 bg-white text-gray-800 shadow-xl rounded-lg z-10 overflow-hidden">
          <button
            onClick={() => handleLanguageChange("en")}
            className={`block px-4 py-2 w-full text-left text-sm hover:bg-gray-100 ${
              selectedLanguage === "English" ? "bg-gray-100 font-semibold" : ""
            }`}
          >
            English
          </button>

          <button
            onClick={() => handleLanguageChange("bn")}
            className={`block px-4 py-2 w-full text-left text-sm hover:bg-gray-100 ${
              selectedLanguage === "Bangla" ? "bg-gray-100 font-semibold" : ""
            }`}
          >
            বাংলা
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
