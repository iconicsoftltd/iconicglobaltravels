import React, { useState, useEffect, useMemo } from "react";
import Select, { MultiValue } from "react-select";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  name: string;
  label?: string;
  options: Option[];
  defaultValue?: Option[];
  onChange: (selectedValues: Option[]) => void;
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  name,
  options,
  defaultValue = [],
  onChange,
  disabled,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Option[]>(defaultValue);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setSelectedOptions(defaultValue);
  }, [defaultValue]);

  const handleChange = (newValue: MultiValue<Option>) => {
    const selected = Array.from(newValue);
    setSelectedOptions(selected);
    onChange(selected);
  };

  const handleInputChange = (input: string) => {
    setSearchInput(input);
  };

  const filteredAndSortedOptions = useMemo(() => {
    const lowerSearch = searchInput.toLowerCase();
    return [...options]
      .filter((opt) =>
        opt.label.toLowerCase().includes(lowerSearch)
      )
      .sort((a, b) => {
        const aLabel = a.label.toLowerCase();
        const bLabel = b.label.toLowerCase();
        const aStarts = aLabel.startsWith(lowerSearch);
        const bStarts = bLabel.startsWith(lowerSearch);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aLabel.localeCompare(bLabel);
      });
  }, [options, searchInput]);

  return (
    <div>
      <Select
        isMulti
        name={name}
        options={filteredAndSortedOptions}
        className="basic-multi-select"
        classNamePrefix="select"
        onChange={handleChange}
        value={selectedOptions}
        isSearchable
        placeholder="Search and select..."
        onInputChange={handleInputChange}
        isDisabled={disabled}
      />
    </div>
  );
};

export default MultiSelect;
