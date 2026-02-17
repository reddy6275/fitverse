"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: number;
    onChange: (value: number) => void;
    unit?: string;
    allowDecimals?: boolean;
}

export function NumberInput({
    value,
    onChange,
    unit,
    className,
    allowDecimals = false,
    ...props
}: NumberInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [localValue, setLocalValue] = useState("");

    useEffect(() => {
        if (!isFocused) {
            setLocalValue(value === 0 ? "" : value.toString());
        }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        let cleanValue = rawValue.replace(allowDecimals ? /[^0-9.]/g : /[^0-9]/g, "");

        // Remove leading zeros
        if (cleanValue.length > 1 && cleanValue.startsWith("0") && cleanValue[1] !== ".") {
            cleanValue = cleanValue.replace(/^0+/, "");
        }

        setLocalValue(cleanValue);

        const numValue = allowDecimals ? parseFloat(cleanValue) : parseInt(cleanValue);
        onChange(isNaN(numValue) ? 0 : numValue);
    };

    const getDisplayValue = () => {
        if (isFocused) return localValue;
        if (value === 0) return "";
        return unit ? `${value} ${unit}` : value.toString();
    };

    return (
        <Input
            {...props}
            type="text"
            className={cn("text-center", className)}
            value={getDisplayValue()}
            onChange={handleChange}
            onFocus={() => {
                setIsFocused(true);
                setLocalValue(value === 0 ? "" : value.toString());
            }}
            onBlur={() => setIsFocused(false)}
        />
    );
}
